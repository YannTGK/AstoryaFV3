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
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { Entypo, Feather } from "@expo/vector-icons";

const initialAccounts = [
  { id: "1", username: "@Marie-bel" },
  { id: "2", username: "@AnnieJohn" },
  { id: "3", username: "@William_Rodri" },
];

const groups = [
  { id: "1", name: "@Family of 3" },
  { id: "2", name: "@BestFriends" },
  { id: "3", name: "@Family_FatherSide" },
];

export default function AddedAccountsScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; username: string } | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupMenuVisible, setGroupMenuVisible] = useState(false);

  const confirmDelete = () => {
    if (selectedUser) {
      setAccounts((prev) => prev.filter((acc) => acc.id !== selectedUser.id));
      setSelectedUser(null);
      setModalVisible(false);
    }
  };

  const toggleGroupMenu = (groupId: string) => {
    if (selectedGroupId === groupId && groupMenuVisible) {
      setGroupMenuVisible(false);
      setSelectedGroupId(null);
    } else {
      setSelectedGroupId(groupId);
      setGroupMenuVisible(true);
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

      <Text style={styles.title}>Added accounts</Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Accounts</Text>
          <TouchableOpacity>
            <Feather name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {accounts.map((item) => (
          <View style={styles.accountItem} key={item.id}>
            <View style={styles.avatarPlaceholder} />
            <Text style={styles.username}>{item.username}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                setSelectedUser(item);
                setModalVisible(true);
              }}
            >
              <Feather name="trash-2" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Groups</Text>
          <TouchableOpacity>
            <Feather name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {groups.map((group) => (
          <View style={styles.groupItem} key={group.id}>
            <Text style={styles.groupName}>{group.name}</Text>
            <TouchableOpacity onPress={() => toggleGroupMenu(group.id)}>
              <Entypo name="dots-three-vertical" size={16} color="#000" />
            </TouchableOpacity>
            {selectedGroupId === group.id && groupMenuVisible && (
              <View style={styles.groupMenu}>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuText}>See members</Text>
                  <Feather name="users" size={16} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem}>
                  <Text style={styles.menuText}>Delete</Text>
                  <Feather name="trash-2" size={16} color="#000" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>

      <Modal transparent visible={modalVisible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.confirmBox}>
          <Text style={styles.confirmText}>
            Are you sure you want to remove{" "}
            <Text style={{ fontWeight: "bold" }}>{selectedUser?.username}</Text>?
          </Text>
    
          <View style={styles.confirmButtons}>
            <Pressable
              style={[styles.confirmBtn, styles.leftBtn]}
              onPress={() => {
                setModalVisible(false);
                setSelectedUser(null);
              }}
            >
              <Text style={styles.confirmBtnText}>No</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmBtn, styles.rightBtn]}
              onPress={confirmDelete}
            >
              <Text style={[styles.confirmBtnText, { color: "#007AFF" }]}>Yes</Text>
            </Pressable>
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
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: "Alice-Regular", fontSize: 20, color: "#fff" },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  username: {
    flex: 1,
    color: "#000",
    fontFamily: "Alice-Regular",
    fontSize: 14,
  },
  deleteButton: { padding: 4 },
  groupItem: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    position: "relative",
  },
  groupName: {
    color: "#000",
    fontFamily: "Alice-Regular",
    fontSize: 14,
  },
  groupMenu: {
    position: "absolute",
    top: 50,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    minWidth: 130,
  },
  menuText: {
    fontSize: 14,
    fontFamily: "Alice-Regular",
    color: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "100%",
  },
  modalText: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
    color: "#000",
    marginBottom: 20,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalBtn: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalBtnText: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#000",
    textAlign: "center",
  },
  confirmBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "80%",
    overflow: "hidden",
  },
  
  confirmText: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
    color: "#000",
    textAlign: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  
  confirmButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  
  leftBtn: {
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  
  rightBtn: {},
  
  confirmBtnText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#007AFF",
  },  
});
