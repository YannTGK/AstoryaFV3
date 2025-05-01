// AddMembersDedicate.tsx  – UI ongewijzigd, alleen logica nieuw
import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView,
  Modal, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

import SearchIcon    from "@/assets/images/svg-icons/search.svg";
import CloseRedIcon  from "@/assets/images/svg-icons/close-red.svg";
import api           from "@/services/api";

/*──────── kleine debounce helper (300 ms) ────────*/
const useDebounce = (value: string, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

export default function AddMembersDedicate() {
  const router = useRouter();

  const [search, setSearch]         = useState("");
  const debounced                   = useDebounce(search);
  const [results, setResults]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);

  const [selected, setSelected]     = useState<any[]>([]);
  const [showPopup, setShowPopup]   = useState(false);

  /*───── live search naar backend ─────*/
  useEffect(() => {
    const q = debounced.trim();
    if (!q) { setResults([]); return; }

    let cancel = false;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/users/search", { params:{ username:q }});
        if (!cancel) setResults(data.users ?? []);
      } catch (e) {
        console.error("search error:", e);
        !cancel && setResults([]);
      } finally {
        !cancel && setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [debounced]);

  /*───── helpers ─────*/
  const toggle = (u: any) =>
    setSelected((prev) =>
      prev.some((s) => s._id === u._id)
        ? prev.filter((s) => s._id !== u._id)
        : [...prev, u]
    );
  const unselect = (id: string) =>
    setSelected((prev) => prev.filter((s) => s._id !== id));

  const confirmAdd = () => setShowPopup(true);
  const yes        = () => { setShowPopup(false); router.push("/dedicates/add-members-dedicate-status"); };
  const no         = () => setShowPopup(false);
  const invite     = () => router.push("/dedicates/created-dedicates/add-people/send-invite/send-invitation-dedicate");

  /*───── originele UI EXACT behouden ─────*/
  return (
    <View style={{ flex:1 }}>
      <LinearGradient colors={["#000000","#273166","#000000"]} style={StyleSheet.absoluteFill} start={{x:0.5,y:0}} end={{x:0.5,y:1}}/>

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></Svg>
      </TouchableOpacity>

      {/* Send invitation button */}
      <TouchableOpacity style={styles.invitationBtn} onPress={invite}>
        <Text style={styles.invitationText}>Send invitation</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add members</Text>
      <Text style={styles.subtitle}>
        To add new people who aren’t in your contacts, enter their username to add them to your contact list or send them an invitation.
      </Text>

      {/* Search field */}
      <View style={styles.searchWrapper}>
        <SearchIcon width={18} height={18} style={styles.searchIcon}/>
        <TextInput
          placeholder="Search"
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          autoCapitalize="none"
        />
      </View>

      {/* Body */}
      <View style={{ flex:1 }}>
        {/* Selected members */}
        {selected.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectedScroll} contentContainerStyle={{ paddingLeft:24 }}>
            {selected.map((u) => (
              <View key={u._id} style={styles.selectedUser}>
                <View style={styles.avatarSmall}/>
                <Text style={styles.selectedUsername}>@{u.username}</Text>
                <TouchableOpacity style={styles.removeBtn} onPress={() => unselect(u._id)}>
                  <CloseRedIcon width={18} height={18}/>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Results */}
        <ScrollView style={styles.resultsScroll}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" style={{ marginTop:12 }}/>
          ) : (
            results.map((u) => (
              <TouchableOpacity
                key={u._id}
                style={[
                  styles.resultItem,
                  selected.some((s) => s._id === u._id) && styles.resultItemSelected,
                ]}
                onPress={() => toggle(u)}
              >
                <View style={styles.avatarSmall}/>
                <Text style={styles.resultText}>@{u.username}</Text>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height:150 }}/>
        </ScrollView>
      </View>

      {/* Add button */}
      <View style={styles.fixedButtonWrapper}>
        <TouchableOpacity
          style={[styles.button, selected.length === 0 && styles.buttonDisabled]}
          disabled={selected.length === 0}
          onPress={confirmAdd}
        >
          <Text style={[styles.buttonText, selected.length === 0 && styles.buttonTextDisabled]}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Popup */}
      <Modal transparent visible={showPopup} animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupBox}>
            <Text style={styles.popupText}>
              Are you sure you want to add a{"\n"}new person to the star?
            </Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity style={[styles.popupButton, styles.rightBorder]} onPress={yes}>
                <Text style={styles.popupButtonTextYes}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popupButton} onPress={no}>
                <Text style={styles.popupButtonTextNo}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---------- ALLE styles ongewijzigd ---------- */
const styles = StyleSheet.create({
  /* dezelfde stijl-objecten als jouw originele bestand */
  backBtn:{position:"absolute",top:50,left:20,zIndex:10},
  invitationBtn:{position:"absolute",top:95,right:20,backgroundColor:"#FEEDB6",paddingHorizontal:14,paddingVertical:10,borderRadius:8},
  invitationText:{color:"#11152A",fontFamily:"Alice-Regular",fontSize:13},
  title:{fontFamily:"Alice-Regular",fontSize:20,color:"#fff",textAlign:"center",marginTop:50},
  subtitle:{marginTop:75,marginHorizontal:24,fontFamily:"Alice-Regular",fontSize:14,color:"#fff",textAlign:"center"},
  searchWrapper:{flexDirection:"row",alignItems:"center",backgroundColor:"#fff",borderRadius:30,paddingHorizontal:14,marginTop:20,marginHorizontal:24,height:44},
  searchIcon:{marginRight:10},
  searchInput:{flex:1,fontFamily:"Alice-Regular",fontSize:14,color:"#11152A",marginTop:2},
  selectedScroll: {
    marginTop: 20,
    maxHeight: 64,             // ← nieuw: één regel hoog
  },
  selectedUser:{flexDirection:"row",alignItems:"center",backgroundColor:"#ffffff22",borderRadius:10,paddingVertical:14,paddingHorizontal:12,marginRight:10},
  avatarSmall:{width:36,height:36,borderRadius:18,backgroundColor:"#ffffff",marginRight:8},
  selectedUsername:{color:"#fff",fontFamily:"Alice-Regular",fontSize:14,marginRight:12},
  removeBtn:{width:18,height:18,borderRadius:9,justifyContent:"center",alignItems:"center",marginLeft:2},
  resultsScroll:{marginTop:20,marginHorizontal:24},
  resultItem:{flexDirection:"row",alignItems:"center",backgroundColor:"#ffffff22",borderRadius:10,paddingVertical:14,paddingHorizontal:20,marginBottom:12},
  resultItemSelected:{borderColor:"#FEEDB6",borderWidth:1.5},
  resultText:{fontFamily:"Alice-Regular",fontSize:16,color:"#fff"},
  fixedButtonWrapper:{position:"absolute",bottom:100,left:20,right:20},
  button:{backgroundColor:"#FEEDB6",paddingVertical:14,borderRadius:12,shadowColor:"#FEEDB6",shadowOffset:{width:0,height:4},shadowOpacity:0.8,shadowRadius:12,elevation:6},
  buttonDisabled:{opacity:0.6},
  buttonText:{color:"#11152A",fontFamily:"Alice-Regular",fontSize:16,textAlign:"center"},
  buttonTextDisabled:{},
  popupOverlay:{flex:1,backgroundColor:"#00000088",justifyContent:"center",alignItems:"center"},
  popupBox:{width:280,backgroundColor:"#fff",borderRadius:16,paddingVertical:24,paddingHorizontal:16,alignItems:"center"},
  popupText:{fontFamily:"Alice-Regular",fontSize:16,color:"#11152A",textAlign:"center",marginBottom:24},
  popupButtons:{flexDirection:"row",borderTopWidth:1,borderTopColor:"#eee",width:"100%"},
  popupButton:{flex:1,paddingVertical:12,alignItems:"center"},
  rightBorder:{borderRightWidth:1,borderRightColor:"#eee"},
  popupButtonTextYes:{fontFamily:"Alice-Regular",fontSize:16,color:"#0A84FF"},
  popupButtonTextNo:{fontFamily:"Alice-Regular",fontSize:16,color:"#0A84FF"},
});