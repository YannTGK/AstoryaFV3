// screens/AddContentSpace.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";

import PlusSquare from "@/assets/images/svg-icons/plus-square.svg";
import PlusCircle from "@/assets/images/svg-icons/plus-circle.svg";
import AudioIcon from "@/assets/images/svg-icons/audio-line.svg";
import PlusLetter from "@/assets/images/svg-icons/plus-letter.svg";
import PdfIcon from "@/assets/images/svg-icons/pdf-image.svg";
import api from "@/services/api";

const { width, height } = Dimensions.get("window");
const CARD_SIZE = width / 3 - 30;

type ThreeDRoomMessage = {
  _id: string;
  message: string;
  sender: { _id: string; name: string };
  addedAt: string;
};

type MediaItem = { _id: string; url: string };

export default function AddContentSpace() {
  const router = useRouter();
  const { starId, roomId } = useLocalSearchParams<{ starId?: string; roomId?: string }>();

  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [audios, setAudios] = useState<MediaItem[]>([]);
  const [documents, setDocuments] = useState<MediaItem[]>([]);
  const [messages, setMessages] = useState<ThreeDRoomMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalUri, setModalUri] = useState<string>("");
  const [modalType, setModalType] = useState<"image" | "video">("image");

  if (!starId || !roomId) {
    Alert.alert("Error", "Geen starId of roomId gevonden");
    router.back();
    return null;
  }

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      const fetchAll = async () => {
        setLoading(true);
        try {
          const [p, v, a, d, msgs] = await Promise.all([
            api
              .get(`/stars/${starId}/three-d-rooms/${roomId}/photos`)
              .then((r) => r.data)
              .catch((e) => (e.response?.status === 404 ? [] : Promise.reject(e))),
            api
              .get(`/stars/${starId}/three-d-rooms/${roomId}/videos`)
              .then((r) => r.data)
              .catch((e) => (e.response?.status === 404 ? [] : Promise.reject(e))),
            api
              .get(`/stars/${starId}/three-d-rooms/${roomId}/audios`)
              .then((r) => r.data)
              .catch((e) => (e.response?.status === 404 ? [] : Promise.reject(e))),
            api
              .get(`/stars/${starId}/three-d-rooms/${roomId}/documents`)
              .then((r) => r.data)
              .catch((e) => (e.response?.status === 404 ? [] : Promise.reject(e))),
            api
              .get<ThreeDRoomMessage[]>(
                `/stars/${starId}/three-d-rooms/${roomId}/messages`
              )
              .then((r) => r.data)
              .catch((e) => (e.response?.status === 404 ? [] : Promise.reject(e))),
          ]);
          if (!active) return;
          setPhotos(p);
          setVideos(v);
          setAudios(a);
          setDocuments(d);
          setMessages(msgs);
        } catch (err: any) {
          console.warn("Fetch failed:", err);
          Alert.alert("Error", "Kon content niet laden");
        } finally {
          if (active) setLoading(false);
        }
      };
      fetchAll();
      return () => { active = false; };
    }, [starId, roomId])
  );

  const openModal = (uri: string, type: "image" | "video") => {
    setModalUri(uri);
    setModalType(type);
    setModalVisible(true);
  };

  const uploadFile = async (uri: string, endpoint: string, fieldName = "file") => {
    const filename = uri.split("/").pop()!;
    const match = /\.(\w+)$/.exec(filename);
    const ext = (match?.[1] || "").toLowerCase();
    let type = "application/octet-stream";
    if (["jpg","jpeg","png"].includes(ext)) type = `image/${ext==='jpg'?'jpeg':ext}`;
    else if (["mp4","mov"].includes(ext)) type = `video/${ext}`;
    else if (["mp3","wav"].includes(ext)) type = `audio/${ext}`;
    else if (ext==='pdf') type='application/pdf';
    else if (["doc","docx"].includes(ext)) type=
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const form = new FormData();
    form.append(fieldName, { uri, name: filename, type } as any);
    const res = await api.post(endpoint, form, { headers:{"Content-Type":"multipart/form-data"} });
    return res.data;
  };

  const pickAndUploadPhotos = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes:ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection:true, quality:0.8 });
    if (res.canceled) return;
    setLoading(true);
    try {
      for (let a of res.assets.slice(0,10-photos.length)){
        const {photo} = await uploadFile(a.uri, `/stars/${starId}/three-d-rooms/${roomId}/photos/upload`, 'photo');
        setPhotos(prev=>[...prev,photo]);
      }
    } catch(e:any){ Alert.alert('Upload failed',e.message); console.error(e); }
    finally{setLoading(false)}
  };

  const pickAndUploadVideos = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes:ImagePicker.MediaTypeOptions.Videos, allowsMultipleSelection:true, quality:0.8 });
    if (res.canceled) return;
    setLoading(true);
    try{
      for(let a of res.assets.slice(0,3-videos.length)){
        const {video} = await uploadFile(a.uri, `/stars/${starId}/three-d-rooms/${roomId}/videos/upload`, 'video');
        setVideos(prev=>[...prev,video]);
      }
    }catch(e:any){ Alert.alert('Upload failed',e.message); console.error(e);}finally{setLoading(false)}
  };

  const pickAndUploadAudios = async () => {
    const res = await DocumentPicker.getDocumentAsync({type:'audio/*'});
    if(res.type==='cancel')return;
    setLoading(true);
    try{
      const {audio} = await uploadFile(res.uri, `/stars/${starId}/three-d-rooms/${roomId}/audios/upload`, 'audio');
      setAudios(prev=>[...prev,audio]);
    }catch(e:any){Alert.alert('Upload failed',e.message);console.error(e);}finally{setLoading(false)}
  };

  const pickAndUploadDocuments = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type:['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'] });
    if(res.type==='cancel')return;
    setLoading(true);
    try{
      const {document} = await uploadFile(res.uri, `/stars/${starId}/three-d-rooms/${roomId}/documents/upload`, 'document');
      setDocuments(prev=>[...prev,document]);
    }catch(e:any){Alert.alert('Upload failed',e.message);console.error(e);}finally{setLoading(false)}
  };

  if(loading) return <View style={styles.center}><ActivityIndicator size='large' color='#FEEDB6'/></View>;

  return(
    <View style={{flex:1}}>
      <LinearGradient colors={["#000000","#273166","#000000"]} style={StyleSheet.absoluteFill}/>
      <TouchableOpacity style={styles.backBtn} onPress={()=>router.push({pathname:"/(app)/my-stars/public-star/space/save-space",params:{starId,roomId}})}>
        <Svg width={24}height={24}viewBox="0 0 24 24"><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2}/></Svg>
      </TouchableOpacity>
      <Text style={styles.title}>3D/VR – space</Text>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* PHOTOS */}
        <View style={styles.item}>
          <Text style={styles.label}>Photos {photos.length}/10</Text>
          <View style={styles.row}>
            {photos.map(p=>(<TouchableOpacity key={p._id} onPress={()=>openModal(p.url,'image')}><Image source={{uri:p.url}} style={styles.mediaThumbnail}/></TouchableOpacity>))}
            {photos.length<10&&<TouchableOpacity onPress={pickAndUploadPhotos}><PlusSquare width={60}height={60}/></TouchableOpacity>}
          </View>
        </View>
        {/* VIDEOS */}
        <View style={styles.item}>
          <Text style={styles.label}>Videos {videos.length}/3</Text>
          <View style={styles.row}>
            {videos.map(v=>(<TouchableOpacity key={v._id}onPress={()=>openModal(v.url,'video')}><View style={styles.videoPlaceholder}/></TouchableOpacity>))}
            {videos.length<3&&<TouchableOpacity onPress={pickAndUploadVideos}><PlusSquare width={60}height={60}/></TouchableOpacity>}
          </View>
        </View>
        {/* AUDIOS */}
        <View style={styles.item}>
          <Text style={styles.label}>Audios {audios.length}/3</Text>
          <View style={styles.row}>
            {audios.map(a=>(<AudioIcon key={a._id} width={60}height={60}style={{marginRight:8}}/>))}
            {audios.length<3&&<TouchableOpacity onPress={pickAndUploadAudios}><PlusCircle width={60}height={60}/></TouchableOpacity>}
          </View>
        </View>
        {/* MESSAGES */}
        <View style={styles.item}>
          <Text style={styles.label}>Berichten {messages.length}/5</Text>
          <View style={styles.row}>
            {messages.map(m=>(<TouchableOpacity key={m._id}style={styles.messageCard}onPress={()=>router.push({pathname:"/(app)/my-stars/public-star/space/add-message/write-message-space",params:{starId,roomId,msgId:m._id}})}><Text style={styles.messageSender} numberOfLines={1}>{m.sender.name}</Text><Text style={styles.messageBody} numberOfLines={4}>{m.message}</Text><Text style={styles.messageDate} numberOfLines={1}>{new Date(m.addedAt).toLocaleTimeString("nl-BE",{hour:'2-digit',minute:'2-digit'})}</Text></TouchableOpacity>))}
            {messages.length<5&&<TouchableOpacity style={styles.addMessageBtn}onPress={()=>router.push({pathname:"/(app)/my-stars/public-star/space/add-message/write-message-space",params:{starId,roomId}})}><PlusLetter width={60}height={60}/></TouchableOpacity>}
          </View>
        </View>
        {/* DOCUMENTS */}
        <View style={styles.item}>
          <Text style={styles.label}>Documents {documents.length}/3</Text>
          <View style={styles.row}>
            {documents.map(d=>(<TouchableOpacity key={d._id}><PdfIcon width={60}height={60}/></TouchableOpacity>))}
            {documents.length<3&&<TouchableOpacity onPress={pickAndUploadDocuments}><PlusSquare width={60}height={60}/></TouchableOpacity>}
          </View>
        </View>
      </ScrollView>
      <Modal visible={modalVisible}transparent><View style={styles.overlay}><TouchableOpacity style={styles.closeBtn}onPress={()=>setModalVisible(false)}><Svg width={32}height={32}viewBox="0 0 24 24"fill="none"><Path d="M18 6 L6 18 M6 6 L18 18"stroke="#fff"strokeWidth={2}strokeLinecap="round"/></Svg></TouchableOpacity>{modalType==="image"?(<Image source={{uri:modalUri}}style={styles.fullscreenMedia}resizeMode="contain"/>):(<Video source={{uri:modalUri}}style={styles.fullscreenMedia}useNativeControls resizeMode="contain"/>)} </View></Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center:{flex:1,justifyContent:"center",alignItems:"center"},
  backBtn:{position:"absolute",top:50,left:20,zIndex:10},
  title:{fontFamily:"Alice-Regular",fontSize:20,color:"#fff",textAlign:"center",marginTop:50},
  scrollContent:{paddingTop:25,paddingBottom:160,paddingHorizontal:20},
  item:{marginBottom:24},
  label:{fontFamily:"Alice-Regular",fontSize:14,color:"#fff",marginBottom:6},
  row:{flexDirection:"row",flexWrap:"wrap",gap:10},
  mediaThumbnail:{width:60,height:60,borderRadius:8},
  videoPlaceholder:{width:60,height:60,backgroundColor:"#444",borderRadius:8},
  messageCard:{width:CARD_SIZE,height:CARD_SIZE,backgroundColor:"#1a1a1a",borderRadius:6,padding:8,justifyContent:"space-between"},
  messageSender:{color:"#FEEDB6",fontWeight:"bold",fontSize:12},
  messageBody:{color:"#fff",fontSize:10},
  messageDate:{color:"#888",fontSize:10,textAlign:"right"},
  addMessageBtn:{width:CARD_SIZE,height:CARD_SIZE,justifyContent:"center",alignItems:"center",backgroundColor:"#273166",borderRadius:6},
  overlay:{flex:1,backgroundColor:"#000000dd",justifyContent:"center",alignItems:"center"},
  fullscreenMedia:{width:width-40,height:height-120},
  closeBtn:{position:"absolute",top:60,right:20,zIndex:10},
});
