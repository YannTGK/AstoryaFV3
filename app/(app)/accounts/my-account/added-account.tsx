import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { Entypo, Feather } from "@expo/vector-icons";

const accounts = [
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

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Terugknop */}
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
      <Text style={styles.title}>Added accounts</Text>

      {/* Sectie: Accounts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Accounts</Text>
          <TouchableOpacity>
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {accounts.map((item) => (
          <View style={styles.accountItem} key={item.id}>
            <View style={styles.avatarPlaceholder} />
            <Text style={styles.username}>{item.username}</Text>
            <TouchableOpacity style={styles.deleteButton}>
              <Feather name="trash-2" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Sectie: Groups */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Groups</Text>
          <TouchableOpacity>
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {groups.map((group) => (
          <View style={styles.groupItem} key={group.id}>
            <Text style={styles.groupName}>{group.name}</Text>
            <TouchableOpacity>
              <Entypo name="dots-three-vertical" size={16} color="#000" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 30,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
  },
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
  groupItem: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  groupName: {
    color: "#000",
    fontFamily: "Alice-Regular",
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
  
});
