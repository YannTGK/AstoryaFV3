import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

export default function NotificationSettingsScreen() {
  const router = useRouter();

  const [newMemory, setNewMemory] = useState(false);
  const [receivedInvites, setReceivedInvites] = useState(false);
  const [sharedMemory, setSharedMemory] = useState(false);
  const [starInteraction, setStarInteraction] = useState(false);

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
        <Text style={styles.headerTitle}>Notification</Text>
      </View>

      {/* Content */}
      <View style={styles.container}>
        <Text style={styles.description}>
          Manage when and how you receive updates and reminders.
        </Text>

        <View style={styles.item}>
          <Text style={styles.label}>New memory added</Text>
          <Switch
            value={newMemory}
            onValueChange={setNewMemory}
            trackColor={{ false: "#888", true: "#FEEDB6" }}
            thumbColor={Platform.OS === "android" ? (newMemory ? "#000" : "#fff") : ""}
          />
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Received invitations</Text>
          <Switch
            value={receivedInvites}
            onValueChange={setReceivedInvites}
            trackColor={{ false: "#888", true: "#FEEDB6" }}
            thumbColor={Platform.OS === "android" ? (receivedInvites ? "#000" : "#fff") : ""}
          />
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Be notified when someone shares a memory with you.</Text>
          <Switch
            value={sharedMemory}
            onValueChange={setSharedMemory}
            trackColor={{ false: "#888", true: "#FEEDB6" }}
            thumbColor={Platform.OS === "android" ? (sharedMemory ? "#000" : "#fff") : ""}
          />
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>Receive updates when someone interacts with your star.</Text>
          <Switch
            value={starInteraction}
            onValueChange={setStarInteraction}
            trackColor={{ false: "#888", true: "#FEEDB6" }}
            thumbColor={Platform.OS === "android" ? (starInteraction ? "#000" : "#fff") : ""}
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
  description: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 32,
    fontFamily: "Alice-Regular",
    lineHeight: 22,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Alice-Regular",
    flex: 1,
    paddingRight: 12,
  },
});
