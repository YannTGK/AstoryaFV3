// app/(app)/my-stars/private-star/videos/three-dots/created-video-album/CreatedVideoAlbum.tsx

import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Modal, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import * as VideoPicker from "expo-image-picker";
import { Video } from "expo-av";
import api from "@/services/api";
import { useFocusEffect } from "@react-navigation/native";
import PlusIcon from "@/assets/images/svg-icons/plus.svg";
import NoVideoIcon from "@/assets/images/svg-icons/no-video.svg";

type VideoItem = { _id: string; url: string };

export default function CreatedVideoAlbum() {
  const router = useRouter();
  const { id: starId, albumId, albumName } = useLocalSearchParams<{
    id: string;
    albumId: string;
    albumName: string;
  }>();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [mode, setMode] = useState<"delete" | "copy" | "move" | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);

  useFocusEffect(
    useCallback(() => {
      resetState();
      fetchVideos();
    }, [starId, albumId])
  );

  const resetState = () => {
    setMenuOpen(false);
    setSelected([]);
    setMode(null);
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/stars/${starId}/video-albums/${albumId}/videos`);
      setVideos(data as VideoItem[]);
    } catch {
      Alert.alert("Error", "Could not load videos.");
    } finally {
      setLoading(false);
    }
  };

  const uploadVideo = async () => {
    try {
      const perm = await VideoPicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission required", "Enable media access.");
        return;
      }

      const res = await VideoPicker.launchImageLibraryAsync({
        mediaTypes: VideoPicker.MediaTypeOptions.Videos,
      });

      if (res.canceled || !res.assets?.[0]) return;
      const asset = res.assets[0];

      const fd = new FormData();
      fd.append("video", {
        uri: asset.uri,
        name: asset.fileName ?? "video.mp4",
        type: asset.mimeType ?? "video/mp4",
      } as any);

      await api.post(`/stars/${starId}/video-albums/${albumId}/videos/upload`, fd);
      fetchVideos();
    } catch (err: any) {
      Alert.alert("Upload failed", err?.response?.data?.message || err.message);
    }
  };

  const deleteSelected = async () => {
    setConfirmDel(false);
    try {
      for (const vid of selected) {
        await api.delete(`/stars/${starId}/video-albums/${albumId}/videos/detail/${vid}`);
      }
      Alert.alert("Success", "Selected videos deleted.");
    } catch {
      Alert.alert("Error", "Failed to delete videos.");
    } finally {
      resetState();
      fetchVideos();
    }
  };

  const openActionScreen = (type: "copy" | "move") => {
    if (!selected.length) {
      Alert.alert("Select videos first");
      return;
    }

    router.push({
      pathname:
        type === "copy"
          ? "/(app)/my-stars/private-star/videos/three-dots/copy-album/selected-album"
          : "/(app)/my-stars/private-star/videos/three-dots/move-album/move-album",
      params: {
        id: starId,
        albumId,
        selected: JSON.stringify(selected),
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} /></Svg>
        </TouchableOpacity>
        <Text style={styles.title}>{decodeURIComponent(albumName)}</Text>
        <TouchableOpacity onPress={() => setMenuOpen((o) => !o)}>
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* MENU */}
      {menuOpen && (
        <View style={styles.menuBox}>
          <MenuItem label="Add people" icon="user-plus" onPress={() => router.push({
            pathname: "/(app)/my-stars/private-star/videos/three-dots/add-people/VideoAddPeoplePage",
            params: { id: starId, albumId, albumName },
          })} />
          <MenuItem label="See members" icon="users" onPress={() => router.push({
            pathname: "/(app)/my-stars/private-star/videos/three-dots/see-members/SeeMembersVideo",
            params: { id: starId, albumId, albumName },
          })} />
          <MenuItem label="Delete" icon="trash-2" onPress={() => { setMode("delete"); setSelected([]); setMenuOpen(false); }} />
          <MenuItem label="Copy to album" icon="copy" onPress={() => { setMode("copy"); setSelected([]); setMenuOpen(false); }} />
          <MenuItem label="Move to album" icon="folder-minus" onPress={() => { setMode("move"); setSelected([]); setMenuOpen(false); }} />
        </View>
      )}

      {/* GRID */}
      <FlatList
        data={videos}
        keyExtractor={(i) => i._id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => {
          const first = index % 3 === 0;
          const isSel = selected.includes(item._id);
          return (
            <TouchableOpacity
              onPress={() => {
                if (mode) {
                  setSelected((s) =>
                    s.includes(item._id)
                      ? s.filter((x) => x !== item._id)
                      : [...s, item._id]
                  );
                }
              }}
            >
              <View style={{ position: "relative" }}>
                <Video
                  source={{ uri: item.url }}
                  style={[
                    styles.thumb,
                    { marginLeft: first ? 16 : 8, marginRight: 8, opacity: mode && !isSel ? 0.6 : 1 },
                  ]}
                  shouldPlay={false}
                  isMuted
                  resizeMode="cover"
                />
                {mode && (
                  <View style={{
                    position: "absolute",
                    top: 6,
                    right: 12,
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    borderWidth: 2,
                    borderColor: "#fff",
                    backgroundColor: isSel ? "#FEEDB6" : "transparent",
                  }} />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <NoVideoIcon width={130} height={130} />
            <Text style={styles.emptyText}>No videos yet.{"\n"}Upload your first video now.</Text>
          </View>
        }
      />

      {/* FOOTER */}
      {mode && selected.length > 0 && (
        <TouchableOpacity
          style={styles.footer}
          onPress={() => {
            if (mode === "delete") return setConfirmDel(true);
            if (mode === "copy") return openActionScreen("copy");
            if (mode === "move") return openActionScreen("move");
          }}
        >
          <Feather
            name={mode === "delete" ? "trash-2" : mode === "copy" ? "copy" : "folder-minus"}
            size={20}
            color="#fff"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.footerText}>
            {selected.length} video{selected.length !== 1 ? "s" : ""} selected
          </Text>
        </TouchableOpacity>
      )}

      {/* UPLOAD BUTTON */}
      <View style={styles.plus}>
        <TouchableOpacity onPress={uploadVideo}>
          <PlusIcon width={50} height={50} />
        </TouchableOpacity>
      </View>

      {/* DELETE CONFIRM */}
      <Modal visible={confirmDel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text>Delete selected video{selected.length !== 1 ? "s" : ""}?</Text>
            <View style={styles.modalRow}>
              <TouchableOpacity onPress={() => setConfirmDel(false)} style={styles.modalBtn}>
                <Text style={{ color: "#007AFF" }}>No</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity onPress={deleteSelected} style={styles.modalBtn}>
                <Text style={{ color: "#007AFF" }}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helper: menu item
const MenuItem = ({ label, icon, onPress }: { label: string; icon: any; onPress: () => void }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Feather name={icon} size={16} color="#11152A" />
    <Text style={{ marginLeft: 8 }}>{label}</Text>
  </TouchableOpacity>
);

// Helper: divider
const Divider = () => (
  <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 8 }} />
);

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  title: { color: "#fff", fontSize: 20, fontFamily: "Alice-Regular" },
  menuDots: { color: "#fff", fontSize: 28 },
  menuBox: {
    position: "absolute", top: 90, right: 16, backgroundColor: "#fff", borderRadius: 8, padding: 8, zIndex: 10,
  },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  grid: { paddingTop: 68, paddingBottom: 180 },
  thumb: { width: 109, height: 109, borderRadius: 8, marginBottom: 16 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 400 },
  emptyText: { marginTop: 16, color: "#fff", fontFamily: "Alice-Regular", textAlign: "center", lineHeight: 20 },
  footer: {
    position: "absolute", bottom: 80, left: 0, right: 0, backgroundColor: "#11152A",
    padding: 26, zIndex: 99, flexDirection: "row", justifyContent: "center",
  },
  footerText: { color: "#fff", fontFamily: "Alice-Regular", fontSize: 16 },
  plus: { position: "absolute", bottom: 100, width: "100%", alignItems: "center" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalBox: { backgroundColor: "#fff", borderRadius: 16, padding: 20, width: 280 },
  modalRow: { flexDirection: "row", borderTopWidth: 1, borderColor: "#ccc", marginTop: 20 },
  modalBtn: { flex: 1, alignItems: "center", paddingVertical: 12 },
  divider: { width: 1, backgroundColor: "#ccc" },
});