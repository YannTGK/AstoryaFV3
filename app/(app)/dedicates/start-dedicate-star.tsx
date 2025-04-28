import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import StarView from "@/components/stars/StarView";

const { width } = Dimensions.get("window");

export default function StartDedicateStar() {
  const router = useRouter();
  const [name, setName] = useState("");

  const handleCustomize = () => {
    if (name.trim() !== "") {
      router.push("/dedicates/color-dedicate-star");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Back knop */}
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
      <Text style={styles.title}>Dedicate star</Text>

      {/* Subtitel */}
      <Text style={styles.subtitle}>
      Create a private star to honor someone that passed away and share it with those who matter by adding trusted accounts.
      </Text>

      {/* 3D ster */}
      <View style={styles.canvasWrapper}>
        <StarView emissive={0xffffff} size={300} rotate={true} />
      </View>

      {/* Naam input */}
      <TextInput
        style={styles.nameInput}
        placeholder="First- & lastname"
        placeholderTextColor="#ffffff"
        value={name}
        onChangeText={setName}
      />

      {/* Customize knop */}
      <View style={styles.fixedButtonWrapper}>
        <TouchableOpacity
          style={[styles.button, { opacity: name.trim() ? 1 : 0.5 }]}
          onPress={handleCustomize}
          disabled={!name.trim()}
        >
          <Text style={styles.buttonText}>Customize star</Text>
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
  subtitle: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  canvasWrapper: {
    alignSelf: "center",
    marginTop: 25,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  nameInput: {
    marginTop: 10,
    marginHorizontal: 30,
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    paddingVertical: 8,
    textAlign: "center",
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
    fontFamily: "Alice-Regular",
    textAlign: "center",
    color: "#000",
  },
});
