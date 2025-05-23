import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");

export default function ChoseVRSpace() {
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

      {/* Titel */}
      <Text style={styles.title}>3D/VR - space</Text>

      {/* Beschrijving */}
      <Text style={styles.description}>
        Choose a 3D/VR space where you want{"\n"}to preserve your memories.
      </Text>

      {/* Placeholder box */}
      <View style={styles.box} />

      {/* Naam links onder de box */}
      <Text style={styles.boxLabel}>My memory bedroom</Text>

      {/* Select knop */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            router.push("/(app)/my-stars/public-star/space/chosen-vr-space");
          }}
        >
          <Text style={styles.buttonText}>Select</Text>
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
  description: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginTop: 32,
  },
  box: {
    height: 180,
    width: width - 40,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 12,
    marginTop: 30,
    alignSelf: "center",
  },
  boxLabel: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
    textAlign: "left",
    marginTop: 10,
    marginLeft: 20,
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
