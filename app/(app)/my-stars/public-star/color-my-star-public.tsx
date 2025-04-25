// /my-stars/private-star/PrivateMyStar.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import StarView from "@/components/stars/StarView";

const starOptions = [
  { name: "PEACE",        emissive: 0xffffff },
  { name: "HOPE",         emissive: 0xffedaa },
  { name: "SUCCESS",      emissive: 0xffb3b3 },
  { name: "WEALTH",       emissive: 0xffc9aa },
  { name: "HEALTH",       emissive: 0xd8ffd8 },
  { name: "OPPORTUNITY",  emissive: 0xaacfff },
  { name: "INSPIRATION",  emissive: 0xe3d1ff },
  { name: "REMEMBRANCE",  emissive: 0xffc1e6 },
];

export default function colorMyStarPublic() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const current = starOptions[index];

  const next = () => setIndex((i) => (i + 1) % starOptions.length);
  const prev = () => setIndex((i) => (i - 1 + starOptions.length) % starOptions.length);

  const handleSelect = () => {
    router.push({
      pathname: "/(app)/my-stars/public-star/chosen-public-star",
      params: {
        name: current.name,
        emissive: current.emissive.toString(),
      },
    });
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#000", "#273166", "#000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>My personal star</Text>
      <Text style={styles.subtitle}>Choose the color of your star that will hold your last wish to the world.</Text>

      {/* 3D */}
      <View style={styles.canvasWrapper}>
        <StarView emissive={current.emissive} rotate key={index} />
      </View>

      {/* Star name + arrows */}
      <View style={styles.nameRow}>
        <TouchableOpacity onPress={prev} style={styles.arrowSide}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        <Text style={styles.starName}>{current.name}</Text>

        <TouchableOpacity onPress={next} style={styles.arrowSide}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M9 6l6 6-6 6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* CTA */}
      <View style={styles.selectButtonWrapper}>
        <TouchableOpacity style={styles.button} onPress={handleSelect}>
          <Text style={styles.buttonText}>Select star</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/*────────────────────────────── styles ──────────────────────────────*/
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
    textAlign: "center",
    paddingHorizontal: 30,
    marginTop: 20,
  },
  canvasWrapper: {
    alignSelf: "center",
    marginTop: 40,
    borderRadius: 20,
    overflow: "hidden",
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