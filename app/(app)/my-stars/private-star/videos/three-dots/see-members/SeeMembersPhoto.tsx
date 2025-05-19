//  (app)/my-stars/private-star/photos/three-dots/see-members/SeeMembersPhoto.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import PlusIcon from "@/assets/images/svg-icons/plus3.svg";
import api from "@/services/api";

type Member = { _id: string; username: string; canEdit: boolean };

export default function SeeMembersPhoto() {
  const router = useRouter();
  const { albumId } =
    useLocalSearchParams<{ albumId: string }>();

  /* ---- state ------------------------------------------------- */
  const [members, setMembers]   = useState<Member[]>([]);
  const [loading, setLoading]   = useState(true);

  /* ---- fetch album-detail + user-info ------------------------ */
  useEffect(() => {
    if (!albumId) return;
    (async () => {
      try {
        // 1. album-detail → id-arrays
        const { data } = await api.get(`/photo-albums/detail/${albumId}`);
        const canView : string[] = data.canView ?? [];
        const canEdit : string[] = data.canEdit ?? [];

        const allIds  = Array.from(new Set([...canView, ...canEdit]));

        // 2. user-info (individueel om simpel te houden)
        const users = await Promise.all(
          allIds.map(id =>
            api.get(`/users/${id}`)
               .then(r => ({ _id:id, username:r.data.username }))
               .catch(() => ({ _id:id, username:"@unknown" }))
          )
        );

        // 3. merge met rechten-info
        const list: Member[] = users.map(u => ({
          ...u,
          canEdit: canEdit.includes(u._id),
        }));

        setMembers(list);
      } catch (err) {
        console.error("members fetch:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [albumId]);

  /* ---- UI ---------------------------------------------------- */
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* ← back */}
      <TouchableOpacity style={st.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6"
             stroke="#FEEDB6" strokeWidth={2} /></Svg>
      </TouchableOpacity>

      {/* ＋ add */}
      <TouchableOpacity style={st.plusBtn}
        onPress={() =>
          router.push({
            pathname:
              "/(app)/my-stars/private-star/photos/three-dots/add-people/AddMorePeople",
            params: { albumId },
          })
        }>
        <PlusIcon width={36} height={36} />
      </TouchableOpacity>

      <Text style={st.title}>Members</Text>

      {/* lijst -------------------------------------------------- */}
      {loading ? (
        <ActivityIndicator size="large" color="#FEEDB6"
                           style={{ marginTop: 120 }} />
      ) : (
        <ScrollView
          style={st.listWrapper}
          contentContainerStyle={{ paddingBottom: 100 }}>
          {members.map(m => (
            <View key={m._id} style={st.memberItem}>
              <View style={st.avatar} />
              <Text style={st.memberName}>@{m.username}</Text>

              {m.canEdit && (
                <Text style={st.badge}>edit</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

/* ---- styles: jouw oorspronkelijke design + kleine “edit” badge --- */
const st = StyleSheet.create({
  backBtn:{ position:"absolute", top:50, left:20, zIndex:10 },
  plusBtn:{ position:"absolute", top:95, right:16, zIndex:20 },

  title:{ fontFamily:"Alice-Regular", fontSize:20, color:"#fff",
          textAlign:"center", marginTop:50 },

  listWrapper:{ marginTop:88, paddingHorizontal:16 },

  memberItem:{ flexDirection:"row", alignItems:"center",
               backgroundColor:"#ffffff", borderRadius:8,
               paddingVertical:12, paddingHorizontal:16, marginBottom:16 },

  avatar:{ width:36, height:36, borderRadius:18, backgroundColor:"#ffffff",
           marginRight:12, borderWidth:0.5, borderColor:"#999" },

  memberName:{ fontFamily:"Alice-Regular", fontSize:16, color:"#11152A", flex:1 },

  badge:{ fontFamily:"Alice-Regular", fontSize:12, color:"#FEEDB6",
          borderWidth:1, borderColor:"#FEEDB6", borderRadius:6,
          paddingHorizontal:6, paddingVertical:2 },
});