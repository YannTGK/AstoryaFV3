// app/(app)/my-stars/private-star/videos/three-dots/video-albums.tsx

import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Dimensions, Modal, TextInput, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import { Video } from "expo-av";
import api from "@/services/api";
import NoVideoIcon from "@/assets/images/svg-icons/no-album.svg";
import PlusIcon from "@/assets/images/svg-icons/plus.svg";
import useAuthStore from "@/lib/store/useAuthStore";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 64) / 3;

type VideoAlbum = {
  _id: string;
  name: string;
  coverUrl?: string;
  videoCount: number;
};

export default function VideoAlbumsList() {
  const router = useRouter();
  const { id: starId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [albums, setAlbums] = useState<VideoAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchAlbums = async () => {
    if (!starId) return;
    setLoading(true);
    try {
      const base = (await api.get(`/stars/${starId}/video-albums`)).data;
      const full = await Promise.all(
        base.map(async (alb: any) => {
          try {
            const vids = (await api.get(`/stars/${starId}/video-albums/detail/${alb._id}`)).data;
            return {
              _id: alb._id,
              name: alb.name,
              coverUrl: vids[0]?.url ?? null,
              videoCount: vids.length,
            };
          } catch {
            return {
              _id: alb._id,
              name: alb.name,
              coverUrl: null,
              videoCount: 0,
            };
          }
        })
      );
      setAlbums(full);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not load video albums.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { fetchAlbums(); }, [starId]);

  const createAlbum = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const res = await api.post(`/stars/${starId}/video-albums`, { name });
      setShowNew(false);
      setNewName("");
      fetchAlbums();
      router.push({
        pathname: "/(app)/explores/private-files/videos/created-video-album",
        params: {
          id: starId,
          albumId: res.data._id,
          albumName: res.data.name,
        },
      });
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message ?? "Could not create album.");
    } finally {
      setCreating(false);
    }
  };

  const deleteAlbum = async () => {
    setShowDelete(false);
    if (!selected) return;
    try {
      await api.delete(`/stars/${starId}/video-albums/${selected}`);
      setSelected(null);
      setEditMode(false);
      fetchAlbums();
    } catch (err) {
      Alert.alert("Error", "Could not delete album.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      {/* ← back */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 10 }]}
        onPress={() => {
          if (editMode) {
            setEditMode(false);
            setSelected(null);
          } else {
            router.back();
          }
        }}
      >
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={[styles.title, { marginTop: insets.top + 10 }]}>Video albums</Text>

      

      {/* lijst of leeg */}
      {albums.length === 0 ? (
        <View style={styles.empty}>
          <NoVideoIcon width={130} height={130} />
          <Text style={styles.emptyText}>No video albums found</Text>
        </View>
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(i) => i._id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => {
            const sel = selected === item._id;
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  editMode
                    ? setSelected(sel ? null : item._id)
                    : router.push({
                        pathname: "/(app)/explores/private-files/videos/created-video-album",
                        params: {
                          id: starId,
                          albumId: item._id,
                          albumName: item.name,
                        },
                      })
                }
              >
                {item.coverUrl ? (
                  <Video
                    source={{ uri: item.coverUrl }}
                    style={styles.thumbnail}
                    paused
                    resizeMode="cover"
                    muted
                  />
                ) : (
                  <View style={[styles.thumbnail, { backgroundColor: "#999", opacity: 0.2 }]} />
                )}
                {editMode && <View style={[styles.radio, sel && styles.radioActive]} />}
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.count}>{item.videoCount}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* delete-bar */}
      {editMode && selected && (
        <TouchableOpacity
          style={[styles.footer, { bottom: insets.bottom + 20 }]}
          onPress={() => setShowDelete(true)}
        >
          <Feather name="trash-2" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.footerText}>1 album selected</Text>
        </TouchableOpacity>
      )}

      {/* modals */}
      <Modal visible={showNew} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create Album</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Album Name"
              placeholderTextColor="#999"
              style={styles.input}
              editable={!creating}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalBtn} disabled={creating} onPress={() => setShowNew(false)}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.modalBtn} disabled={creating} onPress={createAlbum}>
                {creating ? <ActivityIndicator color="#007AFF" /> : <Text style={styles.create}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDelete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.confirm}>Delete selected album?</Text>
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setShowDelete(false)}>
                <Text style={styles.cancel}>No</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.modalBtn} onPress={deleteAlbum}>
                <Text style={styles.delete}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  backBtn: { position: "absolute", left: 20, zIndex: 10 },
  title: { position: "absolute", alignSelf: "center", fontSize: 20, color: "#fff", fontFamily: "Alice-Regular" },
  editIcon: { position: "absolute", right: 20, zIndex: 10 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 16, color: "#fff", fontFamily: "Alice-Regular" },
  grid: { paddingTop: 90, paddingHorizontal: 16, paddingBottom: 160 },
  card: { width: CARD_SIZE, marginBottom: 20, marginHorizontal: 6, alignItems: "center", position: "relative" },
  thumbnail: { width: CARD_SIZE, height: CARD_SIZE, borderRadius: 8, marginBottom: 6 },
  radio: {
    position: "absolute", top: 6, left: 6, width: 16, height: 16,
    borderRadius: 8, borderWidth: 1.5, borderColor: "#fff", backgroundColor: "transparent"
  },
  radioActive: { backgroundColor: "#FEEDB6" },
  name: { fontSize: 14, color: "#fff", fontFamily: "Alice-Regular" },
  count: { fontSize: 12, color: "#fff", fontFamily: "Alice-Regular", opacity: 0.7 },
  footer: { position: "absolute", left: 0, right: 0,marginBottom:30, zIndex:99, flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 26, backgroundColor: "#11152A" },
  footerText: { color: "#fff", fontFamily: "Alice-Regular", fontSize: 16 },
  plusWrap: { position: "absolute", width: "100%", alignItems: "center", zIndex: 10 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: 300, backgroundColor: "#fff", borderRadius: 16, padding: 20, alignItems: "center" },
  modalTitle: { fontSize: 20, fontFamily: "Alice-Regular", color: "#11152A", marginBottom: 20 },
  input: { width: "100%", borderBottomWidth: 1, borderBottomColor: "#11152A", paddingBottom: 8, marginBottom: 24, fontSize: 16, textAlign: "center" },
  modalRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#ccc", width: "100%" },
  modalBtn: { flex: 1, alignItems: "center", paddingVertical: 14 },
  cancel: { fontSize: 16, color: "#007AFF", fontFamily: "Alice-Regular" },
  create: { fontSize: 16, color: "#007AFF", fontFamily: "Alice-Regular" },
  confirm: { fontSize: 16, color: "#11152A", fontFamily: "Alice-Regular", marginBottom: 20, textAlign: "center" },
  delete: { fontSize: 16, color: "#FF3B30", fontFamily: "Alice-Regular" },
  divider: { width: 1, backgroundColor: "#ccc" },
});