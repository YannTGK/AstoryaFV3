// app/(app)/my-stars/private-star/audios/three-dots/see-members/SeeMembersAudio.tsx
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

export default function SeeMembersAudio() {
  const router = useRouter();
  const { starId, id: audioId } = useLocalSearchParams<{ starId: string; id: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!starId || !audioId) return;
    (async () => {
      try {
        // 1️⃣ audio-detail → rechten-arrays
        const { data } = await api.get(`/stars/${starId}/audios/detail/${audioId}`);
        const canView: string[] = data.canView ?? [];
        const canEdit: string[] = data.canEdit ?? [];
        const allIds = Array.from(new Set([...canView, ...canEdit]));

        // 2️⃣ haal usernames per user
        const users = await Promise.all(
          allIds.map(uid =>
            api
              .get(`/users/${uid}`)
              .then(r => ({ _id: uid, username: r.data.username }))
              .catch(() => ({ _id: uid, username: "@unknown" }))
          )
        );

        // 3️⃣ merge met edit-recht
        const list = users.map(u => ({
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
  }, [starId, audioId]);

  if (loading) {
    return (
      <View style={st.center}>
        <ActivityIndicator size="large" color="#FEEDB6" />
      </View>
    );
  }

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
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      {/* ＋ invite */}
      <TouchableOpacity
        style={st.plusBtn}
        onPress={() =>
          router.push({
            pathname:
              "/(app)/dedicates/created-dedicates/audios/three-dots/add-people/AddPeoplePage",
            params: { starId, id: audioId },
          })
        }
      >
        <PlusIcon width={36} height={36} />
      </TouchableOpacity>

      <Text style={st.title}>Members</Text>

      <ScrollView style={st.listWrapper} contentContainerStyle={{ paddingBottom: 100 }}>
        {members.map(m => (
          <View key={m._id} style={st.memberItem}>
            <View style={st.avatar} />
            <Text style={st.memberName}>@{m.username}</Text>
            {m.canEdit && <Text style={st.badge}>edit</Text>}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  plusBtn: { position: "absolute", top: 95, right: 16, zIndex: 20 },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  listWrapper: { marginTop: 88, paddingHorizontal: 16 },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: "#999",
  },
  memberName: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#11152A",
    flex: 1,
  },
  badge: {
    fontFamily: "Alice-Regular",
    fontSize: 12,
    color: "#FEEDB6",
    borderWidth: 1,
    borderColor: "#FEEDB6",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});