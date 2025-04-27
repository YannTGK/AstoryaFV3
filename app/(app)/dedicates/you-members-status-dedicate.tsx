import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import useAuthStore from "@/lib/store/useAuthStore";

export default function YouMembersStatusDedicate() {
  const router = useRouter();
  const { user } = useAuthStore(); // Gebruik de ingelogde user info

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Back button */}
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

      {/* Titel */}
      <Text style={styles.title}>Members</Text>

      {/* Profiel */}
      <View style={styles.profileWrapper}>
        <View style={styles.avatar} />
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
      </View>

      {/* Status */}
      <View style={styles.statusWrapper}>
        <Text style={styles.statusLabel}>Status</Text>
        <View style={styles.statusInput}>
          <Text style={styles.statusText}>Admin</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  profileWrapper: {
    alignItems: "center",
    marginTop: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FEEDB6",
    marginBottom: 16,
  },
  name: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 20,
    textAlign: "center",
  },
  username: {
    color: "#ccc",
    fontFamily: "Alice-Regular",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  statusWrapper: {
    marginTop: 40,
    marginHorizontal: 24,
  },
  statusLabel: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 16,
    marginBottom: 10,
  },
  statusInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statusText: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#11152A",
  },
});
