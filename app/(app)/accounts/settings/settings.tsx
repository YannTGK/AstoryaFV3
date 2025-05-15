import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

// SVG icon imports
import NotificationIcon from "@/assets/images/svg-icons/notification.svg";
import JoystickIcon from "@/assets/images/svg-icons/speed.svg";
import LanguageIcon from "@/assets/images/svg-icons/language.svg";
import ArrowIcon from "@/assets/images/svg-icons/arrow-right.svg";

export default function SettingsScreen() {
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

      <View style={styles.container}>
        <TouchableOpacity style={styles.item} onPress={() => router.push("/(app)/accounts/settings/notification")}> 
          <View style={styles.itemLeft}>
            <NotificationIcon width={20} height={20} style={styles.icon} />
            <Text style={styles.label}>Notification</Text>
          </View>
          <ArrowIcon width={14} height={14} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => router.push("/(app)/accounts/settings/joystick")}> 
          <View style={styles.itemLeft}>
            <JoystickIcon width={20} height={20} style={styles.icon} />
            <Text style={styles.label}>Speed & joystick</Text>
          </View>
          <ArrowIcon width={14} height={14} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={() => router.push("/(app)/accounts/settings/language")}> 
          <View style={styles.itemLeft}>
            <LanguageIcon width={20} height={20} style={styles.icon} />
            <Text style={styles.label}>Language</Text>
          </View>
          <ArrowIcon width={14} height={14} />
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
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
  arrow: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
});
