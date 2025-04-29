import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Pressable,
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

export default function DedicatedStar() {
  const router = useRouter();
  const { starId } = useLocalSearchParams<{ starId: string }>();

  const [star, setStar] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(true);

  /* ophalen detail */
  useEffect(() => {
    const fetchStar = async () => {
      try {
        const { star: s } = (await api.get(`/stars/${starId}`)).data;
        setStar(s);
        setIsPrivate(s.isPrivate);          // initial privacy
      } catch (err) {
        console.error("❌ fetch star", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStar();
  }, [starId]);

  /* privacy toggle – PATCH naar backend + state switch */
  const togglePrivacy = async () => {
    try {
      setIsPrivate((p) => !p);
      await api.put(`/stars/${starId}`, { isPrivate: !isPrivate });
    } catch (e) {
      console.error("❌ cannot toggle privacy", e);
      setIsPrivate((p) => !p);   // rollback bij fout
    }
  };

  /* back → altijd naar lijstscherm */
  const goBackToList = () => router.replace("/(app)/dedicates/dedicate");

  if (loading || !star) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  /* media iconen */
  const icons = [
    { label: "Photo's",      icon: <PhotosIcon     width={60} height={60} /> },
    { label: "Video’s",      icon: <VideosIcon     width={60} height={60} /> },
    { label: "Audio’s",      icon: <AudiosIcon     width={60} height={60} /> },
    { label: "Documents",    icon: <DocumentsIcon  width={60} height={60} /> },
    { label: "Book of Life", icon: <BookOfLifeIcon width={60} height={60} /> },
  ];

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      {/* ← terug naar lijst */}
      <TouchableOpacity style={styles.backBtn} onPress={goBackToList}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} /></Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Dedicated star</Text>

      {/* privacy toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          onPress={() => !isPrivate && togglePrivacy()}
          style={[
            styles.toggleButton,
            { backgroundColor: isPrivate ? "#FEEDB6" : "#11152A",
              borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
          ]}
        >
          <Text style={[
            styles.toggleText,
            { color: isPrivate ? "#11152A" : "#fff" },
          ]}>Private</Text>
        </Pressable>

        <Pressable
          onPress={() => isPrivate && togglePrivacy()}
          style={[
            styles.toggleButton,
            { backgroundColor: !isPrivate ? "#FEEDB6" : "#11152A",
              borderTopRightRadius: 12, borderBottomRightRadius: 12 },
          ]}
        >
          <Text style={[
            styles.toggleText,
            { color: !isPrivate ? "#11152A" : "#fff" },
          ]}>Public</Text>
        </Pressable>
      </View>

      {/* ster + naam */}
      <View style={styles.canvasWrapper}>
        <StarView emissive={parseInt(star.color.replace("#", ""), 16)} rotate={false} />
        <View style={styles.nameOverlay}>
          <Text style={styles.nameText}>{star.publicName}</Text>
        </View>
      </View>

      {/* media iconen */}
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

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  centered:{ flex:1, justifyContent:"center", alignItems:"center" },
  backBtn: { position:"absolute", top:50, left:20, zIndex:10 },

  title:{ fontFamily:"Alice-Regular", fontSize:20, color:"#fff", textAlign:"center", marginTop:50 },

  toggleContainer:{ flexDirection:"row", justifyContent:"center", marginTop:20 },
  toggleButton:{ paddingVertical:10, paddingHorizontal:26 },
  toggleText:{ fontFamily:"Alice-Regular", fontSize:16 },

  canvasWrapper:{ alignSelf:"center", marginTop:30, height:300, width:300, borderRadius:20, overflow:"hidden" },
  nameOverlay:{ position:"absolute", bottom:"4%", alignSelf:"center", paddingHorizontal:16, paddingVertical:6 },
  nameText:{ fontSize:16, fontFamily:"Alice-Regular", color:"#fff", textAlign:"center" },

  scrollRow:{ marginTop:40 },
  iconItem:{ alignItems:"center", marginRight:20 },
  iconLabel:{ color:"#fff", fontFamily:"Alice-Regular", fontSize:12, textAlign:"center", marginTop:4 },
});