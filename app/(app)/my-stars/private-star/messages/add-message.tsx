/* app/(app)/my-stars/private-star/messages/SeeMessages.tsx */
import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, Modal, ActivityIndicator, Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import * as FileSystem from "expo-file-system";
import * as Sharing    from "expo-sharing";

import NoMessageIcon from "@/assets/images/svg-icons/no-message.svg";
import PlusIcon      from "@/assets/images/svg-icons/plus.svg";
import LetterIcon    from "@/assets/images/svg-icons/letter.svg";
import CheckIcon     from "@/assets/images/svg-icons/check.svg";
import MoreIcon      from "@/assets/images/svg-icons/more.svg";
import CloseIcon     from "@/assets/images/svg-icons/close-icon.svg";
import EditIcon      from "@/assets/images/svg-icons/edit.svg";
import DeleteIcon    from "@/assets/images/svg-icons/delete.svg";
import DownloadIcon  from "@/assets/images/svg-icons/download.svg";
import api           from "@/services/api";

const { width }  = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 32;

/* ───────── Types ───────── */
type Msg = {
  _id: string;
  message: string;
  sender: string;
  canView: string[];
  forName?: string;
};

/* ───────── Component ───────── */
export default function SeeMessages() {
  const router      = useRouter();
  const { id }      = useLocalSearchParams<{ id: string }>();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading,  setLoading]  = useState(true);

  /* view-state */
  const [bulkOpen,  setBulkOpen]  = useState(false);
  const [mode,      setMode]      = useState<"none"|"delete"|"edit">("none");
  const [selected,  setSelected]  = useState<Set<string>>(new Set());
  const [active,    setActive]    = useState<Msg|null>(null);

  /* ───────── Fetch every focus ───────── */
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        if (!id) return;
        setLoading(true);
        try {
          const { data } = await api.get<Msg[]>(`/stars/${id}/messages`);

          // 2️⃣ fetch first viewer username → forName
          const msgs = await Promise.all(
            data.map(async m => {
              let forName = "@unknown";
              const viewer = m.canView?.[0];
              if (viewer) {
                try {
                  const u = await api.get(`/users/${viewer}`);
                  forName = "@" + u.data.username;
                } catch {/* ignore */}
              }
              return { ...m, forName };
            })
          );
          if (mounted) setMessages(msgs);
        } catch (err) {
          console.error("fetch messages:", err);
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => { mounted = false; };
    }, [id])
  );

  /* ───────── Navigation helpers ───────── */
  const goWrite = (messageId?: string) =>
    router.push({
      pathname: "/(app)/my-stars/private-star/messages/write-message",
      params:   messageId ? { id, messageId } : { id },
    });

  /* ───────── Mode helpers ───────── */
  const clearModes = () => { setMode("none"); setSelected(new Set()); };

  const toggleSelect = (mid: string) => {
    if (mode === "delete") {
      setSelected(prev => {
        const next = new Set(prev);
        next.has(mid) ? next.delete(mid) : next.add(mid);
        return next;
      });
    } else if (mode === "edit") {
      setSelected(new Set([mid]));
    }
  };

  /* ───────── DELETE flow ───────── */
  const confirmDelete = async () => {
    if (selected.size === 0) return;
    Alert.alert("Delete messages?", `Delete ${selected.size} item(s)?`, [
      { text:"Cancel", style:"cancel" },
      { text:"Delete", style:"destructive", onPress: async () => {
          try {
            await Promise.all(
              Array.from(selected).map(mid =>
                api.delete(`/stars/${id}/messages/${mid}`)
              )
            );
            setMessages(m => m.filter(msg => !selected.has(msg._id)));
            clearModes();
          } catch { Alert.alert("Error","Delete failed"); }
        } },
    ]);
  };

  /* ───────── EDIT flow ───────── */
  const confirmEdit = () => {
    const mid = Array.from(selected)[0];
    if (mid) {
      clearModes();
      goWrite(mid);
    }
  };

  /* ───────── DOWNLOAD flow ───────── */
  const downloadMsgs = async () => {
    try {
      if (messages.length === 0) {
        Alert.alert("Empty", "No messages to download."); return;
      }

      /* 1️⃣ build plain-text */
      const plain = messages.map(m => [
        "================================================================",
        `MESSAGE ID : ${m._id}`,
        `SENDER     : @${m.sender}`,
        `FOR        : ${m.forName ?? "@unknown"}`,
        "----------------------------------------------------------------",
        m.message,
        "================================================================",
        ""
      ].join("\n")).join("\n");

      /* 2️⃣ write file */
      const filename = `messages-${Date.now()}.txt`;
      const uri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, plain,
        { encoding: FileSystem.EncodingType.UTF8 });

      /* 3️⃣ share / notify */
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "text/plain",
          dialogTitle: "Share messages",
        });
      } else {
        Alert.alert("Saved", `File saved to:\n${uri}`);
      }
    } catch (err) {
      console.error("download:", err);
      Alert.alert("Error", "Could not create file");
    }
  };

  /* ───────── Card ───────── */
  const renderCard = ({ item }: { item: Msg }) => {
    const sel = selected.has(item._id);
    return (
      <TouchableOpacity
        onPress={() => mode==="none" ? setActive(item) : toggleSelect(item._id)}
        style={[
          st.cardWrapper,
          mode!=="none" && { borderColor:"#FEEDB6", borderWidth:1.5 },
          sel && { backgroundColor:"rgba(254,237,182,0.25)" },
        ]}
      >
        <LetterIcon width={CARD_WIDTH} height={120}/>
        <Text style={st.forTxt}>For: {item.forName}</Text>
        {sel && <View style={st.check}><CheckIcon width={20} height={20}/></View>}
      </TouchableOpacity>
    );
  };

  /* ───────── Loading ───────── */
  if (loading) {
    return (
      <View style={st.loading}>
        <ActivityIndicator size="large" color="#FEEDB6"/>
      </View>
    );
  }

  /* ───────── UI ───────── */
  return (
    <View style={{flex:1}}>
      <LinearGradient colors={["#000","#273166","#000"]} style={StyleSheet.absoluteFill}/>

      {/* ← back */}
      <TouchableOpacity style={st.backBtn} onPress={()=>router.back()}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2}/></Svg>
      </TouchableOpacity>

      <Text style={st.title}>Messages</Text>

      {/* ⋮ bulk menu */}
      {mode==="none" && (
        <>
          <TouchableOpacity style={st.moreBtn} onPress={()=>setBulkOpen(!bulkOpen)}>
            <MoreIcon width={24} height={24}/>
          </TouchableOpacity>

          {bulkOpen && (
            <View style={st.dropdown}>
              <TouchableOpacity style={st.dropItem} onPress={()=>{
                setBulkOpen(false); setMode("edit");
              }}>
                <EditIcon width={16} height={16}/><Text style={st.dropTxt}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity style={st.dropItem} onPress={()=>{
                setBulkOpen(false); setMode("delete");
              }}>
                <DeleteIcon width={16} height={16}/><Text style={st.dropTxt}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity style={st.dropItem} onPress={()=>{
                setBulkOpen(false); downloadMsgs();
              }}>
                <DownloadIcon width={16} height={16}/><Text style={st.dropTxt}>Download</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* list OR empty */}
      {messages.length === 0 ? (
        <View style={st.emptyWrap}>
          <NoMessageIcon width={140} height={140}/>
          <Text style={st.emptyTxt}>No messages found</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          numColumns={2}
          keyExtractor={m=>m._id}
          renderItem={renderCard}
          contentContainerStyle={st.list}
        />
      )}

      {/* + button */}
      {mode==="none" && (
        <View style={st.plusWrap}>
          <TouchableOpacity onPress={()=>goWrite()}>
            <PlusIcon width={50} height={50}/>
          </TouchableOpacity>
        </View>
      )}

      {/* footer bar for delete / edit */}
      {mode==="delete" && (
        <View style={st.bar}>
          <TouchableOpacity onPress={clearModes}><Text style={st.cancel}>Cancel</Text></TouchableOpacity>
          <TouchableOpacity disabled={selected.size===0} onPress={confirmDelete}>
            <Text style={[st.action, selected.size===0 && {opacity:0.4}]}>Delete ({selected.size})</Text>
          </TouchableOpacity>
        </View>
      )}
      {mode==="edit" && (
        <View style={st.bar}>
          <TouchableOpacity onPress={clearModes}><Text style={st.cancel}>Cancel</Text></TouchableOpacity>
          <TouchableOpacity disabled={selected.size!==1} onPress={confirmEdit}>
            <Text style={[st.action, selected.size!==1 && {opacity:0.4}]}>Edit ({selected.size})</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* detail modal */}
      {mode==="none" && (
        <Modal visible={!!active} transparent animationType="fade">
          <View style={st.overlay}>
            <View style={st.popup}>
              <TouchableOpacity style={st.close} onPress={()=>setActive(null)}>
                <CloseIcon width={20} height={20}/>
              </TouchableOpacity>
              <Text style={st.body}>{active?.message}</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

/* ───────── Styles ───────── */
const st = StyleSheet.create({
  loading:{flex:1,backgroundColor:"#000",justifyContent:"center",alignItems:"center"},
  backBtn:{position:"absolute",top:50,left:20,zIndex:10},
  title:{fontSize:20,fontFamily:"Alice-Regular",color:"#fff",textAlign:"center",marginTop:50,paddingBottom:20},

  moreBtn:{position:"absolute",top:55,right:20,zIndex:30,width:24,height:24,justifyContent:"center",alignItems:"center"},
  dropdown:{position:"absolute",top:83,right:20,backgroundColor:"#fff",borderRadius:8,
            paddingVertical:4,paddingHorizontal:8,shadowColor:"#000",shadowOpacity:0.2,
            shadowRadius:4,elevation:6,zIndex:29},
  dropItem:{flexDirection:"row",alignItems:"center",paddingVertical:6},
  dropTxt:{marginLeft:8,fontSize:14,fontFamily:"Alice-Regular",color:"#11152A"},

  emptyWrap:{flex:1,justifyContent:"center",alignItems:"center",marginBottom:80},
  emptyTxt:{color:"#fff",fontFamily:"Alice-Regular",fontSize:14,marginTop:8},

  list:{paddingHorizontal:16,paddingBottom:140},
  cardWrapper:{width:CARD_WIDTH,margin:8,alignItems:"center",borderRadius:12,overflow:"hidden"},
  forTxt:{fontFamily:"Alice-Regular",fontSize:13,color:"#fff",marginTop:4},
  check:{position:"absolute",top:6,right:6},

  plusWrap:{position:"absolute",bottom:100,width:"100%",alignItems:"center"},

  bar:{position:"absolute",bottom:100,left:0,right:0,flexDirection:"row",
       justifyContent:"space-between",paddingHorizontal:24},
  cancel:{fontFamily:"Alice-Regular",fontSize:16,color:"#fff"},
  action:{fontFamily:"Alice-Regular",fontSize:16,color:"#FEEDB6"},

  overlay:{flex:1,backgroundColor:"rgba(0,0,0,0.8)",justifyContent:"center",alignItems:"center",padding:20},
  popup:{backgroundColor:"#FFFDF7",borderRadius:8,padding:20,width:"100%"},
  close:{position:"absolute",top:14,right:14},
  body:{fontFamily:"Alice-Regular",fontSize:14,color:"#111",lineHeight:22,marginTop:30},
});