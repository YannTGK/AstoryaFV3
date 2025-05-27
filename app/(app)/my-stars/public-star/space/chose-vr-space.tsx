// screens/ChoseVRSpace.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import BasicRoom from "@/assets/images/placeHolders/basicRoom.svg";
import api from "@/services/api";

const { width } = Dimensions.get("window");
const ROOM_TYPES = [{ key: "basic", label: "Basic Room" }];

export default function ChoseVRSpace() {
  const router = useRouter();
  const { starId, name } = useLocalSearchParams<{ starId?: string; name?: string }>();

  const [selectedType, setSelectedType] = useState<string>("basic");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!starId || !name) {
      Alert.alert("Error", "Missing star or name");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(`/stars/${starId}/three-d-rooms`, {
        roomType: selectedType,
        name: decodeURIComponent(name),
      });
      const newRoom = res.data; // verwacht minimaal {_id, …}

      router.replace({
        pathname: "/(app)/my-stars/public-star/space/chosen-vr-space",
        params: {
          starId,
          roomId: newRoom._id,
        },
      });
    } catch (err: any) {
      console.error("Create room failed:", err);
      Alert.alert(
        "Could not create room",
        err.response?.data?.message || err.message || "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2}/>
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>
        Name: {decodeURIComponent(name || "")}
      </Text>
      <Text style={styles.subtitle}>Choose a room type</Text>

      <View style={styles.typesContainer}>
        {ROOM_TYPES.map((rt) => (
          <TouchableOpacity
            key={rt.key}
            style={[
              styles.typeBtn,
              selectedType === rt.key && styles.typeBtnSelected,
            ]}
            onPress={() => setSelectedType(rt.key)}
          >
            <Text
              style={[
                styles.typeLabel,
                selectedType === rt.key && styles.typeLabelSelected,
              ]}
            >
              {rt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.preview}>
        <BasicRoom width="100%" height="100%" />
      </View>

      <View style={styles.buttonWrapper}>
        {loading ? (
          <ActivityIndicator size="large" color="#FEEDB6" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleConfirm}>
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  subtitle: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
  },
  typesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  typeBtn: {
    marginHorizontal: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fff",
  },
  typeBtnSelected: {
    backgroundColor: "#FEEDB6",
    borderColor: "#FEEDB6",
  },
  typeLabel: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
  },
  typeLabelSelected: {
    color: "#11152A",
  },
  preview: {
    height: 180,
    width: width - 40,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
    marginTop: 30,
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