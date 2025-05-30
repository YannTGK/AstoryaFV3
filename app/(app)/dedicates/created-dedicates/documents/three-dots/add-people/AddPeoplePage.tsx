import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import api from "@/services/api";

type Contact = { _id:string; username:string };

export default function AddPeopleDocuments() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { starId, documentId } =
    useLocalSearchParams<{ starId:string; documentId:string }>();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(false);

  useEffect(()=>{ (async()=>{
    try{
      const { data } = await api.get("/users/me/contacts");
      setContacts(data.contacts);
    }catch(e){ console.error(e); }
    finally{ setLoading(false); }
  })(); },[]);

  const toggle = (uid:string)=>
    setSelected(p=>p[0]===uid?[]:[uid]);

  const addMember = async ()=>{
    if(!starId||!documentId||!selected.length) return;
    try{
      const { data } = await api.get(`/stars/${starId}/documents/${documentId}`);
      const updated = Array.from(new Set([...(data.canView??[]), ...selected]));
      await api.put(`/stars/${starId}/documents/${documentId}`,{ canView: updated });

      setToast(true);
      setTimeout(()=>{ setToast(false); router.back(); },1700);
    }catch(e){
      console.error(e); Alert.alert("Error","Could not add user");
    }
  };

  if(loading){
    return <SafeAreaView style={st.center}>
      <ActivityIndicator size="large" color="#FEEDB6"/>
    </SafeAreaView>;
  }

  return(
    <SafeAreaView style={{flex:1}}>
      <LinearGradient colors={["#000","#273166","#000"]} style={StyleSheet.absoluteFill}/>
      <TouchableOpacity style={[st.backBtn,{top:insets.top+10}]}
                        onPress={()=>router.back()}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6"
              stroke="#FEEDB6" strokeWidth={2}/></Svg>
      </TouchableOpacity>

      <TouchableOpacity style={[st.addNew,{top:insets.top+10}]}
        onPress={()=>router.push({
          pathname:
            "/(app)/dedicates/created-dedicates/documents/three-dots/add-people/AddMorePeople",
          params:{ starId, documentId }
        })}>
        <Text style={st.plus}>＋</Text>
      </TouchableOpacity>

      <Text style={[st.title,{marginTop:insets.top}]}>Add people to document</Text>
      <Text style={st.subtitle}>Select one contact to grant view access.</Text>

      <FlatList data={contacts} keyExtractor={c=>c._id}
        contentContainerStyle={{paddingHorizontal:20,paddingTop:16}}
        renderItem={({item})=>{
          const chosen = selected.includes(item._id);
          return(
            <TouchableOpacity onPress={()=>toggle(item._id)}
               style={[st.userItem, chosen && st.userItemSel]}>
              <Text style={st.userTxt}>@{item.username}</Text>
              <View style={st.radioOuter}>{chosen && <View style={st.radioInner}/>}</View>
            </TouchableOpacity>
          );
        }}/>

      <TouchableOpacity style={[st.submit,!selected.length&&{opacity:0.4}]}
                        disabled={!selected.length} onPress={addMember}>
        <Text style={st.submitTxt}>Add to document</Text>
      </TouchableOpacity>

      {toast && (
        <View style={st.toast}><Text style={st.toastTxt}>User added.</Text></View>
      )}
    </SafeAreaView>
  );
}

/* styles identiek aan vorige bericht  */
const st = StyleSheet.create({
  backBtn:{position:"absolute",left:20,zIndex:10},
  addNew:{position:"absolute",right:16,zIndex:10},
  plus:{fontSize:32,color:"#fff"},
  title:{fontFamily:"Alice-Regular",fontSize:20,color:"#fff",textAlign:"center",},
  subtitle:{color:"#fff",fontFamily:"Alice-Regular",fontSize:16,textAlign:"center",
            marginTop:8,paddingHorizontal:16, marginBottom:16},

  userItem:{backgroundColor:"rgba(255,255,255,0.1)",borderRadius:8,
            paddingVertical:16,paddingHorizontal:16,marginBottom:12,
            flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  userItemSel:{backgroundColor:"rgba(255,255,255,0.25)"},
  userTxt:{color:"#fff",fontFamily:"Alice-Regular",fontSize:18},

  radioOuter:{width:20,height:20,borderRadius:10,borderWidth:2,borderColor:"#fff",
              justifyContent:"center",alignItems:"center"},
  radioInner:{width:10,height:10,borderRadius:5,backgroundColor:"#FEEDB6"},

  submit:{backgroundColor:"#FEEDB6",paddingVertical:16,marginHorizontal:16,
          borderRadius:8,marginTop:16,marginBottom:70},
  submitTxt:{color:"#11152A",fontFamily:"Alice-Regular",fontSize:18,textAlign:"center"},

  toast:{position:"absolute",bottom:200,left:40,right:40,backgroundColor:"#fff",
         borderRadius:16,padding:16,alignItems:"center"},
  toastTxt:{fontFamily:"Alice-Regular",fontSize:16,color:"#11152A"},

  center:{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"#000"}
});