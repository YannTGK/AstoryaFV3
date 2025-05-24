import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import useAuthStore from "@/lib/store/useAuthStore";

// SVG imports
import AccountIcon from "@/assets/images/svg-icons/account-icon.svg";
import SettingsIcon from "@/assets/images/svg-icons/settings-icon.svg";
import PrivacyIcon from "@/assets/images/svg-icons/privacy-icon.svg";
import ContactIcon from "@/assets/images/svg-icons/contact-icon.svg";
import FaqIcon from "@/assets/images/svg-icons/faq-icon.svg";
import CopyIcon from "@/assets/images/svg-icons/copy-icon.svg";

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    logout();
    router.replace("/(auth)/entry");
  };

  const handleNavigate = (path: string) => {
    if (Platform.OS === "ios") {
      if (path.startsWith("http")) return Linking.openURL(path);
      return router.push(path as any);
    }
    if (path.startsWith("http")) {
      return Linking.openURL(
        `https://your-android-wrapping-service?url=${encodeURIComponent(path)}`
      );
    }
    return router.push(path as any);
  };

  const copyActivationCode = async () => {
    const code = user?.activationCode ?? "456789";
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar} />
          <Text style={styles.name}>
            {user?.firstName?.toUpperCase()} {user?.lastName?.toUpperCase()}
          </Text>
        </View>

        <View style={styles.separator} />

        {/* Menu links */}
        <AccountLink
          icon={<AccountIcon width={22} height={22} />}
          label="Account"
          onPress={() => handleNavigate("/accounts/account2")}
        />
        <AccountLink
          icon={<SettingsIcon width={22} height={22} />}
          label="Settings"
          onPress={() => handleNavigate("/accounts/settings/settings")}
        />
        <AccountLink
          icon={<PrivacyIcon width={22} height={22} />}
          label="Privacy"
          onPress={() =>
            handleNavigate("/accounts/settings/privacy-policy/main-page")
          }
        />
        <AccountLink
          icon={<ContactIcon width={22} height={22} />}
          label="Contact"
          onPress={() =>
            handleNavigate("https://astorya.be/paginas/contact.html")
          }
        />
        <AccountLink
          icon={<FaqIcon width={22} height={22} />}
          label="FAQ"
          onPress={() => handleNavigate("https://astorya.be/paginas/faq.html")}
        />

        {/* Activation Code Row */}
        <View style={styles.activationRowHorizontal}>
          <Text style={styles.activationLabel}>Code star activation</Text>
          <View style={styles.activationCodeBox}>
            <Text style={styles.activationCode}>
              {user?.activationCode ?? "456789"}
            </Text>
            <TouchableOpacity
              onPress={copyActivationCode}
              style={styles.copyBtn}
            >
              <CopyIcon width={18} height={18} />
            </TouchableOpacity>
          </View>
        </View>

        {copied && <Text style={styles.copiedText}>Code copied</Text>}
      </View>

      {/* Fixed buttons at bottom */}
      <View style={styles.footerButtons}>
        <TouchableOpacity style={styles.upgradeBtn}>
          <Svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            style={{ marginRight: 10 }}
          >
            <Path
              d="M12 2l2.39 7.26H22l-6.19 4.54L17.82 22 12 17.77 6.18 22l1.63-8.2L2 9.26h7.61L12 2z"
              fill="#fff"
            />
          </Svg>
          <Text style={styles.upgradeText}>Upgrade</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AccountLink({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.linkRow} onPress={onPress}>
      {icon}
      <Text style={styles.linkLabel}>{label}</Text>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 6l6 6-6 6"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 160,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FEEDB6",
    marginRight: 16,
  },
  name: { fontSize: 18, color: "#fff", fontFamily: "sunroll"},
  separator: {
    height: 1,
    backgroundColor: "#fff",
    opacity: 0.15,
    marginBottom: 24,
  },
  linkRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  linkLabel: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Alice-Regular",
    flex: 1,
    marginLeft: 14,
  },
  activationRowHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    paddingTop: 12,
  },
  activationLabel: { color: "#fff", fontSize: 16, fontFamily: "Alice-Regular" },
  activationCodeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activationCode: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Alice-Regular",
    marginRight: 8,
  },
  copyBtn: { padding: 4 },
  copiedText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Alice-Regular",
    marginTop: 8,
    textAlign: "right",
  },
  footerButtons: { position: "absolute", bottom: 24, left: 24, right: 24 },
  upgradeBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#11152A",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  upgradeText: { color: "#fff", fontSize: 16, fontFamily: "Alice-Regular" },
  logoutBtn: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 80,
  },
  logoutText: {
    textAlign: "center",
    color: "#000",
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
});
