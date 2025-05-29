import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import PublicBasicRoomGL from "@/components/rooms/PublicBasicRoomGL";
import api from "@/services/api";
import * as THREE from "three";

type ThreeDRoom = {
  _id: string;
  roomType: string;
};

type Message = { _id: string; text: string };
type Document = { _id: string; filename: string };

export default function PublicStarRoomPage() {
  const { starId } = useLocalSearchParams<{ starId: string }>();
  const router = useRouter();

  const [rooms, setRooms] = useState<ThreeDRoom[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // trigger camera zooms
  const [focusReq, setFocusReq] = useState<{
    meshName: string;
    worldPos: THREE.Vector3;
    heightOffset: number;
  } | null>(null);

  // which mesh has finished zooming
  const [focusedMesh, setFocusedMesh] = useState<string | null>(null);

  // overlay data
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [docs, setDocs] = useState<Document[] | null>(null);

  // load 3D rooms
  useEffect(() => {
    if (!starId) return;
    setLoading(true);
    api
      .get<ThreeDRoom[]>(`/stars/${starId}/three-d-rooms`)
      .then((res) => setRooms(res.data))
      .catch(() => setError("Failed to load 3D rooms"))
      .finally(() => setLoading(false));
  }, [starId]);

  // when a mesh zoom finishes, fetch its content
  useEffect(() => {
    if (!focusedMesh) return;
    const roomId = rooms![0]._id;
    if (focusedMesh.startsWith("cube_11")) {
      api
        .get<Document[]>(`/stars/${starId}/three-d-rooms/${roomId}/documents`)
        .then((r) => setDocs(r.data))
        .catch(() => setDocs([]));
    } else {
      api
        .get<Message[]>(`/stars/${starId}/three-d-rooms/${roomId}/messages`)
        .then((r) => setMessages(r.data))
        .catch(() => setMessages([]));
    }
  }, [focusedMesh]);

  const basicRoom = rooms?.find((r) => r.roomType === "basic") || null;

  if (loading)
    return (
      <View style={styles.centered}>
        <Text style={styles.info}>Loading…</Text>
      </View>
    );
  if (error)
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  if (!basicRoom)
    return (
      <View style={styles.centered}>
        <Text style={styles.info}>No basic room available.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {/* Back */}
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <PublicBasicRoomGL
        // show from a 45° angle instead of straight above
        initialCameraPosition={[0, 16, 20]}
        initialCameraTarget={[0, 3, 0]}
        focusRequest={focusReq || undefined}
        // disable pan when zooming or overlay open
        panEnabled={!focusedMesh}
        onMeshClick={(mesh, worldPos) => {
          setFocusReq({
            meshName: mesh.name,
            worldPos,
            heightOffset: 8,
          });
        }}
        onFocusComplete={(meshName) => {
          // zoom-out marker should not open overlay
          if (meshName === "fullroom") {
            // reset so pan re-enabled
            setFocusReq(null);
            return;
          }
          setFocusedMesh(meshName);
        }}
      />

      {/* Overlay */}
      <Modal visible={!!focusedMesh} transparent animationType="fade">
        <View style={styles.overlay}>
          <Text style={styles.title}>{focusedMesh}</Text>
          {focusedMesh?.startsWith("cube_11") ? (
            <FlatList
              data={docs}
              keyExtractor={(i) => i._id}
              renderItem={({ item }) => (
                <Text style={styles.item}>{item.filename}</Text>
              )}
            />
          ) : (
            <FlatList
              data={messages}
              keyExtractor={(i) => i._id}
              renderItem={({ item }) => (
                <Text style={styles.item}>{item.text}</Text>
              )}
            />
          )}
          <TouchableOpacity
            style={styles.close}
            onPress={() => {
              // close overlay & clear
              setFocusedMesh(null);
              setMessages(null);
              setDocs(null);
              // zoom back out
              setFocusReq({
                meshName: "fullroom",
                worldPos: new THREE.Vector3(0, 3, 0),
                heightOffset: 12,
              });
            }}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  back: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
  },
  backText: { color: "#fff", fontSize: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  info: { color: "#fff", fontSize: 18 },
  error: { color: "red", fontSize: 18 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 20,
  },
  title: { color: "#fff", fontSize: 24, marginBottom: 12 },
  item: { color: "#fff", fontSize: 18, marginVertical: 6 },
  close: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#444",
    borderRadius: 6,
    alignSelf: "center",
  },
  closeText: { color: "#fff", fontSize: 18 },
});