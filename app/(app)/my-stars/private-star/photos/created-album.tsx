// app/(app)/my-stars/private-star/photos/created-album.tsx
import React, { useEffect, useState } from "react";
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

import PlusIcon      from "@/assets/images/svg-icons/plus.svg";
import NoPictureIcon from "@/assets/images/svg-icons/no-picture.svg";
import api           from "@/services/api";

/* ---------- typing ---------- */
type Photo = { _id: string; url: string };

export default function AlbumPage() {
  const router               = useRouter();
  const { id, albumId, albumName } =
    useLocalSearchParams<{ id: string; albumId: string; albumName: string }>();

  /* ---------- state ---------- */
  const [images, setImages]               = useState<Photo[]>([]);
  const [loading, setLoading]             = useState(true);

  const [modalVisible, setModalVisible]   = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [menuOpen, setMenuOpen]           = useState(false);
  const [isDeleteMode, setIsDeleteMode]   = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showCopyButton, setShowCopyButton] = useState(false);
  const [showMoveButton, setShowMoveButton] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  /* ---------- helpers ---------- */
  const imageViewerData = images.map((p) => ({ url: p.url }));
  const isSelected = (pid: string) => selectedPhotos.includes(pid);

  /* ---------- API calls ---------- */
  const fetchPhotos = async () => {
    if (!id || !albumId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/stars/${id}/photo-albums/${albumId}/photos`);
      setImages(
        data.map((p: any) => ({
          _id: p._id,
          url: p.fileUrl, 
        })),
      );
    } catch (err) {
      console.error("Photo fetch error:", err);
      Alert.alert("Error", "Could not load photos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [id, albumId]);

  const uploadPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Enable photo access to upload.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (result.canceled) return;

    try {
      const asset = result.assets[0];
      const form  = new FormData();
      form.append("photo", {
        uri:  asset.uri,
        name: asset.fileName ?? "photo.jpg",
        type: asset.mimeType ?? "image/jpeg",
      } as any);

      await api.post(
        `/stars/${id}/photo-albums/${albumId}/photos/upload`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      fetchPhotos();
    } catch (err: any) {
      console.error(err.response?.data);
      Alert.alert("Upload failed", err.response?.data?.message ?? "Try again.");
    }
  };

  const deleteSelected = async () => {
    setConfirmDeleteVisible(false);
    for (const pid of selectedPhotos) {
      await api.delete(`/photos/detail/${pid}`).catch(console.error);
    }
    setSelectedPhotos([]);
    setIsDeleteMode(false);
    fetchPhotos();
  };

  /* ---------- render helpers ---------- */
  const handlePhotoPress = (photo: Photo, index: number) => {
    if (isDeleteMode) {
      setSelectedPhotos((prev) =>
        prev.includes(photo._id)
          ? prev.filter((id) => id !== photo._id)
          : [...prev, photo._id],
      );
    } else {
      setSelectedIndex(index);
      setModalVisible(true);
    }
  };

  /* ---------- UI ---------- */
  if (loading) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center", backgroundColor:"#000" }}>
        <ActivityIndicator size="large" color="#FEEDB6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000", "#273166", "#000"]}
        style={StyleSheet.absoluteFill}
      />

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
          {isDeleteMode && (
            <TouchableOpacity
              style={styles.selectAllBtn}
              onPress={() =>
                setSelectedPhotos(
                  selectedPhotos.length === images.length ? [] : images.map((p) => p._id),
                )
              }
            >
              <View
                style={[
                  styles.selectAllCircle,
                  selectedPhotos.length === images.length && styles.selectAllCircleActive,
                ]}
              />
              <Text style={styles.selectAllText}>All</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isDeleteMode && (
          <TouchableOpacity style={styles.menuDots} onPress={() => setMenuOpen(!menuOpen)}>
            <Text style={styles.menuDotsText}>⋮</Text>
          </TouchableOpacity>
        )}

        {menuOpen && (
          <View style={styles.menuBox}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(app)/my-stars/private-star/photos/three-dots/add-people/AddPeoplePage")}
            >
              <Feather name="user-plus" size={16} color="#11152A" style={{ marginRight: 10 }} />
              <Text style={styles.menuText}>Add people</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(app)/my-stars/private-star/photos/three-dots/see-members/SeeMembersPhoto")}
            >
              <Feather name="users" size={16} color="#11152A" style={{ marginRight: 10 }} />
              <Text style={styles.menuText}>See members</Text>
            </TouchableOpacity>

            {/* Delete / copy / move */}
            {["Delete", "Copy to album", "Move to album"].map((action, idx) => (
              <TouchableOpacity
                key={action}
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  setIsDeleteMode(true);
                  setSelectedPhotos([]);
                  setShowCopyButton(action === "Copy to album");
                  setShowMoveButton(action === "Move to album");
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
      </View>

      {/* IMAGE GRID */}
      <FlatList
        data={images}
        keyExtractor={(item) => item._id}
        numColumns={3}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item, index }) => {
          const isFirstInRow = index % 3 === 0;
          return (
            <TouchableOpacity onPress={() => handlePhotoPress(item, index)}>
              <View style={{ position: "relative" }}>
                <Image
                  source={{ uri: item.url }}
                  style={[
                    styles.gridImage,
                    {
                      marginLeft: isFirstInRow ? 16 : 8,
                      marginRight: 8,
                      opacity: isDeleteMode && !isSelected(item._id) ? 0.6 : 1,
                    },
                  ]}
                  onError={(e) => console.warn('Image load error:', item.url, e.nativeEvent.error)}
                  resizeMode="cover"
                />
                {isDeleteMode && (
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
                      backgroundColor: isSelected(item._id) ? "#FEEDB6" : "transparent",
                    }}
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

      {/* FOOTER ACTION BARS */}
      {isDeleteMode && selectedPhotos.length > 0 && (
        <TouchableOpacity style={styles.deleteBar} onPress={() => setConfirmDeleteVisible(true)}>
          <View style={styles.deleteBarBtn}>
            <Feather name="trash-2" size={20} color="#fff" />
            <Text style={styles.deleteBarText}>
              {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? "’s" : ""} selected
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {showCopyButton && selectedPhotos.length > 0 && (
        <TouchableOpacity style={styles.deleteBar} onPress={() => handleCopyOrMove("copy")}>
          <View style={styles.deleteBarBtn}>
            <Feather name="copy" size={20} color="#fff" />
            <Text style={styles.deleteBarText}>
              Copy {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? "'s" : ""} to album
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {showMoveButton && selectedPhotos.length > 0 && (
        <TouchableOpacity style={styles.deleteBar} onPress={() => handleCopyOrMove("move")}>
          <View style={styles.deleteBarBtn}>
            <Feather name="folder-minus" size={20} color="#fff" />
            <Text style={styles.deleteBarText}>
              Move {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? "'s" : ""} to album
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* IMAGE MODAL */}
      <Modal visible={modalVisible} transparent>
        <ImageViewer
          imageUrls={imageViewerData}
          index={selectedIndex}
          onCancel={() => setModalVisible(false)}
          enableSwipeDown
          onSwipeDown={() => setModalVisible(false)}
        />
        <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </Modal>

      {/* ADD BUTTON */}
      <View style={styles.plusWrapper}>
        <TouchableOpacity onPress={uploadPhoto}>
          <PlusIcon width={50} height={50} />
        </TouchableOpacity>
      </View>

      {/* CONFIRM DELETE MODAL */}
      <Modal visible={confirmDeleteVisible} transparent animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>Are you sure you want to remove the image{selectedPhotos.length > 1 ? "s" : ""}?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity onPress={() => setConfirmDeleteVisible(false)} style={styles.confirmBtn}>
                <Text style={[styles.confirmBtnText, { color: "#007AFF" }]}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={deleteSelected} style={styles.confirmBtn}>
                <Text style={[styles.confirmBtnText, { color: "#007AFF" }]}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* === styles (ongewijzigd) === */
const styles = StyleSheet.create({
  headerContainer: { marginTop: 50, position: "relative" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  backBtn: { zIndex: 10 },
  title: { textAlign: "center", fontSize: 20, color: "#fff", fontFamily: "Alice-Regular", flex: 1 },
  albumTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 28, marginHorizontal: 20, position: "relative" },
  albumTitle: { fontSize: 20, fontFamily: "Alice-Regular", color: "#fff", textAlign: "center", flex: 1 },
  selectAllBtn: { flexDirection: "row", alignItems: "center", position: "absolute", right: 0 },
  selectAllCircle: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: "#fff", backgroundColor: "transparent" },
  selectAllCircleActive: { backgroundColor: "#FEEDB6" },
  selectAllText: { fontFamily: "Alice-Regular", color: "#fff", fontSize: 14, marginLeft: 10 },
  menuDots: { position: "absolute", right: 16, top: 53 },
  menuDotsText: { color: "#fff", fontSize: 28, lineHeight: 28 },
  menuBox: { position: "absolute", top: 105, right: 16, backgroundColor: "#fff", borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 10, zIndex: 999 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  menuText: { fontFamily: "Alice-Regular", fontSize: 14, color: "#11152A" },
  gridContainer: { paddingBottom: 180, paddingTop: 68 },
  gridImage: { width: 109, height: 109, borderRadius: 8, marginBottom: 16 },
  emptyStateWrapper: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 400 },
  noMemoriesText: { marginTop: 16, color: "#fff", fontFamily: "Alice-Regular", fontSize: 14, textAlign: "center", paddingHorizontal: 20, lineHeight: 20 },
  plusWrapper: { position: "absolute", bottom: 100, width: "100%", alignItems: "center", zIndex: 10 },
  closeBtn: { position: "absolute", top: 72, right: 20, zIndex: 101 },
  closeText: { color: "#fff", fontSize: 32 },
  deleteBar: { position: "absolute", bottom: 80, left: 0, right: 0, backgroundColor: "#11152A", paddingVertical: 18, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: "#2D2D2D", flexDirection: "row", alignItems: "center", justifyContent: "center", zIndex: 999, elevation: 20 },
  deleteBarBtn: { flexDirection: "row", alignItems: "center", gap: 10 },
  deleteBarText: { color: "#fff", fontFamily: "Alice-Regular", fontSize: 16 },
  confirmOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  confirmBox: { backgroundColor: "#fff", borderRadius: 16, paddingVertical: 20, paddingHorizontal: 20, width: 280, alignItems: "center" },
  confirmText: { fontFamily: "Alice-Regular", fontSize: 16, textAlign: "center", color: "#11152A", marginBottom: 20 },
  confirmButtons: { flexDirection: "row", borderTopWidth: 1, borderColor: "#ccc", width: "100%" },
  confirmBtn: { flex: 1, alignItems: "center", paddingVertical: 12, borderRightWidth: 0.5, borderColor: "#ccc" },
  confirmBtnText: { fontFamily: "Alice-Regular", fontSize: 16 },
});