import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

const mockUsers = ["Annie", "Mary", "Louis", "Noah", "James"];

export default function AddPeoplePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);


  const toggleSelect = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000", "#273166", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Add people to album</Text>

      <TouchableOpacity
  style={styles.addNewBtn}
  onPress={() => router.push("/(app)/dedicates/created-dedicates/content-maps/photos/three-dots/add-people/AddMorePeople")}
>
  <Text style={styles.plus}>＋</Text>
</TouchableOpacity>

      <Text style={styles.subtitle}>
        Select contacts to add to the album. Tap the plus icon to add someone new.
      </Text>

      <FlatList
        data={mockUsers}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item);
          return (
            <TouchableOpacity
              onPress={() => toggleSelect(item)}
              style={[styles.userItem, isSelected && styles.userItemSelected]}
            >
              <Text style={styles.userText}>@{item}</Text>
              <View style={styles.radioOuter}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        }}
      />

<TouchableOpacity
  style={[styles.submitBtn, selected.length === 0 && { opacity: 0.4 }]}
  disabled={selected.length === 0}
  onPress={() => {
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      router.back(); // of gebruik router.push() als je een specifieke pagina wil
    }, 8000); // 12 seconden
  }}
>
  <Text style={styles.submitText}>Add to photo’s</Text>
</TouchableOpacity>
{showPopup && (
  <View style={styles.popup}>
    <Text style={styles.popupText}>
      New people are added to the album. Click on the three dots to see the new members.
    </Text>
  </View>
)}

    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 20,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
  subtitle: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 18,
    marginTop: 88,
    textAlign: "left",
    paddingHorizontal: 16,
  },
  addNewBtn: {
    position: "absolute",
    right: 16,
    top: 100,
    zIndex: 10,
  },
  plus: { fontSize: 32, color: "#fff" },
  userItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userItemSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  userText: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 18,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FEEDB6",
  },
  submitBtn: {
    
    backgroundColor: "#FEEDB6",
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 105,
    marginTop: 16,
  },
  submitText: {
    color: "#11152A",
    fontFamily: "Alice-Regular",
    fontSize: 18,
    textAlign: "center",
  },
  popup: {
    position: "absolute",
    bottom: 410,
    left: 40,
    right: 40,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
    alignItems: "center",
    zIndex: 100,
  },
  popupText: {
    color: "#11152A",
    fontFamily: "Alice-Regular",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 24,
  },
  
});
