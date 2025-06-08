// screens/SaveSpace.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import BasicRoomGL from "@/components/rooms/BasicRoomGL";

const { width, height } = Dimensions.get("window");

export default function SaveSpace() {
  const router = useRouter();
  const { starId, roomId } = useLocalSearchParams<{
    starId?: string;
    roomId?: string;
  }>();

  const handleEdit = () => {
    if (!starId || !roomId) {
      alert("Error: Geen ster- of kamer-ID bekend");
      return;
    }
    router.push({
      pathname: "/(app)/my-stars/public-star/space/add-content-space",
      params: { starId, roomId },    // ← pass both
    });
  };

  const handleSpaces = () => {
    router.push({
      pathname: "/(app)/my-stars/public-star/space/created-space",
      params: { starId },
    });
  };


  const handleBack = () => {
    router.push({
      pathname: "/(app)/my-stars/public-star/final-my-star-public",
      params: { starId },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Back-button */}
      <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>3D/VR − space</Text>

      {/* GL scene */}
      <View style={styles.sceneWrapper}>
        <BasicRoomGL />
      </View>

      {/* Buttons */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.darkButton}
          onPress={handleSpaces}
        >
          <Text style={styles.darkButtonText}> Edit space </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.lightButton}
          onPress={handleEdit}
        >
          <Text style={styles.lightButtonText}>Edit content</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  sceneWrapper: {
    marginTop: 30,
    alignSelf: "center",
    width: width - 40,
    height: height * 0.5,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#fff",
  },
  buttonWrapper: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    flexDirection: "column",
  },
  darkButton: {
    backgroundColor: "#11152A",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  darkButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Alice-Regular",
    textAlign: "center",
  },
  lightButton: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    borderRadius: 12,
  },
  lightButtonText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Alice-Regular",
    textAlign: "center",
  },
});