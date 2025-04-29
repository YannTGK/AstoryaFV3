import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Pressable,
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
import MoreIcon       from "@/assets/images/svg-icons/more.svg";
import AddPeopleIcon  from "@/assets/images/svg-icons/add-people.svg";
import SeeMembersIcon from "@/assets/images/svg-icons/see-members.svg";

export default function DedicatedStar() {
  const router = useRouter();
  const { starId } = useLocalSearchParams<{ starId: string }>();

  const [star, setStar]     = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(true);
  const [menuOpen, setMenuOpen]   = useState(false);   // ← nieuw

  /* ophalen */
  useEffect(() => {
    const fetchStar = async () => {
      try {
        const { star: s } = (await api.get(`/stars/${starId}`)).data;
        setStar(s);
        setIsPrivate(s.isPrivate);
      } catch (e) { console.error(e); }
      finally     { setLoading(false); }
    };
    fetchStar();
  }, [starId]);

  /* toggle privacy */
  const togglePrivacy = async () => {
    try {
      setIsPrivate((p) => !p);
      await api.put(`/stars/${starId}`, { isPrivate: !isPrivate });
    } catch (e) {
      console.error("cannot toggle", e);
      setIsPrivate((p) => !p);
    }
  };

  /* back */
  const goBackToList = () => router.replace("/(app)/dedicates/dedicate");

  /* menu actions */
  const handleAddPeople  = () => router.push("/dedicates/add-people-dedicate");
  const handleSeeMembers = () => router.push("/dedicates/no-members-dedicate");

  if (loading || !star) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const icons = [/* …zelfde array als eerder… */];

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      {/* ← */}
      <TouchableOpacity style={styles.backBtn} onPress={goBackToList}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2}/></Svg>
      </TouchableOpacity>

      {/* ⋯ */}
      <TouchableOpacity style={styles.moreBtn} onPress={() => setMenuOpen(!menuOpen)}>
        <MoreIcon width={24} height={24} />
      </TouchableOpacity>

      {menuOpen && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={handleAddPeople}>
            <AddPeopleIcon width={16} height={16} />
            <Text style={styles.menuText}>Add people</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleSeeMembers}>
            <SeeMembersIcon width={16} height={16} />
            <Text style={styles.menuText}>See members</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.title}>Dedicated star</Text>

      {/* toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          onPress={() => !isPrivate && togglePrivacy()}
          style={[
            styles.toggleButton,
            { backgroundColor: isPrivate ? "#FEEDB6" : "#11152A",
              borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
          ]}
        >
          <Text style={[styles.toggleText, { color: isPrivate ? "#11152A" : "#fff" }]}>
            Private
          </Text>
        </Pressable>
        <Pressable
          onPress={() => isPrivate && togglePrivacy()}
          style={[
            styles.toggleButton,
            { backgroundColor: !isPrivate ? "#FEEDB6" : "#11152A",
              borderTopRightRadius: 12, borderBottomRightRadius: 12 },
          ]}
        >
          <Text style={[styles.toggleText, { color: !isPrivate ? "#11152A" : "#fff" }]}>
            Public
          </Text>
        </Pressable>
      </View>

      {/* ster + naam */}
      <View style={styles.canvasWrapper}>
        <StarView emissive={parseInt(star.color.replace("#", ""), 16)} rotate={false} />
        <View style={styles.nameOverlay}>
          <Text style={styles.nameText}>{star.publicName}</Text>
        </View>
      </View>

      {/* ---------------- media icon row ---------------- */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollRow}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {[
          { label: "Photo's",      icon: <PhotosIcon     width={60} height={60} /> },
          { label: "Video’s",      icon: <VideosIcon     width={60} height={60} /> },
          { label: "Audio’s",      icon: <AudiosIcon     width={60} height={60} /> },
          { label: "Documents",    icon: <DocumentsIcon  width={60} height={60} /> },
          { label: "Book of Life", icon: <BookOfLifeIcon width={60} height={60} /> },
        ].map((item, idx) => (
          <View key={idx} style={styles.iconItem}>
            {item.icon}
            <Text style={styles.iconLabel}>{item.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  centered:{ flex:1, justifyContent:"center", alignItems:"center" },
  backBtn:  { position:"absolute", top:50, left:20,  zIndex:10 },
  moreBtn:  { position:"absolute", top:50, right:20, zIndex:10 },

  menu:{
    position:"absolute", top:90, right:20, backgroundColor:"#fff",
    borderRadius:10, padding:10, gap:8, zIndex:20,
    shadowColor:"#000", shadowOpacity:0.15, shadowRadius:4, elevation:5,
  },
  menuItem:{ flexDirection:"row", alignItems:"center", gap:6 },
  menuText:{ fontSize:13, fontFamily:"Alice-Regular", color:"#11152A" },

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