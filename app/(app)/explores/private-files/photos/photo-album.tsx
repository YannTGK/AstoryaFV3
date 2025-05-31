// app/(app)/explores/private-files/photos/photo-album.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import PlusIcon from "@/assets/images/svg-icons/plus.svg";
import NoAlbumIcon from "@/assets/images/svg-icons/no-album.svg";
import api from "@/services/api";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 64) / 3;

type Album = { _id: string; name: string; count: number; cover?: string };

export default function PhotoAlbumsScreen() {
  const router = useRouter();
  const { id, canEdit: canEditParam, isOwner: isOwnerParam } = useLocalSearchParams<{
    id: string;
    canEdit: string;
    isOwner: string;
  }>();
  const insets = useSafeAreaInsets();

  // interpret params
  const isOwner = isOwnerParam === "true";
  const canEdit = isOwner || canEditParam === "true";

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const [showNew, setShowNew] = useState(false);
  const [albumName, setAlbumName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fetchAlbums = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const base = (await api.get(`/stars/${id}/photo-albums`)).data as any[];
      const full = await Promise.all(
        base.map(async (a) => {
          try {
            const photos = (await api.get(
              `/stars/${id}/photo-albums/${a._id}/photos`
            )).data as { _id: string; url: string }[];
            return {
              _id: a._id,
              name: a.name,
              count: photos.length,
              cover: photos[0]?.url ?? null,
            } as Album;
          } catch {
            return { _id: a._id, name: a.name, count: 0, cover: null } as Album;
          }
        })
      );
      setAlbums(full);
    } catch (e) {
      console.error("Album fetch error:", e);
      Alert.alert("Error", "Could not load albums.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAlbums();
    }, [id])
  );

  const allSelected = selected.length === albums.length && albums.length > 0;
  const toggleAlbum = (aid: string) =>
    setSelected((p) =>
      p.includes(aid) ? p.filter((i) => i !== aid) : [...p, aid]
    );

  const createAlbum = async () => {
    const name = albumName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const res = await api.post(`/stars/${id}/photo-albums`, { name });
      setShowNew(false);
      setAlbumName("");
      fetchAlbums();
      router.push({
        pathname: "/(app)/explores/private-files/photos/created-album",
        params: { id, albumId: res.data._id, albumName: res.data.name },
      });
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message ?? "Could not create album.");
    } finally {
      setCreating(false);
    }
  };

  const deleteAlbums = async () => {
    setShowDelete(false);
    await Promise.all(
      selected.map((aId) =>
        api.delete(`/photo-albums/detail/${aId}`).catch(console.error)
      )
    );
    setSelected([]);
    setEditMode(false);
    fetchAlbums();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FEEDB6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 10 }]}
        onPress={() => router.back()}
      >
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={[styles.title, { marginTop: insets.top + 10 }]}>Photo albums</Text>

      {/* only show Edit button if canEdit */}
      {!editMode && albums.length > 0 && canEdit && (
        <TouchableOpacity
          style={[styles.editIcon, { top: insets.top + 60 }]}
          onPress={() => setEditMode(true)}
        >
          <Feather name="edit" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {editMode && albums.length > 0 && (
        <View style={[styles.allSelectWrapper, { marginTop: insets.top + 38 }]}>
          <TouchableOpacity
            style={styles.selectAllBtn}
            onPress={() => {
              setSelected(allSelected ? [] : albums.map((a) => a._id));
              if (allSelected) setEditMode(false);
            }}
          >
            <View
              style={[styles.selectCircle, allSelected && styles.selectCircleActive]}
            />
            <Text style={styles.selectText}>All</Text>
          </TouchableOpacity>
        </View>
      )}

      {albums.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <NoAlbumIcon width={130} height={130} />
          <Text style={styles.emptyText}>No photo album found</Text>
        </View>
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(i) => i._id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => {
            const sel = selected.includes(item._id);
            return (
              <TouchableOpacity
                style={styles.albumCard}
                onPress={() => {
                  if (editMode) toggleAlbum(item._id);
                  else
                    router.push({
                      pathname: "/(app)/explores/private-files/photos/created-album",
                      params: { id, albumId: item._id, albumName: item.name },
                    });
                }}
              >
                {item.cover ? (
                  <Image source={{ uri: item.cover }} style={styles.albumImg} />
                ) : (
                  <View style={[styles.albumImg, { backgroundColor: "#999", opacity: 0.2 }]} />
                )}
                {editMode && <View style={[styles.radio, sel && styles.radioActive]} />}
                <Text style={styles.albumTitle}>{item.name}</Text>
                <Text style={styles.albumCount}>{item.count}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {editMode && selected.length > 0 && (
        <TouchableOpacity
          style={[styles.footerBar, { bottom: insets.bottom + 20 }]}
          onPress={() => setShowDelete(true)}
        >
          <Feather name="trash-2" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.footerText}>
            {selected.length} album{selected.length !== 1 ? "s" : ""} selected
          </Text>
        </TouchableOpacity>
      )}

      {canEdit && (
        <View style={[styles.plusWrapper, { bottom: insets.bottom + 80 }]}>
          <TouchableOpacity onPress={() => setShowNew(true)}>
            <PlusIcon width={50} height={50} />
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showNew} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create Album</Text>
            <TextInput
              value={albumName}
              onChangeText={setAlbumName}
              placeholder="Album Name"
              placeholderTextColor="#999"
              style={styles.input}
              editable={!creating}
            />
            <View style={styles.row}>
              <TouchableOpacity style={styles.halfBtn} disabled={creating} onPress={() => setShowNew(false)}>
                <Text style={styles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.halfBtn} disabled={creating} onPress={createAlbum}>
                {creating ? <ActivityIndicator color="#007AFF" /> : <Text style={styles.createTxt}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDelete} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.confirmTxt}>Delete selected album(s)?</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.halfBtn} onPress={() => setShowDelete(false)}>
                <Text style={styles.cancelTxt}>No</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.halfBtn} onPress={deleteAlbums}>
                <Text style={styles.deleteTxt}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  backBtn: { position: "absolute", left: 20, zIndex: 10 },
  title: { position: "absolute", alignSelf: "center", fontSize: 20, color: "#fff", fontFamily: "Alice-Regular" },
  editIcon: { position: "absolute", right: 20, zIndex: 10 },
  allSelectWrapper: { position: "absolute", right: 16 },
  selectAllBtn: { flexDirection: "row", alignItems: "center" },
  selectCircle: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: "#fff" },
  selectCircleActive: { backgroundColor: "#FEEDB6" },
  selectText: { color: "#fff", fontFamily: "Alice-Regular", marginLeft: 10 },
  emptyWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 16, color: "#fff", fontFamily: "Alice-Regular" },
  grid: { paddingTop: 90, paddingHorizontal: 16, paddingBottom: 160 },
  albumCard: { width: CARD_SIZE, marginBottom: 20, marginHorizontal: 6, alignItems: "center", position: "relative" },
  albumImg: { width: CARD_SIZE, height: CARD_SIZE, borderRadius: 8, marginBottom: 6 },
  albumTitle: { fontSize: 14, color: "#fff", fontFamily: "Alice-Regular" },
  albumCount: { fontSize: 12, color: "#fff", fontFamily: "Alice-Regular", opacity: 0.7 },
  radio: { position: "absolute", top: 6, left: 6, width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: "#fff" },
  radioActive: { backgroundColor: "#FEEDB6" },
  footerBar: { position: "absolute", left: 0, right: 0, flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#11152A" },
  footerText: { color: "#fff", fontFamily: "Alice-Regular", fontSize: 16 },
  plusWrapper: { position: "absolute", width: "100%", alignItems: "center", zIndex: 10 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: 300, backgroundColor: "#fff", borderRadius: 16, padding: 20, alignItems: "center" },
  modalTitle: { fontSize: 20, fontFamily: "Alice-Regular", color: "#11152A", marginBottom: 20 },
  input: { width: "100%", borderBottomWidth: 1, borderBottomColor: "#11152A", fontSize: 16, textAlign: "center", paddingBottom: 8, marginBottom: 24 },
  row: { flexDirection: "row", borderTopWidth: 1, borderColor: "#ccc", width: "100%" },
  halfBtn: { flex: 1, alignItems: "center", paddingVertical: 14 },
  divider: { width: 1, backgroundColor: "#ccc" },
  cancelTxt: { fontSize: 16, color: "#007AFF", fontFamily: "Alice-Regular" },
  createTxt: { fontSize: 16, color: "#007AFF", fontFamily: "Alice-Regular" },
  confirmTxt: { fontSize: 16, fontFamily: "Alice-Regular", color: "#11152A", marginBottom: 20, textAlign: "center" },
  deleteTxt: { fontSize: 16, color: "#FF3B30", fontFamily: "Alice-Regular" },
});