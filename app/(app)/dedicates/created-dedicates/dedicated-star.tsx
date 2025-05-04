// app/(app)/dedicates/created-dedicates/dedicated-star.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import StarView from "@/components/stars/StarView";
import api from "@/services/api";
import useAuthStore from "@/lib/store/useAuthStore";  // jouw auth-store

import PhotosIcon     from "@/assets/images/svg-icons/photos.svg";
import VideosIcon     from "@/assets/images/svg-icons/videos.svg";
import AudiosIcon     from "@/assets/images/svg-icons/audios.svg";
import DocumentsIcon  from "@/assets/images/svg-icons/documents.svg";
import BookOfLifeIcon from "@/assets/images/svg-icons/book-of-life.svg";
import MoreIcon       from "@/assets/images/svg-icons/more.svg";
import AddPeopleIcon  from "@/assets/images/svg-icons/add-people.svg";
import SeeMembersIcon from "@/assets/images/svg-icons/see-members.svg";
import TrashIcon      from "@/assets/images/svg-icons/trash.svg"; // Let op: eigen icoonbestand

export default function DedicatedStar() {
  const router = useRouter();
  const { starId } = useLocalSearchParams<{ starId: string }>();
  const { user } = useAuthStore();
  const myId = user?.id ?? user?._id;

  const [star, setStar]         = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  // laadt de ster
  useEffect(() => {
    api.get(`/stars/${starId}`)
      .then(res => setStar(res.data.star))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [starId]);

  const goBack = () => router.replace("/(app)/dedicates/dedicate");

  const confirmDeleteOrLeave = () => {
    if (!star) return;
    const isOwner = star.userId === myId;
    Alert.alert(
      isOwner ? "Delete star?" : "Leave star?",
      isOwner
        ? "This will permanently delete the star and all its data. Continue?"
        : "This will remove your access to the star. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isOwner ? "Delete" : "Leave",
          style: "destructive",
          onPress: () => handleDeleteOrLeave(isOwner),
        },
      ]
    );
  };

  const handleDeleteOrLeave = async (isOwner: boolean) => {
    try {
      if (isOwner) {
        await api.delete(`/stars/${starId}`);
      } else {
        // haal zowel view als edit rechten weg
        await api.patch(`/stars/${starId}/rights`, {
          userId: myId,
          mode: "view",
          action: "remove",
        });
        await api.patch(`/stars/${starId}/rights`, {
          userId: myId,
          mode: "edit",
          action: "remove",
        });
      }
      goBack();
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message ?? "Server error");
    }
  };

  if (loading || !star) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000", "#273166", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* ← Back */}
      <TouchableOpacity style={styles.backBtn} onPress={goBack}>
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2}/>
        </Svg>
      </TouchableOpacity>

      {/* ⋯ Menu */}
      <TouchableOpacity
        style={styles.moreBtn}
        onPress={() => setMenuOpen(o => !o)}
      >
        <MoreIcon width={24} height={24} />
      </TouchableOpacity>

      {menuOpen && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push({
              pathname: "/dedicates/created-dedicates/add-people/add-people-dedicate",
              params: { starId },
            })}
          >
            <AddPeopleIcon width={16} height={16}/>
            <Text style={styles.menuText}>Add people</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push({
              pathname: "/dedicates/created-dedicates/see-members/see-members-dedicate",
              params: { starId },
            })}
          >
            <SeeMembersIcon width={16} height={16}/>
            <Text style={styles.menuText}>See members</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={confirmDeleteOrLeave}
          >
            <TrashIcon width={16} height={16}/>
            <Text style={[styles.menuText, { color: "#E02424" }]}>
              {star.userId === myId ? "Delete star" : "Leave star"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Titel + star */}
      <Text style={styles.title}>Dedicated star</Text>
      <View style={styles.canvasWrapper}>
        <StarView
          emissive={parseInt(star.color.replace("#",""), 16)}
          rotate={false}
        />
        <View style={styles.nameOverlay}>
          <Text style={styles.nameText}>{star.publicName}</Text>
        </View>
      </View>

      {/* Media icoontjes */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollRow}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {[
          { label: "Photo's",      icon: <PhotosIcon width={60} height={60}/> },
          { label: "Video’s",      icon: <VideosIcon width={60} height={60}/> },
          { label: "Audio’s",      icon: <AudiosIcon width={60} height={60}/> },
          { label: "Documents",    icon: <DocumentsIcon width={60} height={60}/> },
          { label: "Book of Life", icon: <BookOfLifeIcon width={60} height={60}/> },
        ].map((it, i) => (
          <View key={i} style={styles.iconItem}>
            {it.icon}
            <Text style={styles.iconLabel}>{it.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex:1, justifyContent:"center", alignItems:"center"
  },
  backBtn: {
    position:"absolute", top:50, left:20, zIndex:10
  },
  moreBtn: {
    position:"absolute", top:50, right:20, zIndex:10
  },
  menu: {
    position:"absolute", top:90, right:20,
    backgroundColor:"#fff", borderRadius:10, padding:10, gap:8, zIndex:20,
    shadowColor:"#000", shadowOpacity:0.15, shadowRadius:4, elevation:5,
  },
  menuItem: {
    flexDirection:"row", alignItems:"center", gap:6
  },
  menuText: {
    fontSize:13, fontFamily:"Alice-Regular", color:"#11152A"
  },
  title: {
    fontFamily:"Alice-Regular", fontSize:20, color:"#fff",
    textAlign:"center", marginTop:50
  },
  canvasWrapper: {
    alignSelf:"center", marginTop:30,
    height:300, width:300, borderRadius:20, overflow:"hidden"
  },
  nameOverlay: {
    position:"absolute", bottom:"4%", alignSelf:"center",
    paddingHorizontal:16, paddingVertical:6
  },
  nameText: {
    fontSize:16, fontFamily:"Alice-Regular", color:"#fff", textAlign:"center"
  },
  scrollRow: {
    marginTop:40
  },
  iconItem: {
    alignItems:"center", marginRight:20
  },
  iconLabel: {
    color:"#fff", fontFamily:"Alice-Regular", fontSize:12,
    textAlign:"center", marginTop:4
  },
});