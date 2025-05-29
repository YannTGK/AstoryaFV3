// (app)/public-star/public-spaces/room.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import PublicBasicRoomGL from "@/components/rooms/PublicBasicRoomGL";
import api from "@/services/api";

type ThreeDRoom = {
  _id: string;
  name: string;
  roomType: string;
  description?: string;
};

export default function PublicStarRoomPage() {
  const { starId } = useLocalSearchParams<{ starId: string }>();
  const router = useRouter();

  const [rooms, setRooms] = useState<ThreeDRoom[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!starId) return;
    setLoading(true);
    api
      .get<ThreeDRoom[]>(`/stars/${starId}/three-d-rooms`)
      .then((res) => {
        setRooms(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error("❌ Failed to load 3D rooms:", err);
        setError("Failed to load 3D rooms.");
      })
      .finally(() => setLoading(false));
  }, [starId]);

  // find the first basic room
  const basicRoom = rooms?.find((r) => r.roomType === "basic") ?? null;

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.centered}>
          <Text style={styles.infoText}>Loading rooms…</Text>
        </View>
      )}

      {error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && rooms && rooms.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.infoText}>
            No 3D rooms found for this star.
          </Text>
        </View>
      )}

      {!loading && rooms && rooms.length > 0 && !basicRoom && (
        <View style={styles.centered}>
          <Text style={styles.infoText}>
            There is no “basic” room for this star.
          </Text>
        </View>
      )}

      {basicRoom && (
        <PublicBasicRoomGL
          initialCameraPosition={[0, 16, 20]}
          initialCameraTarget={[0, 3, 0]}
          onMeshClick={(mesh) => {
            console.log(
              "Clicked mesh in basic-room:",
              mesh.name || mesh.id
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
  },
  backText: { color: "#fff", fontSize: 16 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: { color: "#fff", fontSize: 18 },
  errorText: { color: "red", fontSize: 16 },
});