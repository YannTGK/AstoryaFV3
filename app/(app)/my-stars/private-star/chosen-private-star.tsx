import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import StarView from "@/components/stars/StarView";
import { createStar } from "@/services/stars";
import useAuthStore from "@/lib/store/useAuthStore";

const { width } = Dimensions.get("window");

export default function ChosenPrivateStar() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { name, emissive } = useLocalSearchParams<{
    name: string;
    emissive: string;
  }>();

  const [saving, setSaving] = useState(false);

  // Convert decimal emissive to hex color
  const colorHex =
    "#" + parseInt(emissive as string, 10).toString(16).padStart(6, "0");

  const handleSaveAndContinue = async () => {
    if (saving) return;
    setSaving(true);

    try {
      // createStar returns AxiosResponse<{ _id: string; ... }>
      const res = await createStar({
        word: name.toUpperCase(),
        color: colorHex,
        isPrivate: true,
        publicName: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`,
      });

      const newStarId = res.data._id;
      if (!newStarId) {
        throw new Error("No ID returned from createStar");
      }

      // Replace, sending along the new star's id
      router.replace({
        pathname: "/(app)/my-stars/private-star/final-my-star-private",
        params: {
          name,
          emissive,
          id: newStarId,
        },
      });
    } catch (err: any) {
      console.error("Private star aanmaken mislukt:", err);
      Alert.alert(
        "Opslaan mislukt",
        err.message || "Er ging iets mis bij het opslaan. Probeer het later opnieuw."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* ← Back */}
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

      <Text style={styles.title}>My personal star</Text>
      <Text style={styles.subtitle}>Chosen star</Text>

      {/* 3D preview */}
      <View style={styles.canvasWrapper}>
        <StarView emissive={parseInt(emissive as string, 10)} rotate={false} />
      </View>

      <Text style={styles.starName}>{name}</Text>

      {/* CTA */}
      <View style={styles.ctaWrapper}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSaveAndContinue}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Saving…" : "Add content"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
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
  },
  starName: {
    textAlign: "center",
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 20,
    marginTop: 20,
  },
  ctaWrapper: {
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