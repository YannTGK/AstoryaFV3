import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import StarView from "@/components/stars/StarView";
import api from "@/services/api";

import PhotosIcon     from "@/assets/images/svg-icons/photos.svg";
import VideosIcon     from "@/assets/images/svg-icons/videos.svg";
import AudiosIcon     from "@/assets/images/svg-icons/audios.svg";
import DocumentsIcon  from "@/assets/images/svg-icons/documents.svg";
import BookOfLifeIcon from "@/assets/images/svg-icons/book-of-life.svg";

export default function DedicatedStarPrivate() {
  const router = useRouter();
  const { starId } = useLocalSearchParams<{ starId: string }>();

  const [star, setStar] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(true);

  /* ───────── Fetch detail ───────── */
  useEffect(() => {
    console.log("[Detail] starId param =", starId);               // 1️⃣  komt goede id mee?
    const fetchStar = async () => {
      try {
        const res = await api.get(`/stars/${starId}`);
        console.log("[Detail] response data =", res.data);         // 2️⃣  hele payload
        const { star: s } = res.data;
        setStar(s);
        setIsPrivate(s.isPrivate);
      } catch (err) {
        console.error("[Detail] fetch error:", err);               // 2️⃣b fout in netwerk?
      } finally {
        setLoading(false);
      }
    };
    fetchStar();
  }, [starId]);

  const handleToggleToPublic = () => {
    setIsPrivate(false);
    router.push({
      pathname: "/dedicates/final-dedicate-star-public",
      params: { starId },
    });
  };

  /* Skeleton / loader */
  if (loading || !star) {
    console.log("[Detail] loading =", loading, "| star =", star);  // 3️⃣ blijft hij null?
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const icons = [
    { label: "Photo's",      icon: <PhotosIcon     width={60} height={60} /> },
    { label: "Video’s",      icon: <VideosIcon     width={60} height={60} /> },
    { label: "Audio’s",      icon: <AudiosIcon     width={60} height={60} /> },
    { label: "Documents",    icon: <DocumentsIcon  width={60} height={60} /> },
    { label: "Book of Life", icon: <BookOfLifeIcon width={60} height={60} /> },
  ];

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Dedicated star</Text>

      {/* private / public toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleButton,
            { backgroundColor: isPrivate ? "#FEEDB6" : "#11152A", borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
          ]}
        >
          <Text style={[styles.toggleText, { color: isPrivate ? "#11152A" : "#fff" }]}>Private</Text>
        </Pressable>
        <Pressable
          onPress={handleToggleToPublic}
          style={[
            styles.toggleButton,
            { backgroundColor: !isPrivate ? "#FEEDB6" : "#11152A", borderTopRightRadius: 12, borderBottomRightRadius: 12 },
          ]}
        >
          <Text style={[styles.toggleText, { color: !isPrivate ? "#11152A" : "#fff" }]}>Public</Text>
        </Pressable>
      </View>

      {/* ster + publicName */}
      <View style={styles.canvasWrapper}>
        <StarView emissive={parseInt(star.color.replace("#", ""), 16)} rotate={false} />
        <View style={styles.nameOverlay}>
          <Text style={styles.nameText}>{star.publicName}</Text>
        </View>
      </View>

      {/* media icons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {icons.map((it, idx) => (
          <View key={idx} style={styles.iconItem}>
            {it.icon}
            <Text style={styles.iconLabel}>{it.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ───────── Styles ───────── */
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  backBtn:  { position: "absolute", top: 50, left: 20, zIndex: 10 },

  title: { fontFamily: "Alice-Regular", fontSize: 20, color: "#fff", textAlign: "center", marginTop: 50 },

  toggleContainer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  toggleButton: { paddingVertical: 10, paddingHorizontal: 26 },
  toggleText:   { fontFamily: "Alice-Regular", fontSize: 16 },

  canvasWrapper: { alignSelf: "center", marginTop: 30, height: 300, width: 300, borderRadius: 20, overflow: "hidden" },
  nameOverlay:   { position: "absolute", bottom: "4%", alignSelf: "center", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  nameText:      { fontSize: 16, fontFamily: "Alice-Regular", color: "#fff", textAlign: "center" },

  scrollRow: { marginTop: 40 },
  iconItem:  { alignItems: "center", marginRight: 20 },
  iconLabel: { color: "#fff", fontFamily: "Alice-Regular", fontSize: 12, textAlign: "center", marginTop: 4 },
});