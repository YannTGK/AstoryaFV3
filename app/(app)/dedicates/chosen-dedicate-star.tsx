import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import StarView from "@/components/stars/StarView";
import { createDedicatedStar } from "@/services/dedicateStars";

export default function ChosenDedicateStar() {
  const router = useRouter();
  const { publicName, word, color, emissive } = useLocalSearchParams<{
    publicName: string; word: string; color: string; emissive: string;
  }>();

  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    try {
      setSaving(true);
      const res = await createDedicatedStar({
        publicName,
        word,
        color,
      });
      const starId = res.data._id;
      router.replace({           // replace: geen “back” meer naar deze pagina
        pathname: "/dedicates/created-dedicates/dedicated-star-private",
        params: { starId },
      });
    } catch (err) {
      console.error("❌ could not create star", err);
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />
      <TouchableOpacity style={{ position: "absolute", top: 50, left: 20 }} onPress={() => router.back()}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} /></Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Confirm star</Text>

      <View style={styles.canvasWrapper}>
        <StarView emissive={parseInt(emissive, 10)} rotate={false} />
      </View>

      <Text style={styles.starName}>{publicName}</Text>
      <Text style={styles.starName}>{word}</Text>

      <View style={styles.fixedButtonWrapper}>
        <TouchableOpacity style={[styles.button, saving && { opacity: 0.5 }]} onPress={handleCreate} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? "Saving…" : "Create star"}</Text>
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
    textAlign: "center",
    marginTop: 20,
  },
  canvasWrapper: {
    alignSelf: "center",
    marginTop: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  glView: {
    width: 300,
    height: 300,
    backgroundColor: "transparent",
  },
  starName: {
    textAlign: "center",
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 20,
    marginTop: 20,
  },
  fixedButtonWrapper: {
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
