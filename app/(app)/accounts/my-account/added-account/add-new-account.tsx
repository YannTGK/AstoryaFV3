import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const MOCK_USERS = [
  { id: "1", username: "@Elisabeth_251" },
  { id: "2", username: "@Elisabeth_28" },
  { id: "3", username: "@Elisabeth_20x" },
];

export default function AddAccountScreen() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: string; username: string } | null>(null);

  const filteredUsers = MOCK_USERS.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (user: { id: string; username: string }) => {
    setSelectedUser(user);
  };

  const handleRemoveSelected = () => {
    setSelectedUser(null);
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Text style={styles.title}>Added accounts</Text>
      <Text style={styles.infoText}>
        To add new people who aren’t in your contacts, enter their username to
        add them to your contact list or send them an invitation.
      </Text>

      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search"
          placeholderTextColor="#999"
        />
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
      </View>

      {selectedUser && (
        <View style={styles.selectedUserContainer}>
          <View style={styles.selectedUserAvatarWrapper}>
            <View style={styles.selectedUserAvatar} />
            <TouchableOpacity
              style={styles.removeSelectedUser}
              onPress={handleRemoveSelected}
            >
              <Feather name="x" size={16} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.selectedUsername}>{selectedUser.username}</Text>
        </View>
      )}

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.userItem,
              selectedUser?.id === item.id && styles.userItemSelected,
            ]}
            onPress={() => handleSelect(item)}
          >
            <View style={styles.avatar} />
            <Text style={styles.username}>{item.username}</Text>
            {selectedUser?.id === item.id && (
              <Feather name="check" size={16} color="#006F45" />
            )}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        disabled={!selectedUser}
        style={[styles.addButton, selectedUser && styles.addButtonActive]}
      >
        <Text
          style={[styles.addButtonText, selectedUser && styles.addButtonTextActive]}
        >
          Add
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, paddingTop: 60 },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontFamily: "Alice-Regular",
    color: "#fff",
    marginBottom: 20,
  },
  infoText: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 14,
    paddingHorizontal: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  searchWrapper: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#000",
  },
  searchIcon: {
    marginLeft: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  selectedUserContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  selectedUserAvatarWrapper: {
    position: "relative",
  },
  selectedUserAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
  },
  removeSelectedUser: {
    position: "absolute",
    right: -6,
    bottom: -6,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  selectedUsername: {
    marginTop: 8,
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  userItemSelected: {
    backgroundColor: "#FEEDB6",
  },
  username: {
    flex: 1,
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#000",
  },
  addButton: {
    marginTop: 10,
    marginHorizontal: 20,
    backgroundColor: "#ccc",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonActive: {
    backgroundColor: "#FEEDB6",
  },
  addButtonText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#888",
  },
  addButtonTextActive: {
    color: "#000",
  },
});
