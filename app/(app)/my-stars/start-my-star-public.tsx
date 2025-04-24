// app/(app)/my-stars/public-star/StartMyStarPublic.tsx
import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import StarView from "@/components/stars/StarView";

export default function StartMyStarPublic() {
  const router = useRouter();

  const goBack = useCallback(() => router.back(), []);
  const goPrivate = useCallback(() => router.replace("/(app)/my-stars/start-my-star-private"), []);
  const goCustomize = useCallback(() => router.push("/(app)/my-stars/public-star/color-my-star-public"), []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <TouchableOpacity style={styles.backBtn} onPress={goBack}>
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

      <View style={styles.toggleContainer}>
        <Pressable onPress={goPrivate} style={[styles.toggleBtn, styles.private]}>
          <Text style={[styles.toggleTxt, styles.privateTxt]}>Private</Text>
        </Pressable><Pressable style={[styles.toggleBtn, styles.public]}>
          <Text style={[styles.toggleTxt, styles.publicTxt]}>Public</Text>
        </Pressable>
      </View>

      <View style={styles.canvasWrapper}>
        <StarView emissive={0xffffff} rotate />
      </View>

      <View style={styles.ctaWrapper}>
        <TouchableOpacity style={styles.button} onPress={goCustomize}>
          <Text style={styles.buttonTxt}>Customize star</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ──────────────────────── STYLES ──────────────────────── */
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

  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },

  toggleBtn: {
    paddingVertical: 10,
    paddingHorizontal: 26,
  },

  private: {
    backgroundColor: "#11152A",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },

  public: {
    backgroundColor: "#FEEDB6",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },

  toggleTxt: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
  },

  privateTxt: {
    color: "#fff",
  },

  publicTxt: {
    color: "#11152A",
  },

  canvasWrapper: {
    position: "absolute",
    top: 200,
    alignSelf: "center",
    width: 300,
    height: 300,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "transparent",
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

  buttonTxt: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Alice-Regular",
    textAlign: "center",
  },
});