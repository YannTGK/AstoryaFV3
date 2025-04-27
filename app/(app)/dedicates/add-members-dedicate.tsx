import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from "react-native";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import SearchIcon from "@/assets/images/svg-icons/search.svg";
import CloseRedIcon from "@/assets/images/svg-icons/close-red.svg";

export default function AddMembersDedicate() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const users = [
    "Elisabeth_251",
    "Elisabeth_28",
    "Elisabeth_20x",
    "anna",
    "anna_28",
    "anna_20x",
  ];

  const handleSelectUser = (user: string) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.filter(u => u !== user));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveSelected = (user: string) => {
    setSelectedUsers(selectedUsers.filter(u => u !== user));
  };

  const handleAddMembers = () => {
    console.log("Added members:", selectedUsers);
    router.back();
  };

  const filteredUsers = users.filter(u => u.toLowerCase().includes(search.toLowerCase()));

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
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>

      {/* Send invitation button rechtsboven */}
      <TouchableOpacity style={styles.invitationBtn}>
        <Text style={styles.invitationText}>Send invitation</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add members</Text>

      <Text style={styles.subtitle}>
        To add new people who aren’t in your contacts, enter their username to add them to your contact list or send them an invitation.
      </Text>

      {/* Search field */}
      <View style={styles.searchWrapper}>
        <SearchIcon width={18} height={18} style={styles.searchIcon} />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Body met geselecteerden en resultaten */}
      <View style={{ flex: 1 }}>
        {/* Selected members */}
        {selectedUsers.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedScroll}
            contentContainerStyle={{ paddingLeft: 24 }}
          >
            {selectedUsers.map((user, idx) => (
              <View key={idx} style={styles.selectedUser}>
                <View style={styles.avatarSmall} />
                <Text style={styles.selectedUsername}>@{user}</Text>
                <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemoveSelected(user)}>
                  <CloseRedIcon width={18} height={18} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Resultaten */}
        <ScrollView style={styles.resultsScroll}>
          {filteredUsers.map((user, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.resultItem,
                selectedUsers.includes(user) && styles.resultItemSelected,
              ]}
              onPress={() => handleSelectUser(user)}
            >
              <View style={styles.avatarSmall} />
              <Text style={styles.resultText}>@{user}</Text>
            </TouchableOpacity>
          ))}

          {/* Padding onderaan zodat Add button niet overlapt */}
          <View style={{ height: 150 }} />
        </ScrollView>
      </View>

      {/* Add button */}
      <View style={styles.fixedButtonWrapper}>
        <TouchableOpacity
          style={[styles.button, !selectedUsers.length && styles.buttonDisabled]}
          disabled={selectedUsers.length === 0}
          onPress={handleAddMembers}
        >
          <Text style={[styles.buttonText, !selectedUsers.length && styles.buttonTextDisabled]}>
            Add
          </Text>
        </TouchableOpacity>
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
  invitationBtn: {
    position: "absolute",
    top: 95,
    right: 20,
    backgroundColor: "#FEEDB6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  invitationText: {
    color: "#11152A",
    fontFamily: "Alice-Regular",
    fontSize: 13,
  },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  subtitle: {
    marginTop: 75,
    marginHorizontal: 24,
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 30,
    paddingHorizontal: 14,
    marginTop: 20,
    marginHorizontal: 24,
    height: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#11152A",
    marginTop: 2,
  },
  selectedScroll: {
    marginTop: 20,
  },
  selectedUser: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff22",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    marginRight: 8,
  },
  selectedUsername: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 14,
    marginRight: 12,
  },
  removeBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 2,
  },
  resultsScroll: {
    marginTop: 20,
    marginHorizontal: 24,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff22",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultItemSelected: {
    borderColor: "#FEEDB6",
    borderWidth: 1.5,
  },
  resultText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#fff",
  },
  fixedButtonWrapper: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
  },
  button: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#FEEDB6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#11152A",
    fontFamily: "Alice-Regular",
    fontSize: 16,
    textAlign: "center",
  },
  buttonTextDisabled: {
    /*color: "#999",*/
  },
});
