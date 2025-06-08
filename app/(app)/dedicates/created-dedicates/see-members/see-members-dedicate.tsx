import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

import PlusIcon      from "@/assets/images/svg-icons/plus3.svg";
import NoMembersIcon from "@/assets/images/svg-icons/no-members.svg";
import api           from "@/services/api";

interface Member {
  _id:     string;
  username:string;
  role:    "Can view"|"Can edit";
}

export default function SeeMembersDedicate() {
  const router = useRouter();
  const { starId } = useLocalSearchParams<{ starId: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!starId) return;
    api.get<{ members: Member[] }>(`/stars/${starId}/members`)
      .then(r => setMembers(r.data.members))
      .catch(e => console.error("load members error", e))
      .finally(() => setLoading(false));
  }, [starId]);

  const goAdd = () => router.push({
    pathname: "/dedicates/created-dedicates/add-people/add-people-dedicate",
    params: { starId }
  });

  const goStatus = (m: Member) => router.push({
    pathname: "/dedicates/created-dedicates/see-members/account-members-status-dedicate",
    params: {
      starId,
      userId:   m._id,
      username: m.username,
      role:     m.role
    }
  });

  return (
    <View style={{flex:1}}>
      <LinearGradient
        colors={["#000","#273166","#000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* ← Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2}/>
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Members</Text>

      {/* + Add new */}
      <TouchableOpacity style={styles.plusBtn} onPress={goAdd}>
        <PlusIcon width={36} height={36}/>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator color="#fff" style={{marginTop:80}}/>
      ) : members.length === 0 ? (
        <View style={styles.noMembers}>
          <NoMembersIcon width={140} height={140}/>
          <Text style={styles.emptyText}>No members found</Text>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={{paddingBottom:100}}>
          {members.map(m => (
            <TouchableOpacity
              key={m._id}
              style={styles.item}
              onPress={() => goStatus(m)}
            >
              <View style={styles.avatar}/>
              <Text style={styles.itemText}>
                @{m.username} ({m.role})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {position:"absolute",top:50,left:20,zIndex:10},
  plusBtn: {position:"absolute",top:85,right:24,zIndex:10},
  title:   {fontSize:20,color:"#fff",textAlign:"center",marginTop:50, fontFamily:"Alice-Regular"},
  list:    {marginTop:60,paddingHorizontal:16},
  item:    {flexDirection:"row",alignItems:"center",backgroundColor:"#ffffff22",borderRadius:10,padding:12,marginBottom:12},
  avatar:  {width:36,height:36,borderRadius:18,backgroundColor:"#fff",marginRight:12,borderWidth:0.5,borderColor:"#999"},
  itemText:{color:"#fff",fontSize:16},
  noMembers:{flex:1,justifyContent:"center",alignItems:"center",marginBottom:80},
  emptyText:{color:"#fff",marginTop:10},
});