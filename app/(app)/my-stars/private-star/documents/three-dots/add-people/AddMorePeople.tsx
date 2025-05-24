//  (app)/my-stars/private-star/photos/three-dots/add-people/AddMorePeople.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";

import SearchIcon   from "@/assets/images/svg-icons/search.svg";
import CloseRedIcon from "@/assets/images/svg-icons/close-red.svg";

import api          from "@/services/api";
import useAuthStore from "@/lib/store/useAuthStore";

/*── debounce ───────────────────────────────────────────────*/
const useDebounce = (value: string, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced.trim();
};

export default function AddMorePeople() {
  const router      = useRouter();
  const { albumId } = useLocalSearchParams<{ albumId: string }>();
  const { user }    = useAuthStore();
  const myId        = user?._id ?? user?.id;
  const myUsername  = user?.username;

  /* ---------- state ---------- */
  const [search, setSearch]     = useState("");
  const debounced               = useDebounce(search);
  const [results, setResults]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [selected, setSelected] = useState<any[]>([]);
  const [busyAdd, setBusyAdd]   = useState(false);
  const [confirm, setConfirm]   = useState(false);

  /* ---------- eigen contacten ---------- */
  const [contacts, setContacts] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const { contacts } = (await api.get("/users/me/contacts")).data;
        setContacts(contacts.map((c: any) => String(c._id ?? c.id)));
      } catch (e) {
        console.error("contacts fetch:", e);
      }
    })();
  }, []);

  /* ---------- live search ---------- */
  useEffect(() => {
    if (!debounced) { setResults([]); return; }
    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/users/search", { params: { username: debounced } });
        if (cancel) return;

        let list = data.users ?? [];
        list = list
          .filter((u: any) => String(u._id ?? u.id) !== myId)
          .filter((u: any) => u.username !== myUsername)
          .filter((u: any) => !contacts.includes(String(u._id ?? u.id)));

        setResults(list);
      } finally {
        !cancel && setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [debounced, myId, myUsername, contacts]);

  /* ---------- selectie ---------- */
  const toggle = (u: any) =>
    setSelected(prev =>
      prev.some(s => (s._id ?? s.id) === (u._id ?? u.id))
        ? prev.filter(s => (s._id ?? s.id) !== (u._id ?? u.id))
        : [...prev, u]
    );
  const unselect = (id: string) =>
    setSelected(prev => prev.filter(s => (s._id ?? s.id) !== id));

  /* ---------- add contacts ---------- */
  const addContacts = async () => {
    if (busyAdd || !selected.length) return;
    setBusyAdd(true);
    try {
      await Promise.all(
        selected.map((u) =>
          api.post(`/users/${u._id ?? u.id}/contacts`).catch((e) => e)
        )
      );
      setConfirm(true);
      setTimeout(() => {
        setConfirm(false);
        router.push({
          pathname:
            "/(app)/my-stars/private-star/audios/three-dots/add-people/AddPeoplePage",
          params: { albumId },        // ← meegeven
        });
      }, 1600);
    } finally {
      setBusyAdd(false);
    }
  };

  /* ---------- invite knop ---------- */
  const invite = () =>
    router.push("/(app)/my-stars/private-star/audios/three-dots/add-people/send-invitation-audio");

  /* ==================== UI ==================== */
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000000", "#273166", "#000000"]}
                      style={StyleSheet.absoluteFill} />

      {/* ← back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6"
             stroke="#FEEDB6" strokeWidth={2}/></Svg>
      </TouchableOpacity>

      {/* 📨 invite */}
      <TouchableOpacity style={styles.invitationBtn} onPress={invite}>
        <Text style={styles.invitationText}>Send invitation</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add members</Text>
      <Text style={styles.subtitle}>
        To add new people who aren’t in your contacts, enter their username to
        add them to your contact list.
      </Text>

      {/* 🔍 search */}
      <View style={styles.searchWrapper}>
        <SearchIcon width={18} height={18} style={styles.searchIcon} />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      {/* badges */}
      {selected.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
                    style={styles.selectedScroll}
                    contentContainerStyle={{ paddingLeft: 24 }}>
          {selected.map(u => (
            <View key={u._id ?? u.id} style={styles.selectedUser}>
              <View style={styles.avatarSmall} />
              <Text style={styles.selectedUsername}>@{u.username}</Text>
              <TouchableOpacity onPress={() => unselect(u._id ?? u.id)}>
                <CloseRedIcon width={18} height={18} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* resultaten */}
      <ScrollView style={styles.resultsScroll}>
        {loading
          ? <ActivityIndicator size="small" color="#fff" style={{ marginTop: 12 }} />
          : results.map(u => (
              <TouchableOpacity key={u._id ?? u.id}
                                style={[
                                  styles.resultItem,
                                  selected.some(s => (s._id ?? s.id) === (u._id ?? u.id)) &&
                                  styles.resultItemSelected,
                                ]}
                                onPress={() => toggle(u)}>
                <View style={styles.avatarSmall} />
                <Text style={styles.resultText}>@{u.username}</Text>
              </TouchableOpacity>
            ))}
        <View style={{ height: 150 }} />
      </ScrollView>

      {/* add button */}
      <View style={styles.fixedButtonWrapper}>
        <TouchableOpacity
          style={[
            styles.button,
            (selected.length === 0 || busyAdd) && styles.buttonDisabled,
          ]}
          disabled={selected.length === 0 || busyAdd}
          onPress={addContacts}>
          <Text
            style={[
              styles.buttonText,
              (selected.length === 0 || busyAdd) && styles.buttonTextDisabled,
            ]}>
            {busyAdd ? "Adding…" : "add"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* toast */}
      {confirm && (
        <Modal transparent animationType="fade">
          <View style={styles.confirmationOverlay}>
            <View style={styles.confirmationBox}>
              <Text style={styles.confirmationText}>
                User(s) added to your contacts.
              </Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

/* ───────── styles: allemaal onveranderd ───────── */
const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },

  invitationBtn:{ position:"absolute", top:105, right:20, backgroundColor:"#FEEDB6",
                  paddingHorizontal:14, paddingVertical:10, borderRadius:8 },
  invitationText:{ color:"#11152A", fontFamily:"Alice-Regular", fontSize:14 },

  title: { fontFamily: "Alice-Regular", fontSize: 20, color: "#fff",
           textAlign: "center", marginTop: 50 },
  subtitle: { marginTop: 85, marginHorizontal: 16, fontFamily: "Alice-Regular",
              fontSize: 16, color: "#fff", textAlign: "left", lineHeight: 24 },

  searchWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff",
                   borderRadius: 30, paddingHorizontal: 16, marginTop: 20,
                   marginHorizontal: 16, height: 44 },
  searchIcon:{ marginRight: 10 },
  searchInput:{ flex:1, fontFamily:"Alice-Regular", fontSize:16,
                color:"#11152A", marginTop:2 },

  selectedScroll:{ marginTop:20, maxHeight:64 },
  selectedUser:{ flexDirection:"row", alignItems:"center",
                 backgroundColor:"#ffffff22", borderRadius:8,
                 paddingVertical:12, paddingHorizontal:12, marginRight:10 },
  avatarSmall:{ width:36, height:36, borderRadius:18,
                backgroundColor:"#ffffff", marginRight:8 },
  selectedUsername:{ color:"#fff", fontFamily:"Alice-Regular",
                     fontSize:16, marginRight:12 },

  resultsScroll:{ marginTop:20, marginHorizontal:24 },
  resultItem:{ flexDirection:"row", alignItems:"center",
               backgroundColor:"#ffffff22", borderRadius:8,
               paddingVertical:14, paddingHorizontal:20, marginBottom:12 },
  resultItemSelected:{ borderColor:"#FEEDB6", borderWidth:1.5 },
  resultText:{ fontFamily:"Alice-Regular", fontSize:16, color:"#fff" },

  fixedButtonWrapper:{ position:"absolute", bottom:100, left:20, right:20 },
  button:{ backgroundColor:"#FEEDB6", paddingVertical:14, borderRadius:12,
           shadowColor:"#FEEDB6", shadowOffset:{ width:0, height:4 },
           shadowOpacity:0.8, shadowRadius:12, elevation:6 },
  buttonDisabled:{ opacity:0.6 },
  buttonText:{ color:"#11152A", fontFamily:"Alice-Regular",
               fontSize:18, textAlign:"center" },
  buttonTextDisabled:{},

  confirmationOverlay:{ flex:1, justifyContent:"center", alignItems:"center",
                        backgroundColor:"rgba(0,0,0,0.2)" },
  confirmationBox:{ backgroundColor:"#fff", borderRadius:16, paddingVertical:20,
                    paddingHorizontal:24, shadowColor:"#000", shadowOpacity:0.2,
                    shadowOffset:{ width:0, height:4 }, shadowRadius:10,
                    elevation:10 },
  confirmationText:{ fontFamily:"Alice-Regular", fontSize:14, color:"#11152A",
                     textAlign:"center", lineHeight:22 },
});