// app/(app)/public/PublicStarRoomPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Modal,
  Image,
  Linking,
} from "react-native";
import { Video, Audio } from "expo-av";
import { useRouter, useLocalSearchParams } from "expo-router";

import PublicBasicRoomGL from "@/components/rooms/PublicBasicRoomGL";
import api from "@/services/api";

/* icons & arrows */
import ArrowLeft      from "@/assets/images/icons/arrowLeft.svg";
import ArrowRight     from "@/assets/images/icons/arrowRight.svg";
import PhotoIcon      from "@/assets/images/public-room-icons/public-photo.svg";
import VideoIcon      from "@/assets/images/public-room-icons/public-video.svg";
import AudioIcon      from "@/assets/images/public-room-icons/public-audio.svg";
import DocumentIcon   from "@/assets/images/public-room-icons/public-documents.svg";
import MessageIcon    from "@/assets/images/public-room-icons/public-message.svg";
import BackButtonIcon from "@/assets/images/public-room-icons/back_button.svg";

/* data-types */
type ViewKey      = "Foto's" | "Video's" | "Audio" | "Documenten" | "Messages";
type ThreeDRoom   = { _id: string; roomType: string };
type MediaItem    = { _id: string; url: string };
type DocumentItem = { _id: string; originalName: string; url: string };
type Message      = { _id: string; message: string };

