// app/(app)/explores/public/SearchPublic.tsx
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useLayoutStore } from "@/lib/store/layoutStore";

import SearchIcon from "@/assets/images/svg-icons/search.svg";
import FilterIcon from "@/assets/images/svg-icons/filter.svg";
import CloseIcon  from "@/assets/images/svg-icons/close-icon2.svg";

export default function SearchPublic(){
  const router         = useRouter();
  const setIsSearching = useLayoutStore(s=>s.setIsSearching);
  const showOnlyMine   = useLayoutStore(s=>s.showOnlyMine);
  const setShowOnlyMine= useLayoutStore(s=>s.setShowOnlyMine);

  const close=()=>{ setIsSearching(false); router.replace("/explores/public"); };

  return(
    <SafeAreaView style={st.wrap} edges={["top","left","right"]}>
      <TouchableOpacity style={st.close} onPress={close}>
        <CloseIcon width={18} height={18}/>
      </TouchableOpacity>

      <View style={st.row}>
        <SearchIcon width={20} height={20} style={{marginRight:10}}/>
        <TextInput style={st.input} placeholder="Search" placeholderTextColor="#aaa"/>
      </View>

      <TouchableOpacity style={st.filterBtn}
        onPress={()=>router.push({pathname:"/explores/filter",params:{from:"public"}})}>
        <Text style={st.filterTxt}>Filter</Text><FilterIcon width={18} height={18}/>
      </TouchableOpacity>

      {/* ENIGE toggle */}
      <View style={st.block}>
        <View style={st.head}>
          <Text style={st.title}>Show only my stars</Text>
          <Switch value={showOnlyMine} onValueChange={setShowOnlyMine}
                  thumbColor={showOnlyMine?"#FEEDB6":"#ccc"}
                  trackColor={{false:"#555",true:"#FEEDB6"}}/>
        </View>
        <Text style={st.desc}>
          Turn on to hide public stars you don’t have access to and bring your own stars closer together.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const st=StyleSheet.create({
  wrap:{flex:1,paddingHorizontal:20,backgroundColor:"#0B1022"},
  close:{position:"absolute",top:10,right:20,zIndex:10},
  row:{flexDirection:"row",alignItems:"center",backgroundColor:"#fff",
       borderRadius:22,paddingHorizontal:14,height:44,marginTop:30},
  input:{flex:1,fontSize:16,color:"#000"},
  filterBtn:{flexDirection:"row",alignSelf:"flex-end",marginTop:14,marginBottom:10,
             backgroundColor:"#FEEDB6",paddingVertical:8,paddingHorizontal:18,
             borderRadius:8,alignItems:"center",gap:6},
  filterTxt:{fontFamily:"Alice-Regular",fontSize:14,color:"#000"},
  block:{marginTop:10,borderBottomWidth:1,borderBottomColor:"#2A2F45",paddingBottom:16},
  head:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  title:{color:"#fff",fontSize:16,fontFamily:"Alice-Regular"},
  desc:{color:"#aaa",fontSize:13,marginTop:2,lineHeight:18,fontFamily:"Alice-Regular"},
});