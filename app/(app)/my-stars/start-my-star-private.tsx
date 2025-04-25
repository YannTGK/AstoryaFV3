import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import StarView from "@/components/stars/StarView";

import UpgradePopup from "@/components/pop-ups/UpgradePopup";
import useAuthStore from "@/lib/store/useAuthStore";
import api from "@/services/api";

const { width } = Dimensions.get("window");

export default function StartMyStarPrivate() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [showPopup, setShowPopup] = useState(false);
  const [isReady, setIsReady] = useState(false);

  /* ─── bepalen of popup moet verschijnen ─── */
  useEffect(() => {
    const init = async () => {
      if (!user) return;

      // Toon popup voor EXPLORER-plan
      if (user.plan === "EXPLORER") setShowPopup(true);

      try {
        // Extra check: als premium/legacy al een private star heeft → doorskippen
        const { data: stars } = await api.get("/stars");
        const hasPrivateStar = stars.some((s: any) => s.isPrivate);

        if (
          (user.plan === "PREMIUM" || user.plan === "LEGACY") &&
          hasPrivateStar
        ) {
          router.replace(
            "/(app)/my-stars/private-star/final-my-star-private"
          );
          return;
        }
      } catch (err) {
        console.error("Fout bij ophalen sterren:", err);
        setShowPopup(true); // fallback
      } finally {
        setIsReady(true);
      }
    };

    init();
  }, [user]);

  const handleToggleToPublic = () =>
    router.replace("/(app)/my-stars/start-my-star-public");

  const handleCustomize = () =>
    router.push("/(app)/my-stars/private-star/color-my-star-private");

  if (!isReady) return null;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000", "#273166", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* ─── UPGRADE POPUP ─── */}
      {showPopup && (
        <UpgradePopup onClose={() => setShowPopup(false)} />
      )}

      {/* ─── REST VAN HET SCHERM ─── */}
      {!showPopup && (
        <>
          {/* Terug-knop */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
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

          {/* Private / Public toggle */}
          <View style={styles.toggleContainer}>
            <Pressable style={[styles.toggleBtn, styles.privateOn]}>
              <Text style={[styles.toggleTxt, { color: "#11152A" }]}>
                Private
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, styles.publicOff]}
              onPress={handleToggleToPublic}
            >
              <Text style={[styles.toggleTxt, { color: "#fff" }]}>
                Public
              </Text>
            </Pressable>
          </View>

          {/* Ster-voorbeeld */}
          <View style={styles.canvasWrapper}>
            <StarView emissive={0xffffff} size={300} rotate />
          </View>

          {/* CTA */}
          <View style={styles.fixedButtonWrapper}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleCustomize}
            >
              <Text style={styles.buttonText}>Customize star</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

/* ───────────────── styles ───────────────── */
const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  toggleBtn: { paddingVertical: 10, paddingHorizontal: 26 },
  privateOn: {
    backgroundColor: "#FEEDB6",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  publicOff: {
    backgroundColor: "#11152A",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  toggleTxt: { fontFamily: "Alice-Regular", fontSize: 16 },
  canvasWrapper: {
    position: "absolute",
    height: 300,
    width: 300,
    alignSelf: "center",
    marginTop: 200,
    borderRadius: 20,
    overflow: "hidden",
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
    color: "#000",
    fontFamily: "Alice-Regular",
    textAlign: "center",
  },
});