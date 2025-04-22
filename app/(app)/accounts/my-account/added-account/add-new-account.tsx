import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

const allUsers = [
  { id: "1", username: "@Elisabeth_251" },
  { id: "2", username: "@Elisabeth_28" },
  { id: "3", username: "@Elisabeth_20x" },
];

export default function AddNewAccount() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const filteredUsers = allUsers.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <Text style={styles.description}>
        To add new people who aren’t in your contacts, enter their username to
        add them to your contact list or send them an invitation.
      </Text>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          placeholder="Search"
          placeholderTextColor="#999"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <View style={styles.results}>
        {filteredUsers.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={[
              styles.userItem,
              selectedUser === user.id && { backgroundColor: "#FEEDB6" },
            ]}
            onPress={() => setSelectedUser(user.id)}
          >
            <View style={styles.avatarPlaceholder} />
            <Text style={styles.username}>{user.username}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: selectedUser ? "#FEEDB6" : "#ccc" }]}
        disabled={!selectedUser}
        onPress={() => {
          // voeg gebruiker toe
        }}
      >
        <Text style={[styles.addBtnText, { color: selectedUser ? "#000" : "#888" }]}>Add</Text>
      </TouchableOpacity>
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
    marginBottom: 16,
  },
  description: {
    fontFamily: "Alice-Regular",
    fontSize: 18,
    color: "#fff",
    textAlign: "left",
    marginHorizontal: 24,
    marginBottom: 16,
    marginTop: 24,
  },
  searchBox: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: "Alice-Regular",
    fontSize: 18,
    color: "#000",
  },
  results: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 15,
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  username: {
    fontFamily: "Alice-Regular",
    fontSize: 18,
    color: "#000",
  },
  addBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 125,
    alignItems: "center",
  },
  addBtnText: {
    fontFamily: "Alice-Regular",
    fontSize: 18,
  },
});
