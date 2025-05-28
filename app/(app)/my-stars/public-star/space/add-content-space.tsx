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
import { Video, Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";
import { WebView } from "react-native-webview";

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
  const [uploading, setUploading] = useState(false); 

  const [modalVisible, setModalVisible] = useState(false);
  const [modalUri, setModalUri] = useState<string>("");
  const [modalType, setModalType] = useState<"image" | "video" | "audio" | "document">("image");
  const [soundObj, setSoundObj] = useState<Audio.Sound | null>(null);

  if (!starId || !roomId) {
    Alert.alert("Error", "Geen starId of roomId gevonden");
    router.back();
    return null;
  }

  // bovenin je component, vóór useFocusEffect
  const fetchAll = React.useCallback(async () => {
    setLoading(true);
    try {
      const [p, v, a, d, msgs] = await Promise.all([
        api.get<MediaItem[]>(`/stars/${starId}/three-d-rooms/${roomId}/photos`).then(r => r.data).catch(e => e.response?.status === 404 ? [] : Promise.reject(e)),
        api.get<MediaItem[]>(`/stars/${starId}/three-d-rooms/${roomId}/videos`).then(r => r.data).catch(e => e.response?.status === 404 ? [] : Promise.reject(e)),
        api.get<MediaItem[]>(`/stars/${starId}/three-d-rooms/${roomId}/audios`).then(r => r.data).catch(e => e.response?.status === 404 ? [] : Promise.reject(e)),
        api.get<MediaItem[]>(`/stars/${starId}/three-d-rooms/${roomId}/documents`).then(r => r.data).catch(e => e.response?.status === 404 ? [] : Promise.reject(e)),
        api.get<ThreeDRoomMessage[]>(`/stars/${starId}/three-d-rooms/${roomId}/messages`).then(r => r.data).catch(e => e.response?.status === 404 ? [] : Promise.reject(e)),
      ]);
      setPhotos(p);
      setVideos(v);
      setAudios(a);
      setDocuments(d);
      setMessages(msgs);
    } catch (err: any) {
      console.warn("Fetch failed:", err);
      Alert.alert("Error", "Kon content niet laden");
    } finally {
      setLoading(false);
    }
  }, [starId, roomId]);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      fetchAll();
      return () => { active = false; };
    }, [starId, roomId])
  );

  const openModal = async (uri: string, type: typeof modalType) => {
    setModalUri(uri);
    setModalType(type);
    if (type === 'audio') {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSoundObj(sound);
      await sound.playAsync();
    }
    setModalVisible(true);
  };

  const closeModal = async () => {
    setModalVisible(false);
    if (soundObj) {
      await soundObj.stopAsync();
      await soundObj.unloadAsync();
      setSoundObj(null);
    }
  };

  const uploadFile = async (uri: string, endpoint: string, fieldName = "file") => {
    const filename = uri.split("/").pop()!;
    const match = /\.(\w+)$/.exec(filename);
    const ext = (match?.[1] || "").toLowerCase();
    let type = "application/octet-stream";
    if (["jpg","jpeg","png"].includes(ext)) type = `image/${ext === "jpg" ? "jpeg" : ext}`;
    else if (["mp4","mov"].includes(ext))       type = `video/${ext}`;
    else if (["mp3","wav"].includes(ext))       type = `audio/${ext}`;
    else if (ext === "pdf")                       type = "application/pdf";
    else if (["doc","docx"].includes(ext))      type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const form = new FormData();
    form.append(fieldName, { uri, name: filename, type } as any);
    const res = await api.post(endpoint, form);
    return res.data;
  };

  const handleDelete = async (type: "photos" | "videos" | "audios" | "documents" | "messages", id: string) => {
    Alert.alert(
      "Verwijderen?",
      "Weet je zeker dat je dit wilt verwijderen?",
      [
        { text: "Nee", style: "cancel" },
        { text: "Ja", onPress: async () => {
            try {
              await api.delete(`/stars/${starId}/three-d-rooms/${roomId}/${type}/${id}`);
              const setter = { photos:setPhotos, videos:setVideos, audios:setAudios, documents:setDocuments, messages:setMessages }[type] as React.Dispatch<React.SetStateAction<any[]>>;
              setter(prev => prev.filter(item => item._id !== id));
            } catch (e: any) {
              Alert.alert("Delete Failed", e.response?.data?.message||e.message);
            }
        } }
      ]
    );
  };

  const pickAndUploadPhotos = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes:ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection:true, quality:0.8 });
    if (res.canceled) return;
    setUploading(true);
    try { for (let a of res.assets.slice(0,10-photos.length)){
        const { photo } = await uploadFile(a.uri, `/stars/${starId}/three-d-rooms/${roomId}/photos/upload`,'photo');
        setPhotos(prev=>[...prev,photo]);
        await fetchAll();
    }} catch(e:any){ Alert.alert('Upload failed',e.message);} finally{ setUploading(false);; }
  };

  const pickAndUploadVideos = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes:ImagePicker.MediaTypeOptions.Videos, allowsMultipleSelection:true, quality:0.8 });
    if (res.canceled) return;
    setUploading(true);
    try { for (let a of res.assets.slice(0,3-videos.length)){
        const { video } = await uploadFile(a.uri, `/stars/${starId}/three-d-rooms/${roomId}/videos/upload`,'video');
        setVideos(prev=>[...prev,video]);
        await fetchAll();
    }} catch(e:any){ Alert.alert('Upload failed',e.message);} finally{ setUploading(false); }
  };

  const pickAndUploadAudios = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type:'audio/*',copyToCacheDirectory:false });
    const asset = Array.isArray((res as any).assets)?(res as any).assets[0]:(res as any);
    if (!asset.uri) return;
    setUploading(true);
    try {
      const audio = await uploadFile(asset.uri, `/stars/${starId}/three-d-rooms/${roomId}/audios/upload`,'audio');
      setAudios(prev=>[...prev,audio]);
      await fetchAll();
    } catch(e:any){Alert.alert('Upload failed',e.message);} finally{setUploading(false);}
  };

  const pickAndUploadDocuments = async () => {
    const res = await DocumentPicker.getDocumentAsync({type:['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']});
    const uri = Array.isArray((res as any).assets)&&res.assets.length?res.assets[0].uri:(res as any).uri;
    if (!uri) return;
    setUploading(true);
    try{
      const doc = await uploadFile(uri, `/stars/${starId}/three-d-rooms/${roomId}/documents/upload`,'document');
      setDocuments(prev=>[...prev,doc]);
      await fetchAll();
    } catch(e:any){Alert.alert('Upload failed',e.message);} finally{setUploading(false);}
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size='large' color='#FEEDB6'/></View>;

  return (
    <View style={{flex:1}}>
      <LinearGradient colors={['#000','#273166','#000']} style={StyleSheet.absoluteFill}/>
      <TouchableOpacity style={styles.backBtn} onPress={()=>router.back()}><Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2}/></Svg></TouchableOpacity>
      <Text style={styles.title}>3D/VR – space</Text>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* PHOTOS */}
        <View style={styles.item}><Text style={styles.label}>Photos {photos.length}/10</Text><View style={styles.row}>
          {photos.map(p=><View key={p._id} style={styles.cardContainer}><TouchableOpacity onPress={()=>openModal(p.url,'image')}><Image source={{uri:p.url}} style={styles.mediaThumbnail}/></TouchableOpacity><TouchableOpacity style={styles.deleteBtn} onPress={()=>handleDelete('photos',p._id)}><Text style={styles.deleteTxt}>×</Text></TouchableOpacity></View>)}
          {photos.length<10&&<TouchableOpacity onPress={pickAndUploadPhotos}><PlusSquare width={60} height={60}/></TouchableOpacity>}
        </View></View>
        {/* VIDEOS */}
        <View style={styles.item}><Text style={styles.label}>Videos {videos.length}/3</Text><View style={styles.row}>
          {videos.map(v=><View key={v._id} style={styles.cardContainer}><TouchableOpacity onPress={()=>openModal(v.url,'video')}><View style={styles.videoPlaceholder}/></TouchableOpacity><TouchableOpacity style={styles.deleteBtn} onPress={()=>handleDelete('videos',v._id)}><Text style={styles.deleteTxt}>×</Text></TouchableOpacity></View>)}
          {videos.length<3&&<TouchableOpacity onPress={pickAndUploadVideos}><PlusSquare width={60} height={60}/></TouchableOpacity>}
        </View></View>
        {/* AUDIOS */}
        <View style={styles.item}><Text style={styles.label}>Audios {audios.length}/3</Text><View style={styles.row}>
          {audios.map(a=><View key={a._id} style={styles.cardContainer}><TouchableOpacity onPress={()=>openModal(a.url,'audio')}><AudioIcon width={60} height={60}/></TouchableOpacity><TouchableOpacity style={styles.deleteBtn} onPress={()=>handleDelete('audios',a._id)}><Text style={styles.deleteTxt}>×</Text></TouchableOpacity></View>)}
          {audios.length<3&&<TouchableOpacity onPress={pickAndUploadAudios}><PlusCircle width={60} height={60}/></TouchableOpacity>}
        </View></View>
        {/* DOCUMENTS */}
        <View style={styles.item}><Text style={styles.label}>Documents {documents.length}/3</Text><View style={styles.row}>
          {documents.map(d=><View key={d._id} style={styles.cardContainer}><TouchableOpacity onPress={()=>openModal(d.url,'document')}><PdfIcon width={60} height={60}/></TouchableOpacity><TouchableOpacity style={styles.deleteBtn} onPress={()=>handleDelete('documents',d._id)}><Text style={styles.deleteTxt}>×</Text></TouchableOpacity></View>)}
          {documents.length<3&&<TouchableOpacity onPress={pickAndUploadDocuments}><PlusSquare width={60} height={60}/></TouchableOpacity>}
        </View></View>
        {/* MESSAGES */}
        <View style={styles.item}><Text style={styles.label}>Messages {messages.length}/5</Text><View style={styles.row}>
          {messages.map(m=><View key={m._id} style={styles.cardContainer}><TouchableOpacity style={styles.messageCard} onPress={()=>router.push({pathname:'/(app)/my-stars/public-star/space/add-message/write-message-space',params:{starId,roomId,msgId:m._id}})}><Text style={styles.messageSender} numberOfLines={1}>{m.sender.name}</Text><Text style={styles.messageBody} numberOfLines={4}>{m.message}</Text><Text style={styles.messageDate} numberOfLines={1}>{new Date(m.addedAt).toLocaleTimeString('nl-BE',{hour:'2-digit',minute:'2-digit'})}</Text></TouchableOpacity><TouchableOpacity style={styles.deleteBtn} onPress={()=>handleDelete('messages',m._id)}><Text style={styles.deleteTxt}>×</Text></TouchableOpacity></View>)}
          {messages.length<5&&<TouchableOpacity style={styles.addMessageBtn} onPress={()=>router.push({pathname:'/(app)/my-stars/public-star/space/add-message/write-message-space',params:{starId,roomId}})}><PlusLetter width={60} height={60}/></TouchableOpacity>}
        </View></View>
      </ScrollView>
      {/* Overlay Modal */}
      <Modal visible={modalVisible} transparent onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeBtn} onPress={closeModal}><Svg width={32} height={32}><Path d="M18 6 L6 18 M6 6 L18 18" stroke="#fff" strokeWidth={2} strokeLinecap="round"/></Svg></TouchableOpacity>
          {modalType==='image'?
            <Image source={{uri:modalUri}} style={styles.fullscreenMedia} resizeMode="contain"/>
          :modalType==='video'?
            <Video source={{uri:modalUri}} style={styles.fullscreenMedia} useNativeControls resizeMode="contain"/>
          :modalType==='document'?
            <View style={styles.documentWrapper}><WebView source={{uri:modalUri}}/></View>
          :/* audio */
            <View style={styles.audioWrapper}><Text style={styles.audioText}>Audio speelt…</Text></View>
          }
        </View>
      </Modal>
      {/* Upload-overlay */}
      {uploading && (
        <Modal transparent animationType="none">
          <View style={styles.uploadOverlay}>
            <ActivityIndicator size="large" color="#FEEDB6" />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {flex:1,justifyContent:"center",alignItems:"center"},
  backBtn:{position:"absolute",top:50,left:20,zIndex:10},
  title:{fontFamily:"Alice-Regular",fontSize:20,color:"#fff",textAlign:"center",marginTop:50},
  scrollContent:{paddingTop:25,paddingBottom:160,paddingHorizontal:20},
  item:{marginBottom:24},
  label:{fontFamily:"Alice-Regular",fontSize:14,color:"#fff",marginBottom:6},
  row:{flexDirection:"row",flexWrap:"wrap",gap:10},
  cardContainer:{position:"relative",marginBottom:10},
  deleteBtn:{position:"absolute",top:4,right:0,width:28,height:28,borderRadius:14,justifyContent:"center",alignItems:"center",shadowColor:"#000",shadowOffset:{width:0,height:2},shadowOpacity:0.3,shadowRadius:2,elevation:4,zIndex:10},
  deleteTxt:{color:"#fff",fontWeight:"bold",fontSize:16,lineHeight:16},
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
  documentWrapper:{width:width-40,height:height-120,backgroundColor:"#fff",borderRadius:8,overflow:"hidden"},
  audioWrapper:{width:width-80,height:120,backgroundColor:"#1a1a1a",justifyContent:"center",alignItems:"center",borderRadius:8},
  audioText:{color:"#fff"},
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});