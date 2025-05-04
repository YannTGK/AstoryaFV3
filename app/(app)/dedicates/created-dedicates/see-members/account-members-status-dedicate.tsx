import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import StarIcon      from "@/assets/images/svg-icons/star.svg";
import api           from "@/services/api";
import useAuthStore  from "@/lib/store/useAuthStore";

interface Star {
  _id:        string;
  publicName: string;
  userId:     string;
  canView:    string[];
  canEdit:    string[];
}

export default function AccountMembersStatusDedicate() {
  const router = useRouter();
  const { userId, username, role } = useLocalSearchParams<{
    userId: string;
    username: string;
    role:    "Can view" | "Can edit";
  }>();

  const { user } = useAuthStore();
  const myId     = user?.id ?? user?._id;

  const [commonStars, setCommonStars] = useState<Star[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!userId || !myId) return;

    api
      .get<Star[]>(`/stars/dedicate`)
      .then(({ data: stars }) => {
        const shared = stars.filter((s) => {
          // does member have any rights?
          const memberHas = s.canView.includes(userId) || s.canEdit.includes(userId);
          // do I have rights or am I the owner?
          const iHave     = s.canView.includes(myId)   || s.canEdit.includes(myId) || s.userId === myId;
          return memberHas && iHave;
        });
        setCommonStars(shared);
      })
      .catch((e) => console.error("Failed loading common stars:", e))
      .finally(() => setLoading(false));
  }, [userId, myId]);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill}/>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 150 }}>
        <Text style={styles.title}>Member Details</Text>

        <View style={styles.profile}>
          <Image
            source={{ uri: `https://api.adorable.io/avatars/120/${userId}.png` }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{username}</Text>
          <Text style={styles.subtext}>@{username}</Text>
        </View>

        <Text style={styles.label}>Role in this star</Text>
        <View style={styles.roleBox}>
          <Text style={styles.roleText}>{role}</Text>
        </View>

        <Text style={styles.label}>Common stars</Text>
        {loading ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 20 }} />
        ) : commonStars.length === 0 ? (
          <Text style={styles.emptyText}>No stars in common.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.starsRow}
            contentContainerStyle={{ paddingVertical: 10 }}
          >
            {commonStars.map((s) => (
              <View key={s._id} style={styles.starItem}>
                <StarIcon width={64} height={64} />
                <Text style={styles.starLabel}>{s.publicName}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn:      { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title:        { fontSize: 20, color: "#fff", textAlign: "center", marginTop: 50 },
  profile:      { alignItems: "center", marginTop: 30 },
  avatar:       { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: "#FEEDB6", marginBottom: 16 },
  name:         { fontSize: 20, color: "#fff", marginBottom: 4 },
  subtext:      { fontSize: 14, color: "#ccc" },
  label:        { marginTop: 40, color: "#fff", fontSize: 16 },
  roleBox:      { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginTop: 10, alignItems: "center" },
  roleText:     { fontSize: 14, color: "#11152A" },
  starsRow:     { marginTop: 20 },
  starItem:     { alignItems: "center", marginRight: 20 },
  starLabel:    { color: "#fff", fontSize: 12, marginTop: 6, textAlign: "center" },
  emptyText:    { color: "#fff", marginTop: 20, textAlign: "center" },
});