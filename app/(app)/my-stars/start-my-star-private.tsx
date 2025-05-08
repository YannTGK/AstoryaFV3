// app/(app)/my-stars/private-star/StartMyStarPrivate.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import StarView from "@/components/stars/StarView";
import useAuthStore from "@/lib/store/useAuthStore";
import api from "@/services/api";
import UpgradePopup from "@/components/pop-ups/UpgradePopup";

export default function StartMyStarPrivate() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [showPopup, setShowPopup] = useState(false);
  const [isReady, setIsReady]     = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!user) return;

      try {
        // 1) haal alle sterren op
        const { data: stars } = await api.get("/stars");
        // 2) zoek private ster
        const privateStar = stars.find((s: any) => s.isPrivate);
        if (privateStar) {
          // kleur als decimaal emissive
          const hex = privateStar.color?.startsWith("#")
            ? privateStar.color
            : "#ffffff";
          const emissive = parseInt(hex.slice(1), 16).toString();

          // direct naar chosen-private-star
          router.replace({
            pathname: "/(app)/my-stars/private-star/final-my-star-private",
            params: {
              // id kun je optioneel meegeven als je later wilt updaten
              id:        privateStar._id,
              name:      privateStar.publicName || privateStar.word,
              emissive,
            },
          });
          return;
        }

        // 3) geen bestaande private star: toon eventueel popup
        if (user.plan === "EXPLORER") {
          setShowPopup(true);
        }
      } catch (err) {
        console.error("Fout bij ophalen sterren:", err);
        // fallback: toon popup voor explorer
        if (user.plan === "EXPLORER") {
          setShowPopup(true);
        }
      } finally {
        setIsReady(true);
      }
    };

    init();
  }, [user, router]);

  const goCustomize = () =>
    router.push("/(app)/my-stars/private-star/color-my-star-private");
  const goPublic = () =>
    router.replace("/(app)/my-stars/start-my-star-public");

  if (!isReady) return null;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#000", "#273166", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Upgrade-popup voor EXPLORER */}
      {showPopup && <UpgradePopup onClose={() => setShowPopup(false)} />}

      {!showPopup && (
        <>
          {/* Back */}
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
              onPress={goPublic}
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
          <View style={styles.ctaWrapper}>
            <TouchableOpacity
              style={styles.button}
              onPress={goCustomize}
            >
              <Text style={styles.buttonText}>Customize star</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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