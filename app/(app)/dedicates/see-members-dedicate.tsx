import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import PlusIcon      from "@/assets/images/svg-icons/plus3.svg";
import NoMembersIcon from "@/assets/images/svg-icons/no-members.svg";
import api           from "@/services/api";

interface Member {
  _id: string;
  username: string;
  role: "Can view" | "Can edit";
}

export default function SeeMembersDedicate() {
  const router = useRouter();
  const { starId } = useLocalSearchParams<{ starId: string }>();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 see-members, starId =", starId);
    api.get<{ members: Member[] }>(`/stars/${starId}/members`)
      .then(res => {
        setMembers(res.data.members);
      })
      .catch(err => {
        console.error("❌ load members error:", {
          message: err.message,
          status: err.response?.status,
          body: err.response?.data,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [starId]);

  const handleAdd = () => {
    router.push({
      pathname:
        "/dedicates/created-dedicates/add-people/add-members-dedicate",
      params: { starId },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* ← Back */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
      >
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Members</Text>

      {/* + knop */}
      <TouchableOpacity style={styles.plusBtn} onPress={handleAdd}>
        <PlusIcon width={36} height={36} />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#fff"
          style={{ marginTop: 80 }}
        />
      ) : members.length === 0 ? (
        <View style={styles.noMembersWrapper}>
          <NoMembersIcon width={140} height={140} />
          <Text style={styles.messageText}>No members found</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listWrapper}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {members.map((m) => (
            <TouchableOpacity
              key={m._id}
              style={styles.memberItem}
              onPress={() =>
                router.push(
                  "/dedicates/account-members-status-dedicate",
                  {
                    starId,
                    userId: m._id,
                    username: m.username,
                    role: m.role,
                  }
                )
              }
            >
              <View style={styles.avatar} />
              <Text style={styles.memberName}>
                @{m.username} ({m.role})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  plusBtn: { position: "absolute", top: 85, right: 24, zIndex: 20 },
  listWrapper: { marginTop: 60, paddingHorizontal: 16 },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff22",
    borderRadius: 10,
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
    color: "#fff",
  },
  noMembersWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 80,
  },
  messageText: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 14,
    marginTop: 10,
  },
});