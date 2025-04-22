import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

const members = [
    { id: "1", username: "You" },
    { id: "2", username: "@Elisabeth_251" },
  ];
  

export default function GroupMembers() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
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

      <Text style={styles.title}>Members</Text>

      {members.map((member) => (
        <View key={member.id} style={styles.memberItem}>
        <View style={styles.avatarPlaceholder} />
        <Text style={styles.memberName}>{member.username}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 30,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 15,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ccc",
    marginRight: 12,
    
  },
  memberItem: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
  },
  memberName: {
    fontSize: 20,
    color: "#000",
    fontFamily: "Alice-Regular",
  },
  
});
