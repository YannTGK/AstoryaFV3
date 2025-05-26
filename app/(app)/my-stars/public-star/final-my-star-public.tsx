import { useState } from "react";
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import StarView from "@/components/stars/StarView";

export default function MyStarPublic2() {
  const router = useRouter();
  const { name, emissive } = useLocalSearchParams();
  const [isPrivate, setIsPrivate] = useState(false);

  const isValid = typeof name === "string" && typeof emissive === "string";
  const emissiveNum = isValid ? parseInt(emissive as string, 10) : 0xffffff;

  const goPrivate = () => {
    setIsPrivate(true);
    router.replace("/(app)/my-stars/start-my-star-private");
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
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

      {/* toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          onPress={goPrivate}
          style={[
            styles.toggleBtn,
            isPrivate ? styles.toggleOn : styles.toggleOff,
            styles.privateRounded,
          ]}
        >
          <Text style={[styles.toggleTxt, { color: isPrivate ? "#11152A" : "#fff" }]}>Private</Text>
        </Pressable>
        <Pressable
          onPress={() => setIsPrivate(false)}
          style={[
            styles.toggleBtn,
            !isPrivate ? styles.toggleOn : styles.toggleOff,
            styles.publicRounded,
          ]}
        >
          <Text style={[styles.toggleTxt, { color: !isPrivate ? "#11152A" : "#fff" }]}>Public</Text>
        </Pressable>
      </View>

      {/* geen ster? */}
      {!isValid && <Text style={styles.empty}>No public star has been created yet.</Text>}

      {/* ster & naam */}
      {isValid && (
        <>
          <View style={styles.canvasWrapper}>
            <StarView emissive={emissiveNum} rotate={false} />
            <View style={styles.nameOverlay}>
              <Text style={styles.nameText}>{name}</Text>
            </View>
          </View>

          <View style={styles.ctaWrapper}>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                router.push("/(app)/my-stars/public-star/space/no-space")
              }
            >
              <Text style={styles.buttonTxt}>Add 3D/VR</Text>  
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

/*──────────────────── styles ────────────────────*/
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

  /* toggle */
  toggleContainer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  toggleBtn: { paddingVertical: 10, paddingHorizontal: 26 },
  toggleOn: { backgroundColor: "#FEEDB6" },
  toggleOff: { backgroundColor: "#11152A" },
  toggleTxt: { fontFamily: "Alice-Regular", fontSize: 16 },
  privateRounded: { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  publicRounded: { borderTopRightRadius: 12, borderBottomRightRadius: 12 },

  empty: {
    color: "#fff",
    textAlign: "center",
    marginTop: 100,
    fontFamily: "Alice-Regular",
    fontSize: 16,
  },

  /* star wrapper */
  canvasWrapper: {
    alignSelf: "center",
    marginTop: 30,
    height: 300,
    width: 300,
    borderRadius: 20,
    overflow: "hidden",
  },

  nameOverlay: {
    position: "absolute",
    bottom: "4%",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  nameText: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
  },

  /* CTA */
  ctaWrapper: { position: "absolute", bottom: 100, left: 20, right: 20 },
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