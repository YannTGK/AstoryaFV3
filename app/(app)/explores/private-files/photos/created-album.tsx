// /(app)/dedicates/created-dedicates/photos/created-album.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";
import ImageViewer from "react-native-image-zoom-viewer";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

import DownloadIcon from "@/assets/images/svg-icons/download-white.svg";
import NoPictureIcon from "@/assets/images/svg-icons/no-picture.svg";
import api from "@/services/api";

type Photo = { _id: string; url: string };

export default function AlbumPage() {
  /* ───────────────────────────────── state/params ─────────── */
  const router = useRouter();
  const { id, albumId, albumName } =
    useLocalSearchParams<{ id: string; albumId: string; albumName: string }>();

  const [images, setImages]           = useState<Photo[]>([]);
  const [loading, setLoading]         = useState(true);
  const [viewerOpen, setViewerOpen]   = useState(false);
  const [viewerIdx, setViewerIdx]     = useState(0);

  const [selectMode, setSelectMode]   = useState(false); // ↓ alleen voor downloaden
  const [selected, setSelected]       = useState<string[]>([]);

  const viewerData = images.map((p) => ({ url: p.url }));
  const isSel      = (pid: string) => selected.includes(pid);

  /* ─────────────────────────── foto’s ophalen ─────────────── */
  const fetchPhotos = async () => {
    if (!id || !albumId) return;
    setLoading(true);
    try {
      const { data } = await api.get(
        `/stars/${id}/photo-albums/${albumId}/photos`
      );
      setImages(data as Photo[]);
    } catch (err) {
      console.error("Photo fetch error:", err);
      Alert.alert("Error", "Could not load photos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPhotos(); }, [id, albumId]);

  /* reset overlays wanneer tab opnieuw in focus komt */
  useFocusEffect(
    useCallback(() => {
      setSelectMode(false);
      setSelected([]);
      fetchPhotos();
    }, [id, albumId])
  );

  /* ──────────────────────── DOWNLOAD FLOW ─────────────────── */
  const handleDownloadPress = () => {
    if (!selectMode) {
      // eerste tap: selectie­modus aanzetten
      setSelectMode(true);
      setSelected([]);
      return;
    }
    if (selected.length === 0) {
      Alert.alert("No photos selected", "Tap the images you wish to download.");
      return;
    }
    Alert.alert(
      "Download photos",
      `Download ${selected.length} photo${selected.length !== 1 ? "s" : ""} to your device?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Download",
          onPress: downloadSelected,
        },
      ]
    );
  };

  const downloadSelected = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Cannot access media library.");
      return;
    }
    for (const pid of selected) {
      const photo = images.find((img) => img._id === pid);
      if (!photo) continue;
      const fileUri = FileSystem.documentDirectory + pid + ".jpg";
      try {
        const dl = await FileSystem.downloadAsync(photo.url, fileUri);
        await MediaLibrary.saveToLibraryAsync(dl.uri);
      } catch (err) {
        console.error("Download error:", err);
      }
    }
    Alert.alert("Download complete", `${selected.length} file(s) saved.`);
    setSelectMode(false);
    setSelected([]);
  };

  /* ───────────────────── klik op foto ─────────────────────── */
  const onPressPhoto = (p: Photo, idx: number) => {
    if (selectMode) {
      setSelected((s) =>
        s.includes(p._id) ? s.filter((i) => i !== p._id) : [...s, p._id]
      );
    } else {
      setViewerIdx(idx);
      setViewerOpen(true);
    }
  };

  /* ───────────────────────────── UI ───────────────────────── */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FEEDB6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Svg width={24} height={24}>
              <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.title}>Photo's</Text>
        </View>

        <View style={styles.albumTitleRow}>
          
          <Text style={styles.albumTitle}>{decodeURIComponent(albumName)}</Text>

          {/* download-icoon rechtsboven */}
          <TouchableOpacity onPress={handleDownloadPress} style={styles.downloadWrapper}>
            <DownloadIcon width={22} height={22} stroke="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* GRID */}
      <FlatList
        data={images}
        keyExtractor={(item) => item._id}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item, index }) => {
          const first = index % 3 === 0;
          return (
            <TouchableOpacity onPress={() => onPressPhoto(item, index)}>
              <View style={{ position: "relative" }}>
                <Image
                  source={{ uri: item.url }}
                  style={[
                    styles.gridImage,
                    {
                      marginLeft: first ? 16 : 8,
                      marginRight: 8,
                      opacity: selectMode && !isSel(item._id) ? 0.6 : 1,
                    },
                  ]}
                  resizeMode="cover"
                />
                {selectMode && (
                  <View
                    style={[
                      styles.checkCircle,
                      isSel(item._id) && styles.checkCircleActive,
                    ]}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyStateWrapper}>
            <NoPictureIcon width={130} height={130} />
            <Text style={styles.noMemoriesText}>
              Every story starts with a moment.{"\n"}Upload your first memory now.
            </Text>
          </View>
        }
      />

      {/* DOWNLOAD ­BAR */}
      {selectMode && selected.length > 0 && (
        <TouchableOpacity style={styles.downloadBar} onPress={handleDownloadPress}>
          <Text style={styles.downloadBarText}>
            Download {selected.length} photo{selected.length !== 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>
      )}

      {/* FULLSCREEN VIEWER */}
      <Modal visible={viewerOpen} transparent>
        <ImageViewer
          imageUrls={viewerData}
          index={viewerIdx}
          enableSwipeDown
          onSwipeDown={() => setViewerOpen(false)}
          onCancel={() => setViewerOpen(false)}
        />
        <TouchableOpacity style={styles.closeBtn} onPress={() => setViewerOpen(false)}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

/* ─────────────────────────── styles ───────────────────────── */
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },

  headerContainer: { marginTop: 50 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backBtn: { zIndex: 10 },
  title: { textAlign: "center", fontSize: 20, color: "#fff", fontFamily: "Alice-Regular", flex: 1 },

  albumTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    marginHorizontal: 20,
  },
  albumTitle: {
    fontSize: 20,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  downloadWrapper: { padding: 8 },
  downloadWrapper2: { visibility: "hidden" },
  gridContainer: { paddingBottom: 180, paddingTop: 68 },
  gridImage: { width: 109, height: 109, borderRadius: 8, marginBottom: 16 },
  checkCircle: {
    position: "absolute",
    top: 6,
    right: 12,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "transparent",
  },
  checkCircleActive: { backgroundColor: "#FEEDB6" },

  emptyStateWrapper: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 400 },
  noMemoriesText: {
    marginTop: 16,
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  /* download-bar onderaan */
  downloadBar: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: "#11152A",
    paddingVertical: 22,
    alignItems: "center",
  },
  downloadBarText: { color: "#fff", fontSize: 16, fontFamily: "Alice-Regular" },

  /* fullscreen viewer close */
  closeBtn: { position: "absolute", top: 72, right: 20 },
  closeText: { color: "#fff", fontSize: 32 },
});