export default function PublicStarRoomPage() {
  const { starId } = useLocalSearchParams<{ starId: string }>();
  const router     = useRouter();

  /* ────────── basic room loading ────────── */
  const [rooms, setRooms]   = useState<ThreeDRoom[] | null>(null);
  const [loading, setLoad ] = useState(false);
  const [error,   setError ] = useState<string | null>(null);

  useEffect(() => {
    if (!starId) return;
    setLoad(true);
    api.get<ThreeDRoom[]>(`/stars/${starId}/three-d-rooms`)
      .then(r => setRooms(r.data))
      .catch(() => setError("Failed to load 3D rooms"))
      .finally(() => setLoad(false));
  }, [starId]);

  /* ────────── camera state ────────── */
  const initialPos:    [number, number, number] = [0, 16, 20];
  const initialTarget: [number, number, number] = [0, 3, 0];
  const [camPos,    setCamPos]    = useState(initialPos);
  const [camTarget, setCamTarget] = useState(initialTarget);

  /* ────────── tab / active overlay ────────── */
  const [active, setActive] = useState<ViewKey | "">("");

  /* overlay media + indices */
  const [photos,    setPhotos]    = useState<MediaItem[]    | null>(null);
  const [photoIdx,  setPhotoIdx]  = useState(0);
  const [videos,    setVideos]    = useState<MediaItem[]    | null>(null);
  const [videoIdx,  setVideoIdx]  = useState(0);
  const [audios,    setAudios]    = useState<MediaItem[]    | null>(null);
  const [audioIdx,  setAudioIdx]  = useState(0);
  const [docs,      setDocs]      = useState<DocumentItem[] | null>(null);
  const [docIdx,    setDocIdx]    = useState(0);
  const [messages,  setMessages]  = useState<Message[]      | null>(null);
  const [msgIdx,    setMsgIdx]    = useState(0);

  /* ────────── availability flags ────────── */
  const [hasContent, setHasContent] = useState<Record<ViewKey, boolean>>({
    "Foto's": false, "Video's": false, Audio: false, Documenten: false, Messages: false,
  });

  /* one tiny request per type to know availability */
  useEffect(() => {
    if (!rooms?.length || !starId) return;
    const roomId = rooms[0]._id;
    const base   = `/stars/${starId}/three-d-rooms/${roomId}`;

    (async () => {
      try {
        const [ph,v,a,d,m] = await Promise.all([
          api.get(`${base}/photos?limit=1`   ),
          api.get(`${base}/videos?limit=1`   ),
          api.get(`${base}/audios?limit=1`   ),
          api.get(`${base}/documents?limit=1`),
          api.get(`${base}/messages?limit=1` ),
        ]);
        setHasContent({
          "Foto's":     ph.data.length > 0,
          "Video's":    v.data.length > 0,
          Audio:        a.data.length > 0,
          Documenten:   d.data.length > 0,
          Messages:     m.data.length > 0,
        });
      } catch {/* network error -> leave false */}
    })();
  }, [rooms, starId]);

  /* ────────── load overlay data when a tab opens ────────── */
  useEffect(() => {
    if (!active || !rooms?.length) {
      setPhotos(null); setVideos(null); setAudios(null); setDocs(null); setMessages(null);
      return;
    }
    const roomId = rooms[0]._id;
    const base   = `/stars/${starId}/three-d-rooms/${roomId}`;

    if (active === "Foto's") {
      setPhotoIdx(0);
      api.get<MediaItem[]>(`${base}/photos`).then(r => setPhotos(r.data)).catch(() => setPhotos([]));
    }
    if (active === "Video's") {
      setVideoIdx(0);
      api.get<MediaItem[]>(`${base}/videos`).then(r => setVideos(r.data)).catch(() => setVideos([]));
    }
    if (active === "Audio") {
      setAudioIdx(0);
      api.get<MediaItem[]>(`${base}/audios`).then(r => setAudios(r.data)).catch(() => setAudios([]));
    }
    if (active === "Documenten") {
      setDocIdx(0);
      api.get<DocumentItem[]>(`${base}/documents`).then(r => setDocs(r.data)).catch(() => setDocs([]));
    }
    if (active === "Messages") {
      setMsgIdx(0);
      api.get<Message[]>(`${base}/messages`).then(r => setMessages(r.data)).catch(() => setMessages([]));
    }
  }, [active, rooms, starId]);

  /* ────────── early states ────────── */
  if (loading)       return <Overlay text="Loading…" />;
  if (error)         return <Overlay text={error} error />;
  if (!rooms?.length) return <Overlay text="No basic room available." />;

  /* ────────── buttons descriptor ────────── */
  const views = [
    { key:"Foto's",     icon:PhotoIcon,    pos:[12, 9,-2], target:[0,3,0] },
    { key:"Video's",    icon:VideoIcon,    pos:[14,10,-2], target:[0,3,0] },
    { key:"Audio",      icon:AudioIcon,    pos:[10,10, 7], target:[0,3,0] },
    { key:"Documenten", icon:DocumentIcon, pos:[ 7, 5,-2], target:[0,3,0] },
    { key:"Messages",   icon:MessageIcon,  pos:[ 1.5,10,0],target:[0,3,0] },
  ] as const;

  /* ────────────────── RENDER ────────────────── */
  return (
    <SafeAreaView style={styles.container}>
      {/* back */}
      <TouchableOpacity style={styles.back} onPress={()=>router.back()}>
        <BackButtonIcon width={36} height={36}/>
      </TouchableOpacity>

      {/* tab-icons */}
      <View style={styles.buttons}>
        {views.map(v=>{
          const Icon      = v.icon;
          const isActive  = active===v.key;
          const available = hasContent[v.key];
          return (
            <TouchableOpacity
              key={v.key}
              disabled={!available}
              style={[
                isActive   && styles.iconBtnActive,
                !available && styles.iconBtnDisabled,
              ]}
              onPress={()=> {
                if (!available) return;
                if (isActive){
                  setActive(""); setCamPos(initialPos); setCamTarget(initialTarget);
                } else {
                  setActive(v.key); setCamPos(v.pos); setCamTarget(v.target);
                }
              }}
            >
              <Icon
                width={40} height={40}
                fill={
                  !available ? "#555"
                  : isActive  ? "#0B1022"
                  :             "#FFFFFF"
                }/>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* GL room */}
      <PublicBasicRoomGL initialCameraPosition={camPos} initialCameraTarget={camTarget}/>

      {/* overlay modal */}
      <Modal visible={!!active} transparent animationType="fade">
        <View style={styles.overlay}>
          {/* Photos */}
          {active==="Foto's" && (
            photos?.length
              ? <SingleViewer
                  uri={photos[photoIdx].url}
                  index={photoIdx}
                  length={photos.length}
                  onPrev={()=>setPhotoIdx(i=>Math.max(i-1,0))}
                  onNext={()=>setPhotoIdx(i=>Math.min(i+1,photos.length-1))}
                  Content={({uri})=>(
                    <Image source={{uri}} style={styles.photoFull} resizeMode="contain"/>
                  )}
                />
              : <Text style={styles.info}>No photos available.</Text>
          )}

          {/* Videos */}
          {active==="Video's" && (
            videos?.length
              ? <SingleViewer
                  uri={videos[videoIdx].url}
                  index={videoIdx}
                  length={videos.length}
                  onPrev={()=>setVideoIdx(i=>Math.max(i-1,0))}
                  onNext={()=>setVideoIdx(i=>Math.min(i+1,videos.length-1))}
                  Content={({uri})=>(
                    <Video source={{uri}} style={styles.photoFull}
                      useNativeControls resizeMode="contain"/>
                  )}
                />
              : <Text style={styles.info}>No videos available.</Text>
          )}

          {/* Audio */}
          {active==="Audio" && (
            audios?.length
              ? <SingleViewer
                  uri={audios[audioIdx].url}
                  index={audioIdx}
                  length={audios.length}
                  onPrev={()=>setAudioIdx(i=>Math.max(i-1,0))}
                  onNext={()=>setAudioIdx(i=>Math.min(i+1,audios.length-1))}
                  Content={({uri})=><AudioRow url={uri}/>}
                />
              : <Text style={styles.info}>No audio files available.</Text>
          )}

          {/* Documents */}
          {active==="Documenten" && (
            docs?.length
              ? <View style={styles.docContainer}>
                  <Text style={styles.docName}>{docs[docIdx].originalName}</Text>
                  <View style={styles.photoNav}>
                    <TouchableOpacity
                      onPress={()=>setDocIdx(i=>Math.max(i-1,0))}
                      disabled={docIdx===0}
                      style={[styles.navButton,docIdx===0&&styles.navDisabled]}>
                      <ArrowLeft width={44} height={44}/>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={()=>Linking.openURL(docs[docIdx].url)}
                      style={styles.openButton}>
                      <Text style={styles.openButtonText}>Open PDF</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={()=>setDocIdx(i=>Math.min(i+1,docs.length-1))}
                      disabled={docIdx===docs.length-1}
                      style={[styles.navButton2,docIdx===docs.length-1&&styles.navDisabled]}>
                      <ArrowRight width={44} height={44}/>
                    </TouchableOpacity>
                  </View>
                </View>
              : <Text style={styles.info}>No documents available.</Text>
          )}

          {/* Messages */}
          {active==="Messages" && (
            messages?.length
              ? <SingleViewer
                  uri={messages[msgIdx].message}
                  index={msgIdx}
                  length={messages.length}
                  onPrev={()=>setMsgIdx(i=>Math.max(i-1,0))}
                  onNext={()=>setMsgIdx(i=>Math.min(i+1,messages.length-1))}
                  Content={({uri})=>(
                    <Text style={[styles.item,{textAlign:"center"}]}>{uri}</Text>
                  )}
                />
              : <Text style={styles.info}>No messages available.</Text>
          )}

          {/* close overlay */}
          <TouchableOpacity
            style={styles.closeIconContainer}
            onPress={()=>{
              setActive(""); setCamPos(initialPos); setCamTarget(initialTarget);
            }}>
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ────────── helpers ────────── */
function SingleViewer({
  uri,index,length,onPrev,onNext,Content
}:{
  uri:string,index:number,length:number,onPrev:()=>void,onNext:()=>void,
  Content:React.FC<{uri:string}>
}){
  return(
    <View style={styles.photoContainer}>
      <Content uri={uri}/>
      <View style={styles.photoNav}>
        <TouchableOpacity onPress={onPrev} disabled={index===0}
          style={[styles.navButton,index===0&&styles.navDisabled]}>
          <ArrowLeft width={44} height={44}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext} disabled={index===length-1}
          style={[styles.navButton2,index===length-1&&styles.navDisabled]}>
          <ArrowRight width={44} height={44}/>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AudioRow({url}:{url:string}){
  const [sound,setSound]=useState<Audio.Sound|null>(null);
  const [playing,setPlaying]=useState(false);

  const toggle=async()=>{
    if(!sound){
      const s=new Audio.Sound();
      try{await s.loadAsync({uri:url});await s.playAsync();setSound(s);setPlaying(true);}
      catch{ s && s.unloadAsync(); }
    }else{
      playing?await sound.pauseAsync():await sound.playAsync();
      setPlaying(!playing);
    }
  };

  useEffect(()=>()=>{sound&&sound.unloadAsync()},[sound]);

  return(
    <TouchableOpacity onPress={toggle} style={styles.audioRow}>
      <Text style={styles.item}>{playing?"⏸ Pause audio":"▶️ Play audio"}</Text>
    </TouchableOpacity>
  );
}

const Overlay=({text,error}:{text:string;error?:boolean})=>(
  <View style={styles.centered}><Text style={error?styles.error:styles.info}>{text}</Text></View>
);

/* ────────── styles ────────── */
const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:"#000"},
  back:{position:"absolute",top:70,left:20,zIndex:10},
  centered:{flex:1,justifyContent:"center",alignItems:"center"},
  info:{color:"#fff",fontSize:18,textAlign:"center",width:"80%"},
  error:{color:"red",fontSize:18},

  /* icon buttons */
  buttons:{position:"absolute",bottom:200,left:20,zIndex:10,
           backgroundColor:"#000",flexDirection:"column",gap:18,
            opacity: 0.85,
           padding:12,borderRadius:50},
  iconBtnDisabled:{opacity:0.35},

  overlay:{flex:1,backgroundColor:"rgba(0,0,0,0.85)",padding:20},

  photoContainer:{flex:1,justifyContent:"center",alignItems:"center"},
  photoFull:{width:"100%",height:500,marginBottom:12},
  photoNav:{flexDirection:"row",justifyContent:"space-between",width:"100%"},
  navButton:{flex:1,alignItems:"flex-end"},
  navButton2:{flex:1,alignItems:"flex-start"},
  navDisabled:{opacity:0.3},

  docContainer:{flex:1,justifyContent:"center",alignItems:"center",paddingHorizontal:20},
  docName:{color:"#fff",fontSize:20,marginBottom:12,textAlign:"center"},
  openButton:{flex:1,backgroundColor:"#444",paddingVertical:12,marginHorizontal:8,
              borderRadius:4,alignItems:"center"},
  openButtonText:{color:"#fff",fontSize:16},

  audioRow:{paddingVertical:8,borderBottomWidth:1,borderBottomColor:"#333"},
  item:{color:"#fff",fontSize:18,marginVertical:4},

  closeIconContainer:{position:"absolute",top:150,right:20,width:32,height:32,
                      borderRadius:16,backgroundColor:"rgba(255,255,255,0.2)",
                      alignItems:"center",justifyContent:"center"},
  closeIcon:{color:"#fff",fontSize:24,lineHeight:24,textAlign:"center"},
});