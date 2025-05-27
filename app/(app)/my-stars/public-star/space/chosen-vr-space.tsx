// screens/ChosenVRSpace.tsx
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
import BasicRoomGL from "@/components/rooms/BasicRoomGL";

const { width, height } = Dimensions.get("window");

export default function ChosenVRSpace() {
  const router = useRouter();
  const { starId, roomId } = useLocalSearchParams<{ starId?: string; roomId?: string }>();

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      <Text style={styles.title}>3D/VR – space</Text>

      <View style={styles.sceneWrapper}>
        <BasicRoomGL />
      </View>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            router.push({
              pathname:
                "/(app)/my-stars/public-star/space/add-content-space",
              params: { starId, roomId },
            })
          }
        >
          <Text style={styles.buttonText}>Add content</Text>
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