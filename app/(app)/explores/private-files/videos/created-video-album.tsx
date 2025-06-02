/* CreatedVideoAlbum.tsx */
import React, { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Modal, ActivityIndicator, Alert,
} from "react-native";
import { Video } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import * as FileSystem     from "expo-file-system";
import * as MediaLibrary   from "expo-media-library";

import DownloadIcon from "@/assets/images/svg-icons/download-white.svg";
import NoVideoIcon  from "@/assets/images/svg-icons/no-video.svg";
import api          from "@/services/api";
import { useFocusEffect } from "@react-navigation/native";

type VideoItem = { _id: string; url: string };

export default function CreatedVideoAlbum() {
  /* ─── params & state ─────────────────────────────────────── */
  const router = useRouter();
  const { id: starId, albumId, albumName } = useLocalSearchParams<{
    id: string; albumId: string; albumName: string;
  }>();

  const [videos, setVideos]           = useState<VideoItem[]>([]);
  const [loading, setLoading]         = useState(true);

  const [selectMode, setSelectMode]   = useState(false);
  const [selected, setSelected]       = useState<string[]>([]);

  const [fullscreen, setFullscreen]   = useState<string | null>(null);

  const isSel = (vid: string) => selected.includes(vid);

  /* ─── fetch videos ───────────────────────────────────────── */
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

  useEffect(() => { fetchVideos(); }, [starId, albumId]);

  useFocusEffect(useCallback(() => {
    setSelectMode(false); setSelected([]); fetchVideos();
  }, [starId, albumId]));

  /* ─── download flow ──────────────────────────────────────── */
  const onDownloadPress = () => {
    if (!selectMode) {             // 1ste tap => select mode
      setSelectMode(true); return;
    }
    if (selected.length === 0) {
      Alert.alert("Select videos first"); return;
    }
    Alert.alert(
      "Download videos",
      `Download ${selected.length} file${selected.length !== 1 ? "s" : ""} to your device?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Download", onPress: downloadSelected },
      ]
    );
  };

  const downloadSelected = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission denied"); return; }

    for (const id of selected) {
      const vid = videos.find(v => v._id === id); if (!vid) continue;
      const uri = FileSystem.documentDirectory + id + ".mp4";
      try {
        const { uri: saved } = await FileSystem.downloadAsync(vid.url, uri);
        await MediaLibrary.saveToLibraryAsync(saved);
      } catch (e) { console.warn("DL error", e); }
    }
    Alert.alert("Done", `${selected.length} video(s) saved.`);
    setSelectMode(false); setSelected([]);
  };

  /* ─── UI ─────────────────────────────────────────────────── */
  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FEEDB6" /></View>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} /></Svg>
        </TouchableOpacity>

        <Text style={styles.title}>{decodeURIComponent(albumName)}</Text>

        <TouchableOpacity onPress={onDownloadPress} style={{ padding: 8 }}>
          <DownloadIcon width={22} height={22} />
        </TouchableOpacity>
      </View>

      {/* grid */}
      <FlatList
        data={videos}
        keyExtractor={(i) => i._id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => {
          const first = index % 3 === 0;
          return (
            <TouchableOpacity
              onPress={() => {
                if (selectMode) {
                  setSelected(s => isSel(item._id) ? s.filter(x => x !== item._id) : [...s, item._id]);
                } else { setFullscreen(item.url); }
              }}
            >
              <View style={{ position: "relative" }}>
                <Video
                  source={{ uri: item.url }}
                  style={[
                    styles.thumb,
                    { marginLeft: first ? 16 : 8, marginRight: 8, opacity: selectMode && !isSel(item._id) ? 0.6 : 1 },
                  ]}
                  shouldPlay={false}
                  isMuted
                  resizeMode="cover"
                />
                {selectMode && (
                  <View style={[
                    styles.check,
                    isSel(item._id) && styles.checkActive,
                  ]}/>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}><NoVideoIcon width={130} height={130} />
            <Text style={styles.emptyText}>No videos yet.</Text>
          </View>
        }
      />

      {/* download bar */}
      {selectMode && selected.length > 0 && (
        <TouchableOpacity style={styles.bar} onPress={onDownloadPress}>
          <Text style={styles.barText}>
            Download {selected.length} video{selected.length !== 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>
      )}

      {/* fullscreen player */}
      <Modal visible={!!fullscreen} transparent animationType="fade">
        <View style={styles.fullOverlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setFullscreen(null)}>
            <Text style={{ color: "#fff", fontSize: 30 }}>×</Text>
          </TouchableOpacity>
          {fullscreen && (
            <Video
              source={{ uri: fullscreen }}
              style={styles.fullVideo}
              shouldPlay
              useNativeControls
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ─── styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  title: { color: "#fff", fontSize: 20, fontFamily: "Alice-Regular" },

  grid: { paddingTop: 68, paddingBottom: 180 },
  thumb: { width: 109, height: 109, borderRadius: 8, marginBottom: 16 },
  check: {
    position: "absolute", top: 6, right: 12, width: 18, height: 18,
    borderRadius: 9, borderWidth: 2, borderColor: "#fff",
  },
  checkActive: { backgroundColor: "#FEEDB6" },

  empty: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 400 },
  emptyText: { marginTop: 16, color: "#fff", fontFamily: "Alice-Regular", textAlign: "center" },

  bar: {
    position: "absolute", bottom: 80, left: 0, right: 0,
    backgroundColor: "#11152A", padding: 22, alignItems: "center",
  },
  barText: { color: "#fff", fontSize: 16, fontFamily: "Alice-Regular" },

  fullOverlay: { flex: 1, backgroundColor: "black", justifyContent: "center", alignItems: "center" },
  fullVideo: { width: "100%", height: "80%" },
  closeBtn: { position: "absolute", top: 60, right: 20 },
});