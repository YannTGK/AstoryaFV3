// app/(app)/my-stars/private-star/audios/three-dots/add-people/AddPeoplePage.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import api from "@/services/api";

type Contact = { _id: string; username: string };

export default function AddPeoplePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { starId, id: audioId } = useLocalSearchParams<{ starId: string; id: string }>();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(false);
  

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

  const toggleSelect = (uid: string) => {
    setSelected(prev => (prev[0] === uid ? [] : [uid]));
  };

  const addMembers = async () => {
    if (!starId || !audioId) return;
    console.log("Navigating to AddPeoplePage with:", { starId, audioId });
    try {
      const detail = await api.get(`/stars/${starId}/audios/detail/${audioId}`);
      const current: string[] = detail.data.canView ?? [];
      const updated = Array.from(new Set([...current, ...selected]));
      await api.put(`/stars/${starId}/audios/detail/${audioId}`, { canView: updated });

      setPopup(true);
      setTimeout(() => {
        setPopup(false);
        router.back();
      }, 2000);
    } catch (err) {
      console.error("add-to-audio:", err);
      Alert.alert("Fout", "Kon mensen niet toevoegen.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FEEDB6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      {/* ← Back */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 10 }]}
        onPress={() => router.back()}
      >
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      {/* ＋ Nieuwe contact */}
      <TouchableOpacity
        style={[styles.addNewBtn, { top: insets.top + 10 }]}
        onPress={() =>
          router.push({
            pathname: "/(app)/my-stars/private-star/audios/three-dots/add-people/AddMorePeople",
            params: { starId, audioId },
          })
        }
      >
        <Text style={styles.plus}>＋</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { marginTop: insets.top + 50 }]}>
        Add people to audio
      </Text>
      <Text style={styles.subtitle}>
        Select contacts who can view this audio.
      </Text>

      <FlatList
        data={contacts}
        keyExtractor={item => item._id}
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
        <Text style={styles.submitText}>Add to audio</Text>
      </TouchableOpacity>

      {popup && (
        <View style={styles.popup}>
          <Text style={styles.popupText}>
            The user has been added to your audio.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", left: 20, zIndex: 10 },
  addNewBtn: { position: "absolute", right: 16, zIndex: 10 },
  plus: { fontSize: 32, color: "#fff" },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  userItem: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userItemSelected: {
    backgroundColor: "rgba(255,255,255,0.2)",
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
    marginTop: 16,
    marginBottom: 40,
  },
  submitText: {
    color: "#11152A",
    fontFamily: "Alice-Regular",
    fontSize: 18,
    textAlign: "center",
  },
  popup: {
    position: "absolute",
    bottom: 200,
    left: 40,
    right: 40,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    zIndex: 100,
  },
  popupText: {
    color: "#11152A",
    fontFamily: "Alice-Regular",
    fontSize: 16,
    textAlign: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});