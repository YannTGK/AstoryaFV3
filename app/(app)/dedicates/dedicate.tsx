import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import StarIcon from "@/assets/images/svg-icons/star.svg";
import PlusIcon from "@/assets/images/svg-icons/plus3.svg";
import UpgradePopupDedicate from "@/components/pop-ups/UpgradePopupDedicate";
import api from "@/services/api";

const { width } = Dimensions.get("window");

export default function DedicateScreen() {
  const router = useRouter();

  const [showPopup, setShowPopup] = useState(false);
  const [dedicatedStars, setDedicatedStars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /** Dedicated sterren ophalen */
  const fetchDedicatedStars = async () => {
    try {
      const res = await api.get("/stars/dedicate"); // levert alleen de sterren die je mag zien
      setDedicatedStars(res.data);
    } catch (err) {
      console.error("Kon sterren niet laden:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDedicatedStars();
  }, []);

  /** Naar detail­scherm navigeren met starId */
  const handleStarPress = (star: any) => {
    router.push({
      pathname: "/dedicates/created-dedicates/dedicated-star",
      params: { starId: star._id },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* terug */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Dedicated stars</Text>

      {/* nieuwe ster */}
      <TouchableOpacity style={styles.plusBtn} onPress={() => setShowPopup(true)}>
        <PlusIcon width={36} height={36} />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 60 }} />
      ) : (
        <View style={styles.grid}>
          {dedicatedStars.map((star) => (
            <TouchableOpacity
              key={star._id}
              style={styles.starWrapper}
              onPress={() => handleStarPress(star)}
            >
              <StarIcon width={140} height={140} />
              <Text style={styles.starLabel}>{star.publicName ?? "Naam ontbreekt"}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showPopup && <UpgradePopupDedicate onClose={() => setShowPopup(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title:   { fontSize: 20, fontFamily: "Alice-Regular", color: "#fff", textAlign: "center", marginTop: 50 },
  plusBtn: { position: "absolute", top: 85, right: 24, zIndex: 10 },
  grid:    { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, columnGap: 20, rowGap: 40, marginTop: 60 },
  starWrapper: { width: (width - 52) / 2, alignItems: "center" },
  starLabel:   { color: "#fff", fontFamily: "Alice-Regular", fontSize: 14, marginTop: 6, textAlign: "center" },
});