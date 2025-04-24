import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Feather } from "@expo/vector-icons";

const initialMembers = [
  { id: "1", username: "You" },
  { id: "2", username: "@Elisabeth_251" },
];

export default function GroupMembers() {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ id: string; username: string } | null>(null);

  const confirmDelete = () => {
    if (selectedMember) {
      setMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
      setSelectedMember(null);
      setModalVisible(false);
    }
  };

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
          <TouchableOpacity
            onPress={() => {
              setSelectedMember(member);
              setModalVisible(true);
            }}
          >
            <Feather name="trash-2" size={18} color="#000" />
          </TouchableOpacity>
        </View>
      ))}

<Modal transparent visible={modalVisible} animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.customModalBox}>
      <Text style={styles.customModalText}>
        Are you sure you want to remove{" "}
        <Text style={{ fontWeight: "bold" }}>{selectedMember?.username}</Text>?
      </Text>

      <View style={styles.customModalDivider} />

      <View style={styles.customModalActions}>
        <TouchableOpacity
          style={styles.modalActionBtn}
          onPress={() => {
            setModalVisible(false);
            setSelectedMember(null);
          }}
        >
          <Text style={styles.modalActionTextNo}>No</Text>
        </TouchableOpacity>
        <View style={styles.verticalDivider} />
        <TouchableOpacity style={styles.modalActionBtn} onPress={confirmDelete}>
          <Text style={styles.modalActionTextYes}>Yes</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

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
    justifyContent: "space-between",
    marginBottom: 16,
    marginHorizontal: 16,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    fontFamily: "Alice-Regular",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  customModalBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "85%",
    overflow: "hidden",
  },
  customModalText: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
    color: "#000",
    textAlign: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  customModalDivider: {
    height: 1,
    backgroundColor: "#eee",
  },
  customModalActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 50,
  },
  modalActionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalActionTextNo: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
    color: "#1E3A8A", // Donkerblauw
  },
  modalActionTextYes: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
    color: "#1E3A8A", // Donkerblauw
  },
  verticalDivider: {
    width: 1,
    backgroundColor: "#eee",
    height: "100%",
  }  
});
