import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

// Icons
import LockIcon from "@/assets/images/svg-icons/lock.svg";
import TermsOfService from "@/assets/images/svg-icons/terms-of-service.svg";
import ArrowIcon from "@/assets/images/svg-icons/arrow-right.svg";

export default function LegalSettingsScreen() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18l-6-6 6-6"
              stroke="#FEEDB6"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Options */}
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/(app)/accounts/settings/privacy-policy/privacy-policy")}
        >
          <View style={styles.rowLeft}>
            <LockIcon width={20} height={20} style={{ marginRight: 10 }} />
            <Text style={styles.label}>Privacy Policy</Text>
          </View>
          <ArrowIcon width={18} height={18} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/(app)/accounts/settings/privacy-policy/terms-of-service")}
        >
          <View style={styles.rowLeft}>
            <TermsOfService width={20} height={20} style={{ marginRight: 10 }} />
            <Text style={styles.label}>Terms Of Service</Text>
          </View>
          <ArrowIcon width={18} height={18} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    height: 44,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
  },
  backBtn: {
    position: "absolute",
    left: 20,
  },
  container: {
    flex: 1,
    paddingTop: 124,
    paddingHorizontal: 16,
  },
  item: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
});
