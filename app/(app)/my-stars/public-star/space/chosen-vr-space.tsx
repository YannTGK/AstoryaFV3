import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import BasicRoomGL from "@/components/rooms/BasicRoomGL";   // ⬅️ net gemaakt

const { width, height } = Dimensions.get("window");

export default function ChosenVRSpace() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      {/* Achtergrond gradient */}
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Back-button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>3D/VR − space</Text>

      {/* Native GL-scene */}
      <View style={styles.sceneWrapper}>
        <BasicRoomGL />
      </View>

      {/* Add-content knop */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push("/(app)/my-stars/public-star/space/add-content-space")
          }
        >
          <Text style={styles.buttonText}>Add content</Text>
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
  sceneWrapper: {
    height: height * 0.5,
    width: width - 40,
    alignSelf: "center",
    marginTop: 30,
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