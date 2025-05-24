// app/(app)/my-stars/private-star/documents/DocumentsScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Dimensions, Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect }                 from "@react-navigation/native";
import { LinearGradient }                 from "expo-linear-gradient";
import * as DocumentPicker               from "expo-document-picker";
import * as WebBrowser                   from "expo-web-browser";
import Svg, { Path }                      from "react-native-svg";

import NoDocumentsIcon from "@/assets/images/svg-icons/no-documents.svg";
import PdfIcon          from "@/assets/images/svg-icons/pdf-image.svg";
import WordIcon         from "@/assets/images/svg-icons/word-image.svg";
import MoreIcon         from "@/assets/images/svg-icons/more.svg";
import AddPeopleIcon    from "@/assets/images/svg-icons/add-people.svg";
import SeeMembersIcon   from "@/assets/images/svg-icons/see-members.svg";
import PlusIcon         from "@/assets/images/svg-icons/plus.svg";
import EditIcon         from "@/assets/images/svg-icons/edit2.svg";

import api from "@/services/api";

const { width } = Dimensions.get("window");

type Doc = {
  _id:          string;
  key:          string;
  originalName: string;
  docType:      string;
  addedAt:      string;
};

export default function DocumentsScreen() {
  const router                 = useRouter();
  const { id: starId }         = useLocalSearchParams<{ id: string }>();

  const [docs,       setDocs]  = useState<Doc[]>([]);
  const [loading,    setLoad ] = useState(true);
  const [uploading,  setUp   ] = useState(false);
  const [menuOpen,   setMenu ] = useState<number|null>(null);

  /* ───────── fetch lijst ───────── */
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        if (!starId) return;
        setLoad(true);
        try {
          const { data } = await api.get<Doc[]>(`/stars/${starId}/documents`);
          if (mounted) setDocs(data);
        } catch (e) {
          console.error("documents fetch:", e);
          Alert.alert("Error", "Could not load documents.");
        } finally {
          if (mounted) setLoad(false);
        }
      })();
      return () => (mounted = false);
    }, [starId])
  );

  /* ───────── helpers ───────── */
  const iconFor = (t: string) => {
    const ext = t.toLowerCase();
    if (ext.includes("pdf")  || ext.endsWith(".pdf"))  return <PdfIcon  width={40} height={40}/>;
    if (ext.includes("doc")  || ext.endsWith(".doc")  || ext.endsWith(".docx")) return <WordIcon width={40} height={40}/>;
    return <PdfIcon width={40} height={40}/>;
  };

  const toggleMenu = (idx:number) => setMenu(menuOpen === idx ? null : idx);

  /* ───────── document downloaden / bekijken ───────── */
  const openDocument = async (doc: Doc) => {
    try {
      const { data } = await api.get<{ url: string }>(
        `/stars/${starId}/documents/${doc._id}`
      );
      await WebBrowser.openBrowserAsync(data.url);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not open document.");
    }
  };

  /* ───────── upload flow ───────── */
  const handlePickAndUpload = async () => {
    if (!starId) return;
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type:[
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory:false,
      });
      if (res.canceled) return;

      const file = res.assets[0];
      setUp(true);

      const form = new FormData();
      form.append("document", {
        uri : file.uri,
        name: file.name  ?? `file.${file.mimeType?.split("/").pop()}`,
        type: file.mimeType ?? "application/octet-stream",
      } as any);
      form.append("docType", (file.name?.split(".").pop() || "pdf").toLowerCase());

      const { data: newDoc } = await api.post<Doc>(
        `/stars/${starId}/documents/upload`,
        form,
        { headers:{ "Content-Type":"multipart/form-data" } }
      );

      setDocs(prev => [newDoc, ...prev]);
      Alert.alert("Success", "Document uploaded!");
    } catch (err:any) {
      console.error(err);
      Alert.alert("Upload failed", err.message ?? "Unknown error");
    } finally {
      setUp(false);
    }
  };

  /* ───────── render shortcuts ───────── */
  if (loading)   return <Loader label="Loading documents…"/>;
  if (uploading) return <Loader label="Uploading…"/>;

  /* ───────── UI ───────── */
  return (
    <View style={{ flex:1 }}>
      <LinearGradient colors={["#000","#273166","#000"]} style={StyleSheet.absoluteFill}/>

      {/* ← back */}
      <TouchableOpacity style={st.backBtn} onPress={()=>router.back()}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2}/></Svg>
      </TouchableOpacity>

      {/* (optioneel) edit icon */}
      <TouchableOpacity style={st.editBtn} disabled>
        <EditIcon width={30} height={30}/>
      </TouchableOpacity>

      <Text style={st.title}>Documenten</Text>

      {/* lijst / leeg  */}
      {docs.length === 0 ? (
        <EmptyState/>
      ) : (
        <ScrollView contentContainerStyle={st.listWrap}>
          {docs.map((d, idx) => (
            <TouchableOpacity              // ← hele rij aanklikbaar
              key={d._id}
              activeOpacity={0.8}
              onPress={()=>openDocument(d)}
              style={st.row}
            >
              {iconFor(d.docType || d.key)}
              <View style={st.info}>
                <Text style={st.name}>
                  {decodeURIComponent(d.originalName || d.key.split("/").pop()!)}
                </Text>
                <Text style={st.date}>
                  {new Date(d.addedAt).toLocaleDateString()}
                </Text>
              </View>

              <TouchableOpacity style={st.moreBtn} onPress={(e)=>{
                e.stopPropagation();   // tap op menu niet doorgeven aan rij
                toggleMenu(idx);
              }}>
                <MoreIcon width={20} height={20}/>
              </TouchableOpacity>

              {menuOpen === idx && (
                <View style={st.menu}>
                  <TouchableOpacity style={st.menuItem}>
                    <AddPeopleIcon width={16} height={16}/>
                    <Text style={st.menuTxt}>Add people</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={st.menuItem}>
                    <SeeMembersIcon width={16} height={16}/>
                    <Text style={st.menuTxt}>See members</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ＋ upload */}
      <View style={st.plusWrap}>
        <TouchableOpacity onPress={handlePickAndUpload}>
          <PlusIcon width={50} height={50}/>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ───────── Helper Components ───────── */
const Loader = ({ label }:{ label:string }) => (
  <View style={{flex:1,backgroundColor:"#000",justifyContent:"center",alignItems:"center"}}>
    <ActivityIndicator size="large" color="#FEEDB6"/>
    <Text style={{marginTop:12,color:"#fff",fontFamily:"Alice-Regular"}}>{label}</Text>
  </View>
);

const EmptyState = () => (
  <View style={st.emptyWrap}>
    <NoDocumentsIcon width={140} height={140}/>
    <Text style={st.emptyTxt}>No documents found</Text>
  </View>
);

/* ───────── Styles ───────── */
const st = StyleSheet.create({
  backBtn:{ position:"absolute", top:50, left:20, zIndex:10 },
  editBtn:{ position:"absolute", top:50, right:20, zIndex:10 },
  title  :{ fontFamily:"Alice-Regular", fontSize:20, color:"#fff",
            textAlign:"center", marginTop:50 },

  listWrap:{ paddingTop:40, paddingHorizontal:24, paddingBottom:140 },
  row:{ flexDirection:"row", alignItems:"center", marginBottom:28, position:"relative" },
  info:{ flex:1, marginLeft:14 },
  name:{ fontFamily:"Alice-Regular", fontSize:14, color:"#fff", marginBottom:2,
         maxWidth: width*0.55 },
  date:{ fontFamily:"Alice-Regular", fontSize:12, color:"#ccc" },
  moreBtn:{ padding:8 },

  menu:{ position:"absolute", top:38, right:0, backgroundColor:"#fff",
         borderRadius:12, width:180, paddingVertical:8, zIndex:20,
         shadowColor:"#000", shadowOpacity:0.2, shadowRadius:6, elevation:5 },
  menuItem:{ flexDirection:"row", alignItems:"center", gap:8,
             paddingVertical:8, paddingHorizontal:14 },
  menuTxt:{ fontSize:14, fontFamily:"Alice-Regular", color:"#11152A" },

  emptyWrap:{ flex:1, justifyContent:"center", alignItems:"center", marginBottom:80 },
  emptyTxt :{ color:"#fff", fontFamily:"Alice-Regular", fontSize:14, marginTop:8 },

  plusWrap:{ position:"absolute", bottom:100, width:"100%", alignItems:"center", zIndex:10 },
});