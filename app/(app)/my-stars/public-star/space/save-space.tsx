import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

export default function SaveSpace() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Back-button */}
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

      {/* Title */}
      <Text style={styles.title}>3D/VR - space</Text>

      {/* Bottom Buttons */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.darkButton} onPress={() => router.push("/(app)/my-stars/public-star/space/created-space")}>
          <Text style={styles.darkButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.lightButton}
          onPress={() =>
            router.push("/(app)/my-stars/public-star/space/add-content-space")
          }
        >
          <Text style={styles.lightButtonText}>Edit content</Text>
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
  buttonWrapper: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
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
