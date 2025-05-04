// app/(app)/dedicates/created-dedicates/dedicated-star.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import StarView from "@/components/stars/StarView";
import api from "@/services/api";

import PhotosIcon     from "@/assets/images/svg-icons/photos.svg";
import VideosIcon     from "@/assets/images/svg-icons/videos.svg";
import AudiosIcon     from "@/assets/images/svg-icons/audios.svg";
import DocumentsIcon  from "@/assets/images/svg-icons/documents.svg";
import BookOfLifeIcon from "@/assets/images/svg-icons/book-of-life.svg";
import MoreIcon       from "@/assets/images/svg-icons/more.svg";
import AddPeopleIcon  from "@/assets/images/svg-icons/add-people.svg";
import SeeMembersIcon from "@/assets/images/svg-icons/see-members.svg";

export default function DedicatedStar() {
  const router = useRouter();
  const { starId } = useLocalSearchParams<{ starId: string }>();
  const [star, setStar]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.get(`/stars/${starId}`)
      .then(r => setStar(r.data.star))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [starId]);

  if (loading || !star) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#fff"/></View>;
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000","#273166","#000"]} style={StyleSheet.absoluteFill}/>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/(app)/dedicates/dedicate")}>
        <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2}/></Svg>
      </TouchableOpacity>
      <TouchableOpacity style={styles.moreBtn} onPress={() => setMenuOpen(o => !o)}>
        <MoreIcon width={24} height={24}/>
      </TouchableOpacity>
      {menuOpen && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname:"/dedicates/created-dedicates/add-people/add-people-dedicate", params:{ starId } })}>
            <AddPeopleIcon width={16} height={16}/><Text style={styles.menuText}>Add people</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname:"/(app)/dedicates/created-dedicates/see-members/see-members-dedicate", params:{ starId } })}>
            <SeeMembersIcon width={16} height={16}/><Text style={styles.menuText}>See members</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.title}>Dedicated star</Text>
      <View style={styles.canvasWrapper}>
        <StarView emissive={parseInt(star.color.replace("#",""),16)} rotate={false}/>
        <View style={styles.nameOverlay}><Text style={styles.nameText}>{star.publicName}</Text></View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow} contentContainerStyle={{ paddingHorizontal:20 }}>
        {[
          { label:"Photo's",      icon:<PhotosIcon width={60} height={60}/> },
          { label:"Video’s",      icon:<VideosIcon width={60} height={60}/> },
          { label:"Audio’s",      icon:<AudiosIcon width={60} height={60}/> },
          { label:"Documents",    icon:<DocumentsIcon width={60} height={60}/> },
          { label:"Book of Life", icon:<BookOfLifeIcon width={60} height={60}/> },
        ].map((it,i)=>(
          <View key={i} style={styles.iconItem}>
            {it.icon}<Text style={styles.iconLabel}>{it.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered:{ flex:1,justifyContent:"center",alignItems:"center" },
  backBtn:{position:"absolute",top:50,left:20,zIndex:10},
  moreBtn:{position:"absolute",top:50,right:20,zIndex:10},
  menu:{position:"absolute",top:90,right:20,backgroundColor:"#fff",borderRadius:10,padding:10,gap:8,zIndex:20,shadowColor:"#000",shadowOpacity:0.15,shadowRadius:4,elevation:5},
  menuItem:{flexDirection:"row",alignItems:"center",gap:6},
  menuText:{fontSize:13,fontFamily:"Alice-Regular",color:"#11152A"},
  title:{fontFamily:"Alice-Regular",fontSize:20,color:"#fff",textAlign:"center",marginTop:50},
  canvasWrapper:{alignSelf:"center",marginTop:30,height:300,width:300,borderRadius:20,overflow:"hidden"},
  nameOverlay:{position:"absolute",bottom:"4%",alignSelf:"center",paddingHorizontal:16,paddingVertical:6},
  nameText:{fontSize:16,fontFamily:"Alice-Regular",color:"#fff",textAlign:"center"},
  scrollRow:{marginTop:40},
  iconItem:{alignItems:"center",marginRight:20},
  iconLabel:{color:"#fff",fontFamily:"Alice-Regular",fontSize:12,textAlign:"center",marginTop:4},
});