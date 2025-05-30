// app/(app)/my-stars/private-star/documents/three-dots/see-members/SeeMembersDocuments.tsx
import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";   // ← nieuw
import Svg, { Path } from "react-native-svg";

import PlusIcon      from "@/assets/images/svg-icons/plus3.svg";
import NoMembersIcon from "@/assets/images/svg-icons/no-members.svg";
import api           from "@/services/api";

type Member = { _id:string; username:string; canEdit:boolean };

export default function SeeMembersDocuments() {
  const router = useRouter();
  const { starId, documentId } =
    useLocalSearchParams<{ starId:string; documentId:string }>();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── fetch leden bij iedere focus ── */
  useFocusEffect(
    useCallback(()=>{
      if(!starId || !documentId) return;

      let active   = true;
      const load   = async ()=>{
        setLoading(true);
        try{
          const { data } = await api.get(
            `/stars/${starId}/documents/${documentId}`
          );

          const canView:string[] = data.canView ?? [];
          const canEdit:string[] = data.canEdit ?? [];
          const ids = Array.from(new Set([...canView, ...canEdit]));

          const users = await Promise.all(ids.map(uid=>
            api.get(`/users/${uid}`)
               .then(r=>({ _id:uid, username:r.data.username }))
               .catch(()=>({ _id:uid, username:"unknown" }))
          ));

          active && setMembers(
            users.map(u=>({ ...u, canEdit:canEdit.includes(u._id) }))
          );
        }catch(e){ console.error("fetch members:",e); }
        finally  { active && setLoading(false); }
      };

      load();
      return ()=>{ active = false; };
    },[starId,documentId])
  );

  /* ── loading indicator ── */
  if(loading){
    return(<View style={st.center}>
      <ActivityIndicator size="large" color="#FEEDB6"/>
    </View>);
  }

  /* ── UI ── */
  return(
    <View style={{flex:1}}>
      <LinearGradient colors={["#000","#273166","#000"]}
                      style={StyleSheet.absoluteFill}/>

      {/* ← back */}
      <TouchableOpacity style={st.backBtn} onPress={()=>router.back()}>
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2}/>
        </Svg>
      </TouchableOpacity>

      {/* ＋ add */}
      <TouchableOpacity style={st.plusBtn}
        onPress={()=>router.push({
          pathname:
            "/(app)/dedicates/created-dedicates/documents/three-dots/add-people/AddPeoplePage",
          params:{ starId, documentId }
        })}>
        <PlusIcon width={36} height={36}/>
      </TouchableOpacity>

      <Text style={st.title}>Members</Text>

      {members.length === 0 ? (
        /* ── EMPTY ── */
        <View style={st.emptyWrap}>
          {NoMembersIcon && <NoMembersIcon width={140} height={140}/>}
          <Text style={st.emptyTxt}>No members yet</Text>
        </View>
      ) : (
        /* ── LIST ── */
        <ScrollView style={st.listWrapper}
                    contentContainerStyle={{paddingBottom:100}}>
          {members.map(m=>(
            <View key={m._id} style={st.memberItem}>
              <View style={st.avatar}/>
              <Text style={st.memberName}>@{m.username}</Text>
              {m.canEdit && <Text style={st.badge}>edit</Text>}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

/* ── styles ongewijzigd ── */
const st = StyleSheet.create({
  backBtn:{position:"absolute",top:50,left:20,zIndex:10},
  plusBtn:{position:"absolute",top:95,right:16,zIndex:20},
  title:{fontFamily:"Alice-Regular",fontSize:20,color:"#fff",
         textAlign:"center",marginTop:50},
  listWrapper:{marginTop:88,paddingHorizontal:16},
  memberItem:{flexDirection:"row",alignItems:"center",backgroundColor:"#fff",
              borderRadius:8,paddingVertical:12,paddingHorizontal:16,marginBottom:16},
  avatar:{width:36,height:36,borderRadius:18,backgroundColor:"#fff",
          marginRight:12,borderWidth:0.5,borderColor:"#999"},
  memberName:{fontFamily:"Alice-Regular",fontSize:16,color:"#11152A",flex:1},
  badge:{fontFamily:"Alice-Regular",fontSize:12,color:"#FEEDB6",
         borderWidth:1,borderColor:"#FEEDB6",borderRadius:6,
         paddingHorizontal:6,paddingVertical:2},

  emptyWrap:{flex:1,justifyContent:"center",alignItems:"center",marginBottom:80},
  emptyTxt:{color:"#fff",fontFamily:"Alice-Regular",fontSize:14,marginTop:8},

  center:{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"#000"},
});