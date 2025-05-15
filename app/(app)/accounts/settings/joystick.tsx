import React, { useState } from "react";
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
import { Switch } from "react-native";
import Slider from "@react-native-community/slider";

// SVG ICONS
import SpeedIcon from "@/assets/images/svg-icons/speed.svg";
import JoystickIcon from "@/assets/images/svg-icons/joystick-setting.svg";

export default function SpeedJoystickSettingsScreen() {
  const router = useRouter();
  const [speed, setSpeed] = useState(10);
  const [joystickLeft, setJoystickLeft] = useState(false);
  const [joystickRight, setJoystickRight] = useState(true);

  const toggleJoystick = (side: "left" | "right") => {
    setJoystickLeft(side === "left");
    setJoystickRight(side === "right");
  };

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

      {/* Content */}
      <View style={styles.container}>
        <View style={styles.iconTitleRow}>
          <SpeedIcon width={20} height={20} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Speed</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Adjust the speed at which you navigate through the starry sky.
        </Text>

        <View style={styles.sliderContainer}>
          <Slider
            minimumValue={1}
            maximumValue={20}
            step={1}
            value={speed}
            onValueChange={setSpeed}
            minimumTrackTintColor="#FEEDB6"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#FEEDB6"
            style={{ flex: 1 }}
          />
          <Text style={styles.speedValue}>{speed}</Text>
        </View>

        <View style={[styles.iconTitleRow, { marginTop: 32 }]}>
          <JoystickIcon width={20} height={20} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Joystick</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Do you want the joystick to be on the right side of the screen or the left?
        </Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Left on the screen</Text>
          <Switch
            value={joystickLeft}
            onValueChange={() => toggleJoystick("left")}
            trackColor={{ false: "#888", true: "#FEEDB6" }}
            thumbColor={Platform.OS === "android" ? (joystickLeft ? "#000" : "#fff") : ""}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Right on the screen</Text>
          <Switch
            value={joystickRight}
            onValueChange={() => toggleJoystick("right")}
            trackColor={{ false: "#888", true: "#FEEDB6" }}
            thumbColor={Platform.OS === "android" ? (joystickRight ? "#000" : "#fff") : ""}
          />
        </View>
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
  iconTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
  sectionDescription: {
    fontSize: 15,
    color: "#fff",
    fontFamily: "Alice-Regular",
    lineHeight: 22,
    marginBottom: 16,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  speedValue: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Alice-Regular",
    flex: 1,
    paddingRight: 12,
  },
});
