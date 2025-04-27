import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

// SVG iconen
import StarIcon from "@/assets/images/svg-icons/star.svg";
import PlusIcon from "@/assets/images/svg-icons/plus3.svg";

// Popup
import UpgradePopupDedicate from "@/components/pop-ups/UpgradePopupDedicate";

const { width } = Dimensions.get("window");

export default function DedicateScreen() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);

  const handlePlusPress = () => {
    setShowPopup(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Back-knop */}
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
      <Text style={styles.title}>Dedicated stars</Text>

      {/* Plus-knop */}
      <TouchableOpacity style={styles.plusBtn} onPress={handlePlusPress}>
        <PlusIcon width={36} height={36} />
      </TouchableOpacity>

      {/* Sterren grid */}
      <View style={styles.grid}>
        <View style={styles.starWrapper}>
          <StarIcon width={140} height={140} />
          <Text style={styles.starLabel}>Elina De Vos</Text>
        </View>
        <View style={styles.starWrapper}>
          <StarIcon width={140} height={140} />
          <Text style={styles.starLabel}>Merel De Bruyne</Text>
        </View>
        <View style={styles.starWrapper}>
          <StarIcon width={140} height={140} />
          <Text style={styles.starLabel}>Emma Lopez</Text>
        </View>
      </View>

      {/* Popup */}
      {showPopup && (
        <UpgradePopupDedicate onClose={() => setShowPopup(false)} />
      )}
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
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  plusBtn: {
    position: "absolute",
    top: 85,
    right: 24,
    zIndex: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    columnGap: 20,
    rowGap: 40,
    marginTop: 60,
  },
  starWrapper: {
    width: (width - 52) / 2,
    alignItems: "center",
  },
  starLabel: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
});
