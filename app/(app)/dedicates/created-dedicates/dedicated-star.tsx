// app/(app)/dedicates/created-dedicates/DedicatedStar.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

import StarView from "@/components/stars/StarView";
import api from "@/services/api";
import useAuthStore from "@/lib/store/useAuthStore";

import PhotosIcon     from "@/assets/images/svg-icons/photos.svg";
import VideosIcon     from "@/assets/images/svg-icons/videos.svg";
import AudiosIcon     from "@/assets/images/svg-icons/audios.svg";
import DocumentsIcon  from "@/assets/images/svg-icons/documents.svg";
import MessagesIcon   from "@/assets/images/svg-icons/messages.svg";
import BookOfLifeIcon from "@/assets/images/svg-icons/book-of-life.svg";
import MoreIcon       from "@/assets/images/svg-icons/more.svg";
import AddPeopleIcon  from "@/assets/images/svg-icons/add-people.svg";
import SeeMembersIcon from "@/assets/images/svg-icons/see-members.svg";

export default function DedicatedStar() {
  const router     = useRouter();
  const { starId } = useLocalSearchParams<{ starId: string }>();
  const { user }   = useAuthStore();
  const me         = user?._id;

  const [star, setStar]       = useState<any|null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!starId) return;
    (async () => {
      try {
        const { star: s, owner } = (await api.get(`/stars/${starId}`)).data;
        setStar(s);
        setIsOwner(String(owner._id) === s.userId);
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Could not load star");
      } finally {
        setLoading(false);
      }
    })();
  }, [starId]);

  if (loading || !star) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // rights flags
  const canView = isOwner
    || star.canView?.some((id: string) => id === me)
    || star.canEdit?.some((id: string) => id === me);

  const canEdit = isOwner
    || star.canEdit?.some((id: string) => id === me);

  const goBackToList = () =>
    router.replace("/(app)/dedicates/dedicate");

  const handleDelete = () => {
    Alert.alert(
      isOwner ? "Delete star" : "Leave star",
      isOwner
        ? "Are you sure you want to permanently delete this star? This cannot be undone."
        : "Are you sure you want to leave this star?",
      [
        { text:"Cancel", style:"cancel" },
        {
          text: isOwner ? "Delete" : "Leave",
          style:"destructive",
          onPress: async () => {
            try {
              if (isOwner) {
                await api.delete(`/stars/${starId}`);
              } else {
                await api.patch(`/stars/${starId}/rights`, {
                  userId: me,
                  mode: "view",
                  action: "remove",
                });
              }
              goBackToList();
            } catch (err: any) {
              Alert.alert("Error", err.response?.data?.message ?? "Server error");
            }
          },
        },
      ]
    );
  };

  const handleAddPeople = () =>
    router.push({
      pathname: "/dedicates/created-dedicates/add-people/add-people-dedicate",
      params: { starId },
    });

  const handleSeeMembers = () =>
    router.push({
      pathname: "/dedicates/created-dedicates/see-members/see-members-dedicate",
      params: { starId },
    });

  const onPressItem = (label: string) => {
    if (!canView) {
      return Alert.alert("Access denied", "You have no access to this star.");
    }
    let pathname = "";
    switch (label) {
      case "Photo's":
        pathname = "/dedicates/created-dedicates/photos/photo-album"; break;
      case "Video’s":
        pathname = "/dedicates/created-dedicates/videos/video-album"; break;
      case "Audio’s":
        pathname = "/dedicates/created-dedicates/audios/audios"; break;
      case "Messages":
        pathname = "/dedicates/created-dedicates/messages/add-message"; break;
      case "Documents":
        pathname = "/dedicates/created-dedicates/documents/documents"; break;
      default:
        return;
    }
    router.push({
      pathname,
      params: { id: starId, canView: canView.toString(), canEdit: canEdit.toString(), isOwner: isOwner.toString() },
    });
  };

  const icons = [
    { label: "Photo's",     icon: <PhotosIcon     width={60} height={60}/> },
    { label: "Video’s",     icon: <VideosIcon     width={60} height={60}/> },
    { label: "Audio’s",     icon: <AudiosIcon     width={60} height={60}/> },
    { label: "Messages",    icon: <MessagesIcon   width={60} height={60}/> },
    { label: "Documents",   icon: <DocumentsIcon  width={60} height={60}/> },
  ];

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000","#273166","#000"]} style={StyleSheet.absoluteFill}/>

      <TouchableOpacity style={styles.backBtn} onPress={goBackToList}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2}/></Svg>
      </TouchableOpacity>

      <TouchableOpacity style={styles.moreBtn} onPress={() => setMenuOpen(!menuOpen)}>
        <MoreIcon width={24} height={24}/>
      </TouchableOpacity>

      {menuOpen && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={handleAddPeople}>
            <AddPeopleIcon width={16} height={16}/>
            <Text style={styles.menuText}>Add people</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleSeeMembers}>
            <SeeMembersIcon width={16} height={16}/>
            <Text style={styles.menuText}>See members</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
            <Ionicons name={isOwner ? "trash-sharp" : "exit-outline"} size={16} color="#B00020" />
            <Text style={[styles.menuText,{color:"#B00020"}]}>
              {isOwner ? "Delete star" : "Leave star"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.title}>Dedicated star</Text>

      <View style={styles.canvasWrapper}>
        <StarView emissive={parseInt(star.color.replace("#",""),16)} rotate={false}/>
        <View style={styles.nameOverlay}>
          <Text style={styles.nameText}>{star.publicName}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollRow}
        contentContainerStyle={{ paddingHorizontal:20 }}
      >
        {icons.map(({label, icon}) => (
          <TouchableOpacity
            key={label}
            style={styles.iconItem}
            onPress={() => onPressItem(label)}
          >
            {icon}
            <Text style={styles.iconLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered:{ flex:1, justifyContent:"center", alignItems:"center" },
  backBtn:  { position:"absolute", top:50, left:20,  zIndex:10 },
  moreBtn:  { position:"absolute", top:50, right:20, zIndex:10 },

  menu:{
    position:"absolute", top:90, right:20, backgroundColor:"#fff",
    borderRadius:10, padding:10, gap:10, zIndex:20,
    shadowColor:"#000", shadowOpacity:0.15, shadowRadius:4, elevation:5,
  },
  menuItem:{ flexDirection:"row", alignItems:"center", gap:6 },
  menuText:{ fontSize:13, fontFamily:"Alice-Regular", color:"#11152A" },

  title:{ fontFamily:"Alice-Regular", fontSize:20, color:"#fff", textAlign:"center", marginTop:50 },

  canvasWrapper:{ alignSelf:"center", marginTop:30, height:300, width:300, borderRadius:20, overflow:"hidden" },
  nameOverlay:{ position:"absolute", bottom:"4%", alignSelf:"center", paddingHorizontal:16, paddingVertical:6 },
  nameText:{ fontSize:16, fontFamily:"Alice-Regular", color:"#fff", textAlign:"center" },

  scrollRow:{ marginTop:40 },
  iconItem:{ alignItems:"center", marginRight:20 },
  iconLabel:{ color:"#fff", fontFamily:"Alice-Regular", fontSize:12, textAlign:"center", marginTop:4 },
});