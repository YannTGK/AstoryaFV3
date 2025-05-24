import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Dimensions, Alert,
} from "react-native";
import { useRouter, useLocalSearchParams }   from "expo-router";
import { useFocusEffect }                    from "@react-navigation/native";
import { LinearGradient }                    from "expo-linear-gradient";
import * as DocumentPicker                   from "expo-document-picker";
import * as WebBrowser                       from "expo-web-browser";
import Svg, { Path }                         from "react-native-svg";

import NoDocumentsIcon from "@/assets/images/svg-icons/no-documents.svg";
import PdfIcon          from "@/assets/images/svg-icons/pdf-image.svg";
import WordIcon         from "@/assets/images/svg-icons/word-image.svg";
import MoreIcon         from "@/assets/images/svg-icons/more.svg";
import AddPeopleIcon    from "@/assets/images/svg-icons/add-people.svg";
import SeeMembersIcon   from "@/assets/images/svg-icons/see-members.svg";
import DeleteIcon       from "@/assets/images/svg-icons/delete.svg";
import PlusIcon         from "@/assets/images/svg-icons/plus.svg";

import api from "@/services/api";

const { width } = Dimensions.get("window");

type Doc = {
  _id: string; key: string; originalName: string;
  docType: string; addedAt: string;
};

export default function DocumentsScreen() {
  const router           = useRouter();
  const { id: starId }   = useLocalSearchParams<{ id: string }>();

  const [docs, setDocs]       = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUp]    = useState(false);
  const [menuOpen, setMenu]   = useState<number|null>(null);

  /* ─── fetch list ─── */
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!starId) return;
        setLoading(true);
        try {
          const { data } = await api.get<Doc[]>(`/stars/${starId}/documents`);
          active && setDocs(data);
        } catch (e) {
          console.error(e);
          Alert.alert("Error", "Could not load documents.");
        } finally {
          active && setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [starId])
  );

  /* ─── helpers ─── */
  const iconFor = (t:string) => {
    const e = t.toLowerCase();
    if (e.includes("doc") || e.endsWith(".doc") || e.endsWith(".docx"))
      return <WordIcon width={40} height={40} />;
    return <PdfIcon width={40} height={40} />;
  };

  const toggleMenu = (i:number) => setMenu(menuOpen===i?null:i);

  /* ─── open file ─── */
  const openDoc = async (d:Doc) => {
    try {
      const { data } = await api.get<{url:string}>(`/stars/${starId}/documents/${d._id}`);
      await WebBrowser.openBrowserAsync(data.url);
    } catch (e) {
      console.error(e); Alert.alert("Error", "Cannot open document");
    }
  };

  /* ─── delete ─── */
  const delDoc = (idx:number) => {
    const doc = docs[idx];
    Alert.alert("Delete document",
      `Delete "${decodeURIComponent(doc.originalName)}"?`,
      [
        { text:"Cancel", style:"cancel" },
        { text:"Delete", style:"destructive", onPress: async()=>{
            try {
              await api.delete(`/stars/${starId}/documents/${doc._id}`);
              setDocs(l=>l.filter((_,i)=>i!==idx));
              setMenu(null);
            } catch(e){
              console.error(e); Alert.alert("Error","Delete failed");
            }
          }}
      ]
    );
  };

  /* ─── upload ─── */
  const upload = async () => {
    if (!starId) return;
    const res = await DocumentPicker.getDocumentAsync({
      type:["application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      copyToCacheDirectory:false,
    });
    if (res.canceled) return;
    const file = res.assets[0]; setUp(true);

    try{
      const form = new FormData();
      form.append("document",{ uri:file.uri, name:file.name,
        type:file.mimeType??"application/octet-stream" } as any);
      form.append("docType", file.name?.split(".").pop()?.toLowerCase() ?? "pdf");

      const { data:newDoc } = await api.post<Doc>(
        `/stars/${starId}/documents/upload`, form,
        { headers:{ "Content-Type":"multipart/form-data" } }
      );
      setDocs(p=>[newDoc,...p]);
    }catch(e){ console.error(e); Alert.alert("Upload failed"); }
    finally{ setUp(false); }
  };

  /* ─── render shortcuts ─── */
  if (loading)   return <Loader label="Loading documents…"/>;
  if (uploading) return <Loader label="Uploading…"/>;

  return (
    <View style={{flex:1}}>
      <LinearGradient colors={["#000","#273166","#000"]} style={StyleSheet.absoluteFill}/>
      <TouchableOpacity style={st.backBtn} onPress={()=>router.back()}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6"
            stroke="#FEEDB6" strokeWidth={2}/></Svg>
      </TouchableOpacity>
      <Text style={st.title}>Documenten</Text>

      {menuOpen!==null && (
        <TouchableOpacity style={StyleSheet.absoluteFill}
                          activeOpacity={1} onPress={()=>setMenu(null)}/>
      )}

      {docs.length===0 ? <EmptyState/> : (
        <ScrollView contentContainerStyle={st.listWrap}>
          {docs.map((d,i)=>(
            <TouchableOpacity key={d._id} style={st.row}
                              activeOpacity={0.8} onPress={()=>openDoc(d)}>
              {iconFor(d.docType)}
              <View style={st.info}>
                <Text style={st.name}>{decodeURIComponent(d.originalName)}</Text>
                <Text style={st.date}>{new Date(d.addedAt).toLocaleDateString()}</Text>
              </View>

              <TouchableOpacity style={st.moreBtn}
                onPress={(e)=>{e.stopPropagation();toggleMenu(i);}}>
                <MoreIcon width={20} height={20}/>
              </TouchableOpacity>

              {menuOpen===i && (
                <View style={st.menu}>
                  <TouchableOpacity style={st.menuItem}
                    onPress={()=>router.push({
                      pathname:
                       "/(app)/my-stars/private-star/documents/three-dots/add-people/AddPeoplePage",
                      params:{ starId, documentId:d._id }
                    })}>
                    <AddPeopleIcon width={16} height={16}/>
                    <Text style={st.menuTxt}>Add people</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={st.menuItem}
                    onPress={()=>router.push({
                      pathname:
                       "/(app)/my-stars/private-star/documents/three-dots/see-members/SeeMembersDocuments",
                      params:{ starId, documentId:d._id }
                    })}>
                    <SeeMembersIcon width={16} height={16}/>
                    <Text style={st.menuTxt}>See members</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={st.menuItem} onPress={()=>delDoc(i)}>
                    <DeleteIcon width={16} height={16}/>
                    <Text style={st.menuTxt}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={st.plusWrap}>
        <TouchableOpacity onPress={upload}>
          <PlusIcon width={50} height={50}/>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── helpers ─── */
const Loader = ({label}:{label:string}) => (
  <View style={{flex:1,backgroundColor:"#000",justifyContent:"center",alignItems:"center"}}>
    <ActivityIndicator size="large" color="#FEEDB6"/>
    <Text style={{color:"#fff",marginTop:12,fontFamily:"Alice-Regular"}}>{label}</Text>
  </View>
);
const EmptyState = () => (
  <View style={st.emptyWrap}>
    <NoDocumentsIcon width={140} height={140}/>
    <Text style={st.emptyTxt}>No documents found</Text>
  </View>
);

/* ─── styles ─── */
const st = StyleSheet.create({
  backBtn:{position:"absolute",top:50,left:20,zIndex:40},
  title  :{fontFamily:"Alice-Regular",fontSize:20,color:"#fff",textAlign:"center",marginTop:50},
  listWrap:{paddingTop:40,paddingHorizontal:24,paddingBottom:140},
  row:{flexDirection:"row",alignItems:"center",marginBottom:28,position:"relative"},
  info:{flex:1,marginLeft:14},
  name:{fontFamily:"Alice-Regular",fontSize:14,color:"#fff",marginBottom:2,maxWidth:width*0.55},
  date:{fontFamily:"Alice-Regular",fontSize:12,color:"#ccc"},
  moreBtn:{padding:8},
  menu:{position:"absolute",top:38,right:0,backgroundColor:"#fff",borderRadius:12,
        width:180,paddingVertical:8,zIndex:50,shadowColor:"#000",shadowOpacity:0.2,
        shadowRadius:6,elevation:5},
  menuItem:{flexDirection:"row",alignItems:"center",gap:8,
            paddingVertical:8,paddingHorizontal:14},
  menuTxt:{fontFamily:"Alice-Regular",fontSize:14,color:"#11152A"},
  emptyWrap:{flex:1,justifyContent:"center",alignItems:"center",marginBottom:80},
  emptyTxt:{fontFamily:"Alice-Regular",fontSize:14,color:"#fff",marginTop:8},
  plusWrap:{position:"absolute",bottom:100,width:"100%",alignItems:"center",zIndex:40},
});