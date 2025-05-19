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
import * as FileSystem from "expo-file-system";

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
  const [deleteMode, setDeleteMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmDel, setConfirmDel] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setMenuOpen(false);
      setDeleteMode(false);
      setSelected([]);
      fetchVideos();
    }, [starId, albumId])
  );

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/stars/${starId}/video-albums/${albumId}/videos`
      );
      setVideos(data as VideoItem[]);
    } catch {
      Alert.alert("Error", "Could not load videos.");
    } finally {
      setLoading(false);
    }
  };

  const uploadVideo = async () => {
    console.log("[uploadVideo] Start");
  
    try {
      const perm = await VideoPicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission required", "Enable media access.");
        console.warn("[uploadVideo] Media permission not granted");
        return;
      }
  
      const res = await VideoPicker.launchImageLibraryAsync({
        mediaTypes: VideoPicker.MediaTypeOptions.Videos,
      });
  
      if (res.canceled) {
        console.log("[uploadVideo] Video picker canceled");
        return;
      }
  
      const asset = res.assets[0];
      if (!asset) {
        console.error("[uploadVideo] No asset returned from picker");
        Alert.alert("Error", "No video selected");
        return;
      }
  
      console.log("[uploadVideo] Picked video:", {
        uri: asset.uri,
        fileName: asset.fileName,
        type: asset.mimeType,
      });
  
      const fd = new FormData();
      fd.append("video", {
        uri: asset.uri,
        name: asset.fileName ?? "video.mp4",
        type: asset.mimeType ?? "video/mp4",
      } as any);
  
      console.log("[uploadVideo] FormData constructed, sending request...");
  
      const response = await api.post(
        `/stars/${starId}/video-albums/${albumId}/videos/upload`,
        fd
      );
  
      console.log("[uploadVideo] Upload success:", response.data);
      fetchVideos();
  
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message ?? err.message;
  
      console.error("[uploadVideo] Upload failed:", {
        status,
        message,
        response: err.response?.data,
      });
  
      Alert.alert(
        "Upload failed",
        typeof message === "string" ? message : "Unexpected error"
      );
    }
  };

  const deleteSelected = async () => {
    setConfirmDel(false);
    await Promise.all(
      selected.map((vid) =>
        api.delete(`/videos/detail/${vid}`).catch(console.error)
      )
    );
    setSelected([]);
    setDeleteMode(false);
    fetchVideos();
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FEEDB6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000", "#273166", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Svg width={24} height={24}>
            <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.title}>{decodeURIComponent(albumName)}</Text>
        <TouchableOpacity onPress={() => setMenuOpen((o) => !o)}>
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* MENU */}
      {menuOpen && (
          <View style={styles.menuBox}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                router.push({
                  pathname:
                    "(app)/my-stars/private-star/videos/three-dots/add-people/VideoAddPeoplePage",
                    params: { id: starId, albumId, albumName },
                })
              }
            >
              <Feather name="user-plus" size={16} color="#11152A" style={{ marginRight: 10 }} />
              <Text style={styles.menuText}>Add people</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() =>
                router.push({
                  pathname:
                    "/(app)/my-stars/private-star/videos/three-dots/see-members/SeeMembersPhoto",
                  params: { id, albumId, albumName },
                })
              }
            >
              <Feather name="users" size={16} color="#11152A" style={{ marginRight: 10 }} />
              <Text style={styles.menuText}>See members</Text>
            </TouchableOpacity>

            {["Delete", "Copy to album", "Move to album"].map((action, idx) => (
              <TouchableOpacity
                key={action}
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  setDeleteMode(true);
                  setSelected([]);
                  setShowCopy(action === "Copy to album");
                  setShowMove(action === "Move to album");
                }}
              >
                <Feather
                  name={["trash-2", "copy", "folder-minus"][idx] as any}
                  size={16}
                  color="#11152A"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.menuText}>{action}</Text>
              </TouchableOpacity>
            ))}
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
                if (deleteMode) {
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
                    {
                      marginLeft: first ? 16 : 8,
                      marginRight: 8,
                      opacity: deleteMode && !isSel ? 0.6 : 1,
                    },
                  ]}
                  shouldPlay={false}
                  isMuted
                  resizeMode="cover"
                />
                {deleteMode && (
                  <View
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 12,
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 2,
                      borderColor: "#fff",
                      backgroundColor: isSel ? "#FEEDB6" : "transparent",
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <NoVideoIcon width={130} height={130} />
            <Text style={styles.emptyText}>
              No videos yet.{"\n"}Upload your first video now.
            </Text>
          </View>
        }
      />

      {/* FOOTER ACTION */}
      {deleteMode && selected.length > 0 && (
        <TouchableOpacity style={styles.footer} onPress={() => setConfirmDel(true)}>
          <Feather name="trash-2" size={20} color="#fff" style={{ marginRight: 10 }} />
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

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, marginTop: 0 },
  title: { color: "#fff", fontSize: 20, fontFamily: "Alice-Regular" },
  menuDots: { color: "#fff", fontSize: 28 },
  menuBox: { position: "absolute", top: 90, right: 16, backgroundColor: "#fff", borderRadius: 8, padding: 8, zIndex: 10 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  grid: { paddingTop: 68, paddingBottom: 180 },
  thumb: { width: 109, height: 109, borderRadius: 8, marginBottom: 16 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 400 },
  emptyText: { marginTop: 16, color: "#fff", fontFamily: "Alice-Regular", textAlign: "center", lineHeight: 20 },
  footer: { position: "absolute", bottom: 80, left: 0, right: 0, backgroundColor: "#11152A", padding: 18, flexDirection: "row", justifyContent: "center" },
  footerText: { color: "#fff", fontFamily: "Alice-Regular", fontSize: 16 },
  plus: { position: "absolute", bottom: 100, width: "100%", alignItems: "center" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalBox: { backgroundColor: "#fff", borderRadius: 16, padding: 20, width: 280 },
  modalRow: { flexDirection: "row", borderTopWidth: 1, borderColor: "#ccc", marginTop: 20 },
  modalBtn: { flex: 1, alignItems: "center", paddingVertical: 12 },
  divider: { width: 1, backgroundColor: "#ccc" },
});