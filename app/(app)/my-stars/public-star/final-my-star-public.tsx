// screens/final-my-star-public.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import StarView from "@/components/stars/StarView";
import api from "@/services/api";

export default function FinalMyStarPublic() {
  const router = useRouter();
  const { starId } = useLocalSearchParams<{ starId?: string }>();

  const [star, setStar] = useState<any>(null);
  const [hasRoom, setHasRoom] = useState<boolean | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!starId) {
        Alert.alert("Error", "No star ID provided");
        setLoading(false);
        return;
      }
      let cancelled = false;

      setLoading(true);
      setHasRoom(null);
      setRoomId(null);

      // 1) load your star
      api
        .get("/stars")
        .then((res) => {
          if (cancelled) return;
          const allStars: any[] = res.data;
          const found = allStars.find((s) => s._id === starId);
          if (!found) {
            Alert.alert("Not found", "Could not find your star");
            return;
          }
          setStar(found);
        })
        .catch((err) => {
          console.error("Failed to load stars:", err);
          Alert.alert("Error", "Could not load your star");
        });

      // 2) load 3D rooms and grab first room’s ID
      api
        .get(`/stars/${starId}/three-d-rooms`)
        .then((res) => {
          if (cancelled) return;
          const rooms: any[] = res.data;
          const ok = Array.isArray(rooms) && rooms.length > 0;
          setHasRoom(ok);
          if (ok) {
            setRoomId(rooms[0]._id);
          }
        })
        .catch((err) => {
          if (cancelled) return;
          console.warn("Failed to load 3D rooms:", err);
          setHasRoom(false);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }, [starId])
  );

  const goPrivate = () => {
    setIsPrivate(true);
    router.replace("/(app)/my-stars/start-my-star-private");
  };

  const goAdd3D = () => {
    if (!starId) {
      Alert.alert("Error", "No star ID");
      return;
    }
    const route = hasRoom
      ? "/(app)/my-stars/public-star/space/save-space"
      : "/(app)/my-stars/public-star/space/no-space";

    router.push({
      pathname: route,
      params: { starId, roomId }, // ← pass both
    });
  };

  if (loading || hasRoom === null || !star) {
    return (
      <View style={styles.fullscreenCenter}>
        <ActivityIndicator size="large" color="#FEEDB6" />
      </View>
    );
  }

  // derive display props
  const displayName = star.publicName || star.word || "";
  const colorHex = star.color?.startsWith("#") ? star.color : "#ffffff";
  const emissive = parseInt(colorHex.slice(1), 16);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Back */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() =>
          router.push({
            pathname: "/(app)/my-stars/public-star/final-my-star-public",
            params: { starId },
          })
        }
      >
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>My personal star</Text>

      {/* Private/Public toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          onPress={goPrivate}
          style={[
            styles.toggleBtn,
            isPrivate ? styles.toggleOn : styles.toggleOff,
            styles.privateRounded,
          ]}
        >
          <Text
            style={[
              styles.toggleTxt,
              { color: isPrivate ? "#11152A" : "#fff" },
            ]}
          >
            Private
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsPrivate(false)}
          style={[
            styles.toggleBtn,
            !isPrivate ? styles.toggleOn : styles.toggleOff,
            styles.publicRounded,
          ]}
        >
          <Text
            style={[
              styles.toggleTxt,
              { color: !isPrivate ? "#11152A" : "#fff" },
            ]}
          >
            Public
          </Text>
        </TouchableOpacity>
      </View>

      {/* Star preview */}
      <View style={styles.canvasWrapper}>
        <StarView emissive={emissive} rotate={false} />
        <View style={styles.nameOverlay}>
          <Text style={styles.nameText}>{displayName}</Text>
        </View>
      </View>

      {/* Add/Edit 3D/VR */}
      <View style={styles.ctaWrapper}>
        <TouchableOpacity style={styles.button} onPress={goAdd3D}>
          <Text style={styles.buttonTxt}>
            {hasRoom ? "Edit 3D/VR space" : "Add 3D/VR space"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fullscreenCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  toggleBtn: { paddingVertical: 10, paddingHorizontal: 26 },
  toggleOn: { backgroundColor: "#FEEDB6" },
  toggleOff: { backgroundColor: "#11152A" },
  toggleTxt: { fontFamily: "Alice-Regular", fontSize: 16 },
  privateRounded: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  publicRounded: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
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
  ctaWrapper: {
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
  buttonTxt: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Alice-Regular",
    textAlign: "center",
  },
});