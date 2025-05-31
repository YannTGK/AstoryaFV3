// app/(app)/my-stars/private-star/photos/three-dots/add-people/AddPeoplePage.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import api from "@/services/api";

type Contact = { _id: string; username: string };

export default function AddPeoplePage() {
  /* ── routing & params ──────────────────────────────── */
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, albumId, albumName } = useLocalSearchParams<{ id:string; albumId:string; albumName:string }>();

  /* ── state ─────────────────────────────────────────── */
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);
  const [popup,   setPopup]     = useState(false);

  /* ── fetch mijn contacten ──────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/users/me/contacts");
        setContacts(res.data.contacts);
      } catch (err) {
        console.error("contacts fetch:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── toggle selectie ───────────────────────────────── */
  const toggleSelect = (id: string) => {
    setSelected(prev => (prev[0] === id ? [] : [id]));
  };

  /* ── Add ⇒ album.canView patch ─────────────────────── */
  const addMembers = async () => {
    try {
      /* 1️⃣ eerst huidige album ophalen om overlap te vermijden */
      const detail = await api.get(`/photo-albums/detail/${albumId}`);
      const current: string[] = detail.data.canView ?? [];

      /* 2️⃣ array-union */
      const updated = Array.from(new Set([...current, ...selected]));

      /* 3️⃣ opslaan */
      await api.put(`/photo-albums/detail/${albumId}`, { canView: updated });

      /* 4️⃣ feedback + terug */
      setPopup(true);
      setTimeout(() => {
        setPopup(false);
        router.push({
           pathname: "/(app)/explores/private-files/photos/created-album",
           params:   { id, albumId, albumName },   // ← alles meegeven
         });
      }, 2500);
    } catch (err) {
      console.error("add-to-album:", err);
    }
  };

  /* ── loader ────────────────────────────────────────── */
  if (loading) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={styles.center}>
        <ActivityIndicator size="large" color="#FEEDB6" />
      </SafeAreaView>
    );
  }

  /* ── UI ────────────────────────────────────────────── */
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000", "#273166", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* ← back */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 10 }]}
        onPress={() => router.back()}
      >
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      {/* ＋ plus */}
      <TouchableOpacity
        style={[styles.addNewBtn, { top: insets.top + 0 }]}
        onPress={() =>
          router.push({
            pathname:
              "/(app)/explores/private-files/photos/three-dots/add-people/AddMorePeople",
            params: { albumId }, // geef albumId door
          })
        }
      >
        <Text style={styles.plus}>＋</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { marginTop: insets.top + 0 }]}>
        Add people to album
      </Text>

      <Text style={styles.subtitle}>
        Select contacts to add to the album. Tap the plus icon to add someone
        new.
      </Text>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }}
        renderItem={({ item }) => {
          const chosen = selected.includes(item._id);
          return (
            <TouchableOpacity
              onPress={() => toggleSelect(item._id)}
              style={[styles.userItem, chosen && styles.userItemSelected]}
            >
              <Text style={styles.userText}>@{item.username}</Text>
              <View style={styles.radioOuter}>
                {chosen && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={[styles.submitBtn, selected.length === 0 && { opacity: 0.4 }]}
        disabled={selected.length === 0}
        onPress={addMembers}
      >
        <Text style={styles.submitText}>Add to album</Text>
      </TouchableOpacity>

      {popup && (
        <View style={styles.popup}>
          <Text style={styles.popupText}>
            New people were added. Open the ⋯ menu to view members.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ── STYLES (onveranderd) ─────────────────────────────── */
const styles = StyleSheet.create({
  backBtn: { position: "absolute", left: 20, zIndex: 10 },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 18,
    marginTop: 24,
    textAlign: "left",
    paddingHorizontal: 16,
  },
  addNewBtn: {
    position: "absolute",
    right: 16,
    zIndex: 10,
  },
  plus: { fontSize: 32, color: "#fff" },

  userItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userItemSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  userText: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 18,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FEEDB6",
  },
  submitBtn: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 105,
    marginTop: 16,
  },
  submitText: {
    color: "#11152A",
    fontFamily: "Alice-Regular",
    fontSize: 18,
    textAlign: "center",
  },
  popup: {
    position: "absolute",
    bottom: 410,
    left: 40,
    right: 40,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 10,
    alignItems: "center",
    zIndex: 100,
  },
  popupText: {
    color: "#11152A",
    fontFamily: "Alice-Regular",
    fontSize: 18,
    textAlign: "center",
    lineHeight: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});