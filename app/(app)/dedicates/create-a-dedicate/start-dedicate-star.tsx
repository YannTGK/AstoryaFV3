import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import StarView from "@/components/stars/StarView";

export default function StartDedicateStar() {
  const router = useRouter();
  const [publicName, setPublicName] = useState("");

  const handleNext = () => {
    if (publicName.trim()) {
      router.push({
        pathname: "/dedicates/create-a-dedicate/color-dedicate-star",
        params: { publicName },
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" /></Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Dedicate star</Text>
      <Text style={styles.subtitle}>
        Create a star for your loved one, a private and timeless tribute. Keep their memory alive and share it with those who matter by adding trusted accounts.
      </Text>

      <View style={styles.canvasWrapper}>
        <StarView emissive={0xffffff} rotate />
      </View>

      <TextInput
        style={styles.nameInput}
        placeholder="First- & lastname"
        placeholderTextColor="#ffffff"
        value={publicName}
        onChangeText={setPublicName}
      />

      <View style={styles.fixedButtonWrapper}>
        <TouchableOpacity
          style={[styles.button, { opacity: publicName.trim() ? 1 : 0.5 }]}
          onPress={handleNext}
          disabled={!publicName.trim()}
        >
          <Text style={styles.buttonText}>Customize star</Text>
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
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  subtitle: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
    textAlign: "left",
    marginTop: 16,
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  canvasWrapper: {
    alignSelf: "center",
    marginTop: 25,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  nameInput: {
    marginTop: 10,
    marginHorizontal: 30,
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    paddingVertical: 8,
    textAlign: "center",
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
  buttonText: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
    textAlign: "center",
    color: "#000",
  },
});
