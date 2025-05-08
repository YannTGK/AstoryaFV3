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
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";

const MOCK_USERS = [
  { id: "1", username: "@Elisabeth_251" },
  { id: "2", username: "@Elisabeth_28" },
  { id: "3", username: "@Elisabeth_20x" },
];

export default function AddAccountScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<{ id: string; username: string }[]>([]);

  const filteredUsers = search.length > 0 ? MOCK_USERS : [];

  const isSelected = (user: { id: string; username: string }) =>
    selectedUsers.find((u) => u.id === user.id);

  const toggleSelectUser = (user: { id: string; username: string }) => {
    if (isSelected(user)) {
      setSelectedUsers((prev) => prev.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers((prev) => [...prev, user]);
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

      <View style={styles.separator} />

      {selectedUsers.length > 0 && (
        <View style={styles.selectedContainer}>
          {selectedUsers.map((user) => (
            <View key={user.id} style={styles.selectedItem}>
              <View style={styles.profileWrapper}>
                <View style={styles.avatarLarge} />
                <TouchableOpacity
                  style={styles.removeIcon}
                  onPress={() =>
                    setSelectedUsers((prev) =>
                      prev.filter((u) => u.id !== user.id)
                    )
                  }
                >
                  <Feather name="x" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.selectedUsername}>{user.username}</Text>
            </View>
          ))}
        </View>
      )}

{search.length > 0 && (
  <FlatList
    data={filteredUsers}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => {
      const selected = isSelected(item);
      return (
        <TouchableOpacity
          style={[styles.userItem, selected && styles.userItemSelected]}
          onPress={() => toggleSelectUser(item)}
        >
          <View style={styles.avatar} />
          <Text style={styles.username}>{item.username}</Text>
          {selected && <Feather name="check" size={16} color="#006F45" />}
        </TouchableOpacity>
      );
    }}
  />
)}


      <TouchableOpacity
        disabled={selectedUsers.length === 0}
        style={[
          styles.addButton,
          selectedUsers.length > 0 && styles.addButtonActive,
        ]}
        onPress={() => {
          router.push({
            pathname: "/accounts/my-account/added-account/group-members",
            params: {
              users: JSON.stringify(selectedUsers), // stuur de data als string
            },
          });
        }}
      >
        <Text
          style={[
            styles.addButtonText,
            selectedUsers.length > 0 && styles.addButtonTextActive,
          ]}
        >
          Add {selectedUsers.length} {selectedUsers.length > 1 ? "people" : "person"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, paddingTop: 60 },
  backBtn: {
    position: "absolute",
    top: 55,
    left: 20,
    zIndex: 10,
  },
  title: {
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    marginBottom: 20,
  },
  infoText: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 18,
    paddingHorizontal: 16,
    textAlign: "left",
    marginTop: 32,
    marginBottom: 24,
  },
  searchWrapper: {
    marginHorizontal: 16,
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
    fontSize: 18,
    color: "#000",
  },
  searchIcon: {
    marginLeft: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "#999",
    marginHorizontal: 0,
    marginTop: 24,
    marginBottom: 24,
  },
  selectedContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
    gap: 32,
  },
  selectedItem: {
    alignItems: "center",
    width: 42,
  },
  profileWrapper: {
    position: "relative",
    width: 50,
    height: 50,
  },
  avatarLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
  },
  removeIcon: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF7466",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  selectedUsername: {
    fontFamily: "Alice-Regular",
    fontSize: 12,
    color: "#fff",
    marginTop: 8,
    textAlign: "center",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  userItemSelected: {
    backgroundColor: "#FEEDB6",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ccc",
    marginRight: 12,
  },
  username: {
    flex: 1,
    fontFamily: "Alice-Regular",
    fontSize: 18,
    color: "#000",
  },
  addButton: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 105, 
    backgroundColor: "#ccc",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  
  addButtonActive: {
    backgroundColor: "#FEEDB6",
  },
  addButtonText: {
    fontFamily: "Alice-Regular",
    fontSize: 18,
    color: "#888",
  },
  addButtonTextActive: {
    color: "#000",
  },
});
