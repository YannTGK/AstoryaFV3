// app/(app)/dedicates/dedicate/index.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import StarIcon from "@/assets/images/svg-icons/star.svg";
import PlusIcon from "@/assets/images/svg-icons/plus3.svg";
import UpgradePopupDedicate from "@/components/pop-ups/UpgradePopupDedicate";
import api from "@/services/api";

const { width } = Dimensions.get("window");

export default function DedicateScreen() {
  const router = useRouter();

  const [showPopup,      setShowPopup]      = useState(false);
  const [dedicatedStars, setDedicatedStars] = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);

  const fetchDedicatedStars = async () => {
    setLoading(true);
    try {
      const res = await api.get("/stars/dedicate");
      setDedicatedStars(res.data.stars || res.data);
    } catch (err) {
      console.error("❌ Kon sterren niet laden:", err);
      setDedicatedStars([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => { if (active) await fetchDedicatedStars(); })();
      return () => { active = false; };
    }, [])
  );

  const handleStarPress = (star: any) => {
    router.push({
      pathname: "/dedicates/created-dedicates/dedicated-star",
      params:   { starId: star._id },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      <Text style={styles.title}>Dedicated stars</Text>

      <TouchableOpacity style={styles.plusBtn} onPress={() => setShowPopup(true)}>
        <PlusIcon width={36} height={36} />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 60 }} />
      ) : dedicatedStars.length === 0 ? (
        /*  ⬇︎ oude lege‑staat Moet aangepast worden ⬇︎  */
        <View style={styles.oldEmptyWrapper}>
          <StarIcon width={160} height={160} />
          <Text style={styles.oldEmptyText}>No dedicated stars yet</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.main}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {dedicatedStars.map((star) => (
            <TouchableOpacity
              key={star._id}
              style={styles.starWrapper}
              onPress={() => handleStarPress(star)}
            >
              <StarIcon width={140} height={140} />
              <Text style={styles.starLabel}>
                {star.publicName ?? "Naam ontbreekt"}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {showPopup && <UpgradePopupDedicate onClose={() => setShowPopup(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  main:      { marginBottom: 80 },
  plusBtn:   { position: "absolute", top: 85, right: 24, zIndex: 10 },
  title: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },

  /* grid */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    columnGap: 20,
    rowGap: 40,
    marginTop: 60,
    paddingBottom: 40,
  },
  starWrapper: { width: (width - 52) / 2, alignItems: "center" },
  starLabel: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },

  /* oude lege‑staat */
  oldEmptyWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  oldEmptyText: {
    marginTop: 18,
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 16,
  },
});