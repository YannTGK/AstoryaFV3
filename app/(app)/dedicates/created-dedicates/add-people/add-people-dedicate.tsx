import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import PlusIcon from "@/assets/images/svg-icons/plus3.svg";
import api      from "@/services/api";

export default function AddPeopleDedicate() {
  const router                = useRouter();
  const { starId }            = useLocalSearchParams<{ starId:string }>();
  const [selected,setSel]     = useState<string[]>([]);
  const [contacts,setCont]    = useState<any[]>([]);
  const [loading,setLoad]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { contacts } = (await api.get("/users/me/contacts")).data;
        setCont(contacts);
      } catch(e){ console.error("contacts:",e); }
      finally   { setLoad(false); }
    })();
  },[]);

  const toggle = (id:string) =>
    setSel((p)=>p.includes(id)?p.filter(i=>i!==id):[...p,id]);

  const next = () => {
    const first = contacts.find(c=>c._id===selected[0]);
    router.push({
      pathname:"/dedicates/created-dedicates/add-people/add-selected-people-dedicate",
      params:{ starId, userId:first._id, username:first.username },
    });
  };

  const addNew = () =>
    router.push({ pathname:"/dedicates/created-dedicates/add-people/add-members-dedicate",
                  params:{ starId } });

  return (
    <View style={{ flex:1 }}>
      <LinearGradient colors={["#000","#273166","#000"]} style={StyleSheet.absoluteFill}/>

      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2}/></Svg>
      </TouchableOpacity>

      <TouchableOpacity style={styles.plus} onPress={addNew}>
        <PlusIcon width={36} height={36}/>
      </TouchableOpacity>

      <Text style={styles.title}>Add people to star</Text>
      <Text style={styles.subtitle}>
        Select contacts to add to the star. To add someone new, tap the plus icon.
      </Text>

      {loading ? (
        <ActivityIndicator color="#fff" style={{ marginTop:40 }}/>
      ) : (
        <ScrollView style={{ marginTop:20, marginBottom:180 }}>
          {contacts.map((c)=>(
            <TouchableOpacity key={c._id}
              style={[styles.option, selected.includes(c._id)&&styles.selectedOpt]}
              onPress={()=>toggle(c._id)}>
              <Text style={styles.optionText}>@{c.username}</Text>
              <View style={selected.includes(c._id)?styles.radioSel:styles.radio}/>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.fixed}>
        <TouchableOpacity
          style={[styles.button, !selected.length && {opacity:0.6}]}
          disabled={!selected.length}
          onPress={next}>
          <Text style={styles.btnTxt}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  back:{position:"absolute",top:50,left:20,zIndex:10},
  plus:{position:"absolute",top:85,right:24,zIndex:10},
  title:{fontFamily:"Alice-Regular",fontSize:20,color:"#fff",textAlign:"center",marginTop:50},
  subtitle:{marginTop:60,fontFamily:"Alice-Regular",fontSize:14,color:"#fff",textAlign:"center",marginHorizontal:30},
  option:{marginTop:12,backgroundColor:"#ffffff22",marginHorizontal:16,borderRadius:10,paddingVertical:14,
          paddingHorizontal:20,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  selectedOpt:{borderColor:"#FEEDB6",borderWidth:1.5},
  optionText:{fontSize:16,fontFamily:"Alice-Regular",color:"#fff"},
  radio:{width:18,height:18,borderRadius:9,borderWidth:2,borderColor:"#fff"},
  radioSel:{width:18,height:18,borderRadius:9,backgroundColor:"#FEEDB6",borderColor:"#FEEDB6",borderWidth:2},
  fixed:{position:"absolute",bottom:100,left:20,right:20},
  button:{backgroundColor:"#FEEDB6",paddingVertical:14,borderRadius:12,shadowColor:"#FEEDB6",
          shadowOffset:{width:0,height:4},shadowOpacity:0.8,shadowRadius:12,elevation:6},
  btnTxt:{color:"#11152A",fontSize:16,fontFamily:"Alice-Regular",textAlign:"center"},
});