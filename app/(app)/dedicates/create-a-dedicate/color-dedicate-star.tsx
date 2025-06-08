import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import StarView from "@/components/stars/StarView";

const starOptions = [
  { word: "PEACEFUL",      emissive: 0xffffff, colorHex: "#ffffff" },
  { word: "LIVELY",        emissive: 0xffedaa, colorHex: "#ffedaa" },
  { word: "POWERFUL",      emissive: 0xffb3b3, colorHex: "#ffb3b3" },
  { word: "ENERGETIC",     emissive: 0xffc9aa, colorHex: "#ffc9aa" },
  { word: "CARING",        emissive: 0xd8ffd8, colorHex: "#d8ffd8" },
  { word: "BRAVE",         emissive: 0xaacfff, colorHex: "#aacfff" },
  { word: "CREATIVE",      emissive: 0xe3d1ff, colorHex: "#e3d1ff" },
  { word: "UNFORGETTABLE", emissive: 0xffc1e6, colorHex: "#ffc1e6" },
];

export default function ColorDedicateStar() {
  const router = useRouter();
  const { publicName } = useLocalSearchParams<{ publicName: string }>();
  const [idx, setIdx] = useState(0);

  const option = starOptions[idx];

  const next   = () => setIdx((p) => (p + 1) % starOptions.length);
  const prev   = () => setIdx((p) => (p - 1 + starOptions.length) % starOptions.length);

  const handleSelect = () => {
    router.push({
      pathname: "/dedicates/create-a-dedicate/chosen-dedicate-star",
      params: {
        publicName,
        word: option.word,
        color: option.colorHex,
        emissive: option.emissive.toString(),
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />
      <TouchableOpacity style={{ position: "absolute", top: 50, left: 20 }} onPress={() => router.back()}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} /></Svg>
      </TouchableOpacity>
      <Text style={styles.title}>Dedicate star</Text>
      <Text style={styles.subtitle}>Choose the color of the star you buy in memory of a loved one, a color that reflects who they were.</Text>

      <View style={styles.canvasWrapper}>
        <StarView emissive={option.emissive} rotate />
      </View>

      <View style={styles.nameRow}>
        <TouchableOpacity onPress={prev}><Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} /></Svg></TouchableOpacity>
        <Text style={styles.starName}>{option.word}</Text>
        <TouchableOpacity onPress={next}><Svg width={24} height={24}><Path d="M9 6l6 6-6 6" stroke="#FEEDB6" strokeWidth={2} /></Svg></TouchableOpacity>
      </View>

      <View style={styles.fixedButtonWrapper}>
        <TouchableOpacity style={styles.button} onPress={handleSelect}>
          <Text style={styles.buttonText}>Select star</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  glView: {
    width: 300,
    height: 300,
    backgroundColor: "transparent",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginTop: 15,
  },
  starName: {
    textAlign: "center",
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 20,
  },
  arrowSide: {
    padding: 10,
  },
  selectButtonWrapper: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 2,
  },
  button: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    borderRadius: 12,
    // shadowColor: "#FEEDB6",
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
  fixedButtonWrapper: {          // ← dit is de style
    position: "absolute",
    bottom: 100,                 // 100 px boven de onderrand (pas aan naar smaak)
    left: 20,
    right: 20,
    zIndex: 2,
  },
});
