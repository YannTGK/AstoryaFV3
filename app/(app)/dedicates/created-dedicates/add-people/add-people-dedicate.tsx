import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";

import PlusIcon from "@/assets/images/svg-icons/plus3.svg";
import api from "@/services/api";

export default function AddPeopleDedicate() {
  const router = useRouter();
  const { starId } = useLocalSearchParams<{ starId: string }>();

  /* als starId ontbreekt -> direct terug */
  if (!starId) {
    router.back();
    return null;
  }

  const [selected, setSelected] = useState<string | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* contacten ophalen */
  useEffect(() => {
    (async () => {
      try {
        const { contacts } = (await api.get("/users/me/contacts")).data;
        setContacts(contacts);
      } catch (e) { console.error("contacts:", e); }
      finally     { setLoading(false); }
    })();
  }, []);

  const selectOne = (id: string) =>
    setSelected(prev => (prev === id ? null : id));

  /* naar scherm waar rechten gekozen worden */
  const next = () => {
    if (!selected) return;
    const c = contacts.find(c => c._id === selected);
    router.push({
      pathname: "/dedicates/created-dedicates/add-people/add-selected-people-dedicate",
      params:   { starId, userId: c._id, username: c.username },
    });
  };

  /* naar “add new member” */
  const addNew = () =>
    router.push({
      pathname: "/dedicates/created-dedicates/add-people/add-members-dedicate",
      params:   { starId },    // ⭐ ID meegeven
    });

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill}/>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2}/></Svg>
      </TouchableOpacity>

      <TouchableOpacity style={styles.plusBtn} onPress={addNew}>
        <PlusIcon width={36} height={36}/>
      </TouchableOpacity>

      <Text style={styles.title}>Add people to star</Text>
      <Text style={styles.subtitle}>
        Select contacts to add to the star. To add someone new, tap the&nbsp;plus icon.
      </Text>

      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop: 40 }}/>
      ) : (
        <ScrollView style={{ marginTop: 20, marginBottom: 180 }}>
          {contacts.map(c => (
            <TouchableOpacity
              key={c._id}
              style={[styles.option, selected === c._id && styles.selectedOption]}
              onPress={() => selectOne(c._id)}
            >
              <Text style={styles.optionText}>@{c.username}</Text>
              <View style={selected === c._id ? styles.radioSelected : styles.radioUnselected}/>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.fixedBtn}>
        <TouchableOpacity
          style={[styles.button, !selected && { opacity: 0.6 }]}
          disabled={!selected}
          onPress={next}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  backBtn:{ position:"absolute", top:50, left:20, zIndex:10 },
  plusBtn:{ position:"absolute", top:85, right:24, zIndex:10 },

  title:{ fontFamily:"Alice-Regular", fontSize:20, color:"#fff", textAlign:"center", marginTop:50 },
  subtitle:{ marginTop:60, fontFamily:"Alice-Regular", fontSize:14, color:"#fff", textAlign:"center", marginHorizontal:30 },

  option:{
    marginTop:12, backgroundColor:"#ffffff22", marginHorizontal:16,
    borderRadius:10, paddingVertical:14, paddingHorizontal:20,
    flexDirection:"row", justifyContent:"space-between", alignItems:"center",
  },
  selectedOption:{ borderColor:"#FEEDB6", borderWidth:1.5 },

  optionText:{ fontSize:16, fontFamily:"Alice-Regular", color:"#fff" },
  radioUnselected:{ width:18, height:18, borderRadius:9, borderWidth:2, borderColor:"#fff" },
  radioSelected:{ width:18, height:18, borderRadius:9, backgroundColor:"#FEEDB6", borderColor:"#FEEDB6", borderWidth:2 },

  fixedBtn:{ position:"absolute", bottom:100, left:20, right:20 },
  button:{
    backgroundColor:"#FEEDB6", paddingVertical:14, borderRadius:12,
    shadowColor:"#FEEDB6", shadowOffset:{ width:0, height:4 }, shadowOpacity:0.8,
    shadowRadius:12, elevation:6,
  },
  buttonText:{ color:"#11152A", fontSize:16, fontFamily:"Alice-Regular", textAlign:"center" },
});