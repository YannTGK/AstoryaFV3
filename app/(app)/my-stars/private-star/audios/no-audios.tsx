import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import HeadphoneIcon from "@/assets/images/icons/no-audio.svg"
import PlusIcon from "@/assets/images/svg-icons/plus.svg";
import UploadIcon from "@/assets/images/icons/upload-cloud.svg";
import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";

export default function AudioScreen() {
  const router = useRouter();

  const handleUploadAudio = async () => {
      console.log("Upload knop werd geklikt");

  const result = await DocumentPicker.getDocumentAsync({
    type: "audio/*",
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) return;

  const file = result.assets[0];
  console.log("Audio-bestand geselecteerd:", file);

  // eventueel een uploadactie starten hier
  Alert.alert("Audio geselecteerd", file.name);
};

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Back button */}
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
      <Text style={styles.title}>Audio</Text>

<TouchableOpacity style={styles.uploadBtn} onPress={handleUploadAudio}>
  <UploadIcon width={34} height={34} />
</TouchableOpacity>


      {/* Headphone icon */}
     <View style={styles.centerContent}>
  <HeadphoneIcon width={132} height={132} />
  <Text style={styles.text}>No audio memories here…{"\n"}yet!</Text>
</View>


{/* Plus-knop */}
      <View style={styles.plusWrapper}>
        <TouchableOpacity onPress={() => router.push("/(app)/my-stars/private-star/messages/write-message")}>
          <PlusIcon width={50} height={50} />
        </TouchableOpacity>
      </View>

      {/* Tab bar (simulated) */}
      <View style={styles.tabBar}>
        {["Explore", "Dedicate", "My star", "Account"].map((label, i) => (
          <Text
            key={i}
            style={[
              styles.tabItem,
              label === "My star" && styles.activeTab,
            ]}
          >
            {label}
          </Text>
        ))}
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
uploadBtn: {
  position: "absolute",
  top: 110,
  right: 16,
  zIndex: 10,
},
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    lineHeight: 22,
  },
  plusWrapper: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#333",
    backgroundColor: "#fff",
  },
  tabItem: {
    fontSize: 12,
    color: "#999",
  },
  activeTab: {
    color: "#11152A",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
