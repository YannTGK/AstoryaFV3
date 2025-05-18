import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import api from "@/services/api";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 64) / 3;

type Album = {
  _id: string;
  name: string;
  coverUrl?: string;
  photoCount: number;
};

export default function MoveAlbumScreen() {
  const router = useRouter();
  const { id, albumId: currentAlbum, selected } =
    useLocalSearchParams<{ id: string; albumId: string; selected: string }>();

  /* ── state ────────────────────────────────────────── */
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const [ask, setAsk] = useState(false);
  const [toast, setToast] = useState(false);

  /* ── fetch albums (excl. huidige) ─────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/stars/${id}/photo-albums`);
        setAlbums((data as Album[]).filter((a) => a._id !== currentAlbum));
      } catch (err) {
        console.error("albums fetch:", err);
        Alert.alert("Error", "Could not load albums.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, currentAlbum]);

  /* ── toggle helpers ───────────────────────────────── */
  const toggle = (aid: string) =>
    setPicked((prev) =>
      prev.includes(aid) ? prev.filter((x) => x !== aid) : [...prev, aid]
    );

  const toggleAll = () =>
    setPicked(picked.length === albums.length ? [] : albums.map((a) => a._id));

  /* ── move call ────────────────────────────────────── */
  const doMove = async () => {
    setAsk(false);
    try {
      const photoIds: string[] = JSON.parse(selected as string);
      await Promise.all(
        picked.map((dest) =>
          api.post(`/stars/${id}/photo-albums/${dest}/photos/move`, { photoIds })
        )
      );
      /* korte “gelukt”-overlay */
      setToast(true);
      setTimeout(() => {
        setToast(false);
        router.back(); // terug naar created-album
      }, 1400);
    } catch (err) {
      console.error("move error:", err);
      Alert.alert("Error", "Move failed, please try again.");
    }
  };

  /* ── loader ───────────────────────────────────────── */
  if (loading) {
    return (
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill}>
        <ActivityIndicator size="large" color="#FEEDB6" style={{ flex: 1 }} />
      </LinearGradient>
    );
  }

  /* ── UI ───────────────────────────────────────────── */
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      {/* ← back */}
      <TouchableOpacity style={st.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={st.title}>Photo albums</Text>

      {/* select-all */}
      <View style={st.allSelectWrapper}>
        <TouchableOpacity style={st.selectAllBtn} onPress={toggleAll}>
          <View
            style={[
              st.selectAllCircle,
              picked.length === albums.length && st.selectAllCircleActive,
            ]}
          />
          <Text style={st.selectAllText}>All</Text>
        </TouchableOpacity>
      </View>

      {/* grid */}
      <FlatList
        data={albums}
        keyExtractor={(a) => a._id}
        numColumns={3}
        contentContainerStyle={st.grid}
        renderItem={({ item }) => {
          const chosen = picked.includes(item._id);
          return (
            <TouchableOpacity style={st.albumCard} onPress={() => toggle(item._id)}>
              {item.coverUrl ? (
                <Image source={{ uri: item.coverUrl }} style={st.albumImage} />
              ) : (
                <View style={[st.albumImage, { backgroundColor: "#999", opacity: 0.2 }]} />
              )}
              <View style={[st.radioCircle, chosen && st.radioCircleActive]} />
              <Text style={st.albumTitle}>{item.name}</Text>
              <Text style={st.albumCount}>{item.photoCount}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* footer bar */}
      {picked.length > 0 && (
        <TouchableOpacity style={st.footerBar} onPress={() => setAsk(true)}>
          <Feather name="folder-minus" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={st.footerText}>
            Move to {picked.length} album{picked.length !== 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>
      )}

      {/* confirm modal */}
      {ask && (
        <View style={st.modalOverlay}>
          <View style={st.modalBox}>
            <Text style={st.modalText}>
              Move to {picked.length} album{picked.length !== 1 ? "s" : ""}?
            </Text>
            <View style={st.modalActions}>
              <TouchableOpacity onPress={() => setAsk(false)} style={st.modalBtn}>
                <Text style={[st.modalBtnText, { color: "#007AFF" }]}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={doMove} style={st.modalBtn}>
                <Text style={[st.modalBtnText, { color: "#007AFF" }]}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* success toast */}
      {toast && (
        <View style={st.toastOverlay}>
          <View style={st.toastBox}>
            <Text style={st.toastTxt}>Photos moved</Text>
          </View>
        </View>
      )}
    </View>
  );
}

/* ── styles (identiek aan copy-screen waar mogelijk) ─────────── */
const st = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 20,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
  grid: { paddingTop: 32, paddingHorizontal: 16, paddingBottom: 120 },
  albumCard: {
    width: CARD_SIZE,
    marginBottom: 20,
    marginHorizontal: 6,
    alignItems: "center",
    position: "relative",
  },
  albumImage: { width: CARD_SIZE, height: CARD_SIZE, borderRadius: 8, marginBottom: 6 },
  albumTitle: { fontSize: 14, color: "#fff", fontFamily: "Alice-Regular" },
  albumCount: { fontSize: 12, color: "#fff", fontFamily: "Alice-Regular", opacity: 0.7 },
  radioCircle: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#fff",
    backgroundColor: "transparent",
  },
  radioCircleActive: { backgroundColor: "#FEEDB6" },
  footerBar: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: { color: "#fff", fontFamily: "Alice-Regular", fontSize: 16 },
  /* select-all */
  allSelectWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 16,
    marginHorizontal: 20,
  },
  selectAllBtn: { flexDirection: "row", alignItems: "center" },
  selectAllCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#fff",
    backgroundColor: "transparent",
  },
  selectAllCircleActive: { backgroundColor: "#FEEDB6" },
  selectAllText: { fontFamily: "Alice-Regular", color: "#fff", fontSize: 14, marginLeft: 10 },
  /* modal */
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 100,
  },
  modalBox: { backgroundColor: "#fff", borderRadius: 16, padding: 20, width: 280, alignItems: "center" },
  modalText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#11152A",
    textAlign: "center",
    marginBottom: 20,
  },
  modalActions: { flexDirection: "row", borderTopWidth: 1, borderColor: "#ccc", width: "100%" },
  modalBtn: { flex: 1, alignItems: "center", paddingVertical: 12 },
  modalBtnText: { fontFamily: "Alice-Regular", fontSize: 16 },
  /* toast */
  toastOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 120,
  },
  toastBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  toastTxt: { fontFamily: "Alice-Regular", fontSize: 16, color: "#11152A" },
});