/* vrijwel identiek – alleen router-doelen aangepast ➡️ Documents-flow */

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

const useDebounce = (v:string,d=300)=>{
  const [deb,setDeb] = useState(v);
  useEffect(()=>{ const id=setTimeout(()=>setDeb(v),d); return ()=>clearTimeout(id);},[v,d]);
  return deb.trim();
};

export default function AddMorePeopleDocuments(){
  const router = useRouter();
  const { starId, documentId } =
    useLocalSearchParams<{ starId:string; documentId:string }>();

  const { user }  = useAuthStore();
  const myId      = user?._id ?? user?.id;
  const myName    = user?.username;

  /* --- local state --- */
  const [search,setSearch]     = useState("");
  const debounced              = useDebounce(search);
  const [results,setResults]   = useState<any[]>([]);
  const [loading,setLoading]   = useState(false);
  const [selected,setSelected] = useState<any[]>([]);
  const [busyAdd,setBusyAdd]   = useState(false);
  const [done,setDone]         = useState(false);

  /* bestaande contacten */
  const [contacts,setContacts] = useState<string[]>([]);
  useEffect(()=>{(async()=>{
    try{
      const { contacts } = (await api.get("/users/me/contacts")).data;
      setContacts(contacts.map((c:any)=>String(c._id??c.id)));
    }catch(e){console.error(e);}
  })();},[]);

  /* live search */
  useEffect(()=>{
    if(!debounced){setResults([]);return;}
    let cancel=false;
    (async()=>{
      try{
        setLoading(true);
        const { data } = await api.get("/users/search",{ params:{ username:debounced }});
        if(cancel) return;
        let list = data.users??[];
        list = list
          .filter((u:any)=>String(u._id??u.id)!==myId)
          .filter((u:any)=>u.username!==myName)
          .filter((u:any)=>!contacts.includes(String(u._id??u.id)));
        setResults(list);
      }finally{!cancel&&setLoading(false);}
    })();
    return()=>{cancel=true;};
  },[debounced,myId,myName,contacts]);

  const toggle = (u:any)=>
    setSelected(p=>p.some(s=>(s._id??s.id)===(u._id??u.id))
      ? p.filter(s=>(s._id??s.id)!==(u._id??u.id))
      : [...p,u]);

  const remove = (id:string)=>
    setSelected(p=>p.filter(s=>(s._id??s.id)!==id));

  /* add contacts then return */
  const add = async ()=>{
    if(busyAdd||!selected.length) return;
    setBusyAdd(true);
    try{
      await Promise.all(selected.map(u=>
        api.post(`/users/${u._id??u.id}/contacts`).catch(e=>e)
      ));
      setDone(true);
      setTimeout(()=>{
        setDone(false);
        router.push({
          pathname:
            "/(app)/dedicates/created-dedicates/documents/three-dots/add-people/AddPeoplePage",
          params:{ starId, documentId }
        });
      },1400);
    }finally{ setBusyAdd(false); }
  };

  return(
    <View style={{flex:1}}>
      <LinearGradient colors={["#000","#273166","#000"]} style={StyleSheet.absoluteFill}/>
      <TouchableOpacity style={st.backBtn} onPress={()=>router.back()}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6"
             stroke="#FEEDB6" strokeWidth={2}/></Svg>
      </TouchableOpacity>

      <Text style={st.title}>Add members</Text>
      <Text style={st.subtitle}>
        Search usernames to add them to your contacts.
      </Text>

      {/* search bar */}
      <View style={st.searchBar}>
        <SearchIcon width={18} height={18} style={{marginRight:10}}/>
        <TextInput placeholder="Search" placeholderTextColor="#999"
          style={st.input} value={search} onChangeText={setSearch}
          autoCapitalize="none"/>
      </View>

      {/* selected badges */}
      {selected.length>0 && (
        <ScrollView horizontal style={{marginTop:20,maxHeight:64}}
                    contentContainerStyle={{paddingLeft:24}}>
          {selected.map(u=>(
            <View key={u._id??u.id} style={st.badge}>
              <View style={st.avatar}/>
              <Text style={st.badgeTxt}>@{u.username}</Text>
              <TouchableOpacity onPress={()=>remove(u._id??u.id)}>
                <CloseRedIcon width={18} height={18}/>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* results */}
      <ScrollView style={{marginTop:20,marginHorizontal:24}}>
        {loading ? <ActivityIndicator color="#fff" style={{marginTop:12}}/>
          : results.map(u=>(
            <TouchableOpacity key={u._id??u.id}
              style={[
                st.result,
                selected.some(s=>(s._id??s.id)===(u._id??u.id)) && st.resultSel
              ]}
              onPress={()=>toggle(u)}>
              <View style={st.avatar}/>
              <Text style={st.resultTxt}>@{u.username}</Text>
            </TouchableOpacity>
          ))}
        <View style={{height:150}}/>
      </ScrollView>

      {/* add btn */}
      <View style={st.btnWrap}>
        <TouchableOpacity style={[st.btn,!selected.length&&{opacity:0.4}]}
                          disabled={!selected.length||busyAdd} onPress={add}>
          <Text style={st.btnTxt}>{busyAdd?"Adding…":"add"}</Text>
        </TouchableOpacity>
      </View>

      {done && <Modal transparent animationType="fade">
        <View style={st.modal}><View style={st.modalBox}>
          <Text style={st.modalTxt}>User(s) added.</Text>
        </View></View></Modal>}
    </View>
  );
}

/* styles (beknopt) */
const st = StyleSheet.create({
  backBtn:{position:"absolute",top:50,left:20,zIndex:10},
  title:{fontFamily:"Alice-Regular",fontSize:20,color:"#fff",textAlign:"center",marginTop:50},
  subtitle:{color:"#fff",fontFamily:"Alice-Regular",fontSize:16,textAlign:"center",
            marginTop:8,paddingHorizontal:16},
  searchBar:{flexDirection:"row",alignItems:"center",backgroundColor:"#fff",
             borderRadius:30,paddingHorizontal:16,height:44,marginTop:20,
             marginHorizontal:16},
  input:{flex:1,fontFamily:"Alice-Regular",fontSize:16,color:"#11152A",marginTop:2},
  badge:{flexDirection:"row",alignItems:"center",backgroundColor:"#ffffff22",
         borderRadius:8,paddingVertical:12,paddingHorizontal:12,marginRight:10},
  avatar:{width:36,height:36,borderRadius:18,backgroundColor:"#fff",marginRight:8},
  badgeTxt:{color:"#fff",fontFamily:"Alice-Regular",fontSize:16,marginRight:12},
  result:{flexDirection:"row",alignItems:"center",backgroundColor:"#ffffff22",
          borderRadius:8,paddingVertical:14,paddingHorizontal:20,marginBottom:12},
  resultSel:{borderColor:"#FEEDB6",borderWidth:1.5},
  resultTxt:{color:"#fff",fontFamily:"Alice-Regular",fontSize:16},
  btnWrap:{position:"absolute",bottom:100,left:20,right:20},
  btn:{backgroundColor:"#FEEDB6",paddingVertical:14,borderRadius:12},
  btnTxt:{color:"#11152A",fontFamily:"Alice-Regular",fontSize:18,textAlign:"center"},
  modal:{flex:1,justifyContent:"center",alignItems:"center",
         backgroundColor:"rgba(0,0,0,0.2)"},
  modalBox:{backgroundColor:"#fff",borderRadius:16,paddingVertical:20,paddingHorizontal:24},
  modalTxt:{fontFamily:"Alice-Regular",fontSize:14,color:"#11152A",textAlign:"center"},
});