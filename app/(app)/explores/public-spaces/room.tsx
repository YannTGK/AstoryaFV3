// PublicStarRoomPage.tsx
import React, { useEffect, useState, useRef } from "react";
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
import { WebView } from "react-native-webview";
import { useRouter, useLocalSearchParams } from "expo-router";
import PublicBasicRoomGL from "@/components/rooms/PublicBasicRoomGL";
import api from "@/services/api";
import ArrowLeft from "@/assets/images/icons/arrowLeft.svg";
import ArrowRight from "@/assets/images/icons/arrowRight.svg";

type ThreeDRoom = { _id: string; roomType: string };
type Message = { _id: string; message: string };
type DocumentItem = { _id: string; originalName: string; url: string };
type MediaItem = { _id: string; url: string };

export default function PublicStarRoomPage() {
  const { starId } = useLocalSearchParams<{ starId: string }>();
  const router = useRouter();

  const [rooms, setRooms] = useState<ThreeDRoom[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // camera controls
  const initialPos: [number, number, number] = [0, 16, 20];
  const initialTarget: [number, number, number] = [0, 3, 0];
  const [camPos, setCamPos] = useState(initialPos);
  const [camTarget, setCamTarget] = useState(initialTarget);

  // which tab is active
  const [active, setActive] = useState<"Foto's" | "Video's" | "Audio" | "Documenten" | "Messages" | "">("");

  // overlay data + indices
  const [photos, setPhotos] = useState<MediaItem[] | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const [videos, setVideos] = useState<MediaItem[] | null>(null);
  const [videoIndex, setVideoIndex] = useState(0);

  const [audios, setAudios] = useState<MediaItem[] | null>(null);
  const [audioIndex, setAudioIndex] = useState(0);

  const [docs, setDocs] = useState<DocumentItem[] | null>(null);
  const [docIndex, setDocIndex] = useState(0);

  const [messages, setMessages] = useState<Message[] | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);

  // load rooms
  useEffect(() => {
    if (!starId) return;
    setLoading(true);
    api.get<ThreeDRoom[]>(`/stars/${starId}/three-d-rooms`)
      .then(r => setRooms(r.data))
      .catch(() => setError("Failed to load 3D rooms"))
      .finally(() => setLoading(false));
  }, [starId]);

  // fetch overlay data on tab change
  useEffect(() => {
    if (!active || !rooms?.length) {
      setPhotos(null); setVideos(null); setAudios(null);
      setDocs(null); setMessages(null);
      return;
    }
    const roomId = rooms[0]._id;
    const base = `/stars/${starId}/three-d-rooms/${roomId}`;

    if (active === "Foto's") {
      setPhotoIndex(0);
      api.get<MediaItem[]>(`${base}/photos`).then(r => setPhotos(r.data)).catch(() => setPhotos([]));
    }
    if (active === "Video's") {
      setVideoIndex(0);
      api.get<MediaItem[]>(`${base}/videos`).then(r => setVideos(r.data)).catch(() => setVideos([]));
    }
    if (active === "Audio") {
      setAudioIndex(0);
      api.get<MediaItem[]>(`${base}/audios`).then(r => setAudios(r.data)).catch(() => setAudios([]));
    }
    if (active === "Documenten") {
      setDocIndex(0);
      api.get<DocumentItem[]>(`${base}/documents`).then(r => setDocs(r.data)).catch(() => setDocs([]));
    }
    if (active === "Messages") {
      setMsgIndex(0);
      api.get<Message[]>(`${base}/messages`).then(r => setMessages(r.data)).catch(() => setMessages([]));
    }
  }, [active, rooms, starId]);

  // loading / error / empty states
  if (loading) return <Overlay text="Loading…" />;
  if (error)   return <Overlay text={error} error />;
  if (!rooms?.length) return <Overlay text="No basic room available." />;

  const views = [
    { label: "Foto's"     as const, pos:[12, 9, -2], target: [0,3,0] },
    { label: "Video's"    as const, pos:[14,10,-2], target: [0,3,0] },
    { label: "Audio"      as const, pos:[10,10,7],  target: [0,3,0] },
    { label: "Documenten" as const, pos:[ 7, 5,-2], target: [0,3,0] },
    { label: "Messages"   as const, pos:[1.5,10,0], target: [0,3,0] },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Back */}
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* Tabs */}
      <View style={styles.buttons}>
        {views.map(v => {
          const isActive = active === v.label;
          return (
            <TouchableOpacity
              key={v.label}
              style={[styles.button, isActive && styles.buttonActive]}
              onPress={() => {
                if (active === v.label) {
                  setActive(""); setCamPos(initialPos); setCamTarget(initialTarget);
                } else {
                  setActive(v.label); setCamPos(v.pos); setCamTarget(v.target);
                }
              }}
            >
              <Text style={[styles.buttonText, isActive && styles.buttonTextActive]}>
                {v.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3D view */}
      <PublicBasicRoomGL
        initialCameraPosition={camPos}
        initialCameraTarget={camTarget}
      />

      {/* Overlay modal */}
      <Modal visible={!!active} transparent animationType="fade">
        <View style={styles.overlay}>

          {/* Photos */}
          {active === "Foto's" && (
            photos?.length
              ? <SingleViewer
                  uri={photos[photoIndex].url}
                  index={photoIndex}
                  length={photos.length}
                  onPrev={() => setPhotoIndex(i => Math.max(i-1,0))}
                  onNext={() => setPhotoIndex(i => Math.min(i+1,photos.length-1))}
                  Content={({uri}) => <Image source={{uri}} style={styles.photoFull} resizeMode="contain"/>}
                />
              : <Text style={styles.info}>No photos available.</Text>
          )}

          {/* Videos */}
          {active === "Video's" && (
            videos?.length
              ? <SingleViewer
                  uri={videos[videoIndex].url}
                  index={videoIndex}
                  length={videos.length}
                  onPrev={() => setVideoIndex(i => Math.max(i-1,0))}
                  onNext={() => setVideoIndex(i => Math.min(i+1,videos.length-1))}
                  Content={({uri}) => (
                    <Video source={{uri}} style={styles.photoFull}
                      shouldPlay={false} useNativeControls resizeMode="contain"/>
                  )}
                />
              : <Text style={styles.info}>No videos available.</Text>
          )}

          {/* Audio */}
          {active === "Audio" && (
            audios?.length
              ? <SingleViewer
                  uri={audios[audioIndex].url}
                  index={audioIndex}
                  length={audios.length}
                  onPrev={() => setAudioIndex(i => Math.max(i-1,0))}
                  onNext={() => setAudioIndex(i => Math.min(i+1,audios.length-1))}
                  Content={({uri}) => <AudioRow url={uri}/>}
                />
              : <Text style={styles.info}>No audio files available.</Text>
          )}

          {/* Documents */}
          {active === "Documenten" && (
            docs?.length
              ? <View style={styles.docContainer}>
                  <Text style={styles.docName}>{docs[docIndex].originalName}</Text>
                  <View style={styles.photoNav}>
                    <TouchableOpacity
                      onPress={() => setDocIndex(i => Math.max(i-1,0))}
                      disabled={docIndex===0}
                      style={[styles.navButton, docIndex===0 && styles.navDisabled]}
                    ><ArrowLeft width={44} height={44}/></TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => Linking.openURL(docs[docIndex].url)}
                      style={styles.openButton}
                    ><Text style={styles.openButtonText}>Open PDF</Text></TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setDocIndex(i => Math.min(i+1,docs.length-1))}
                      disabled={docIndex===docs.length-1}
                      style={[styles.navButton2, docIndex===docs.length-1 && styles.navDisabled]}
                    ><ArrowRight width={44} height={44}/></TouchableOpacity>
                  </View>
                </View>
              : <Text style={styles.info}>No documents available.</Text>
          )}

          {/* Messages */}
          {active === "Messages" && (
            messages?.length
              ? <SingleViewer
                  uri={messages[msgIndex].message}
                  index={msgIndex}
                  length={messages.length}
                  onPrev={() => setMsgIndex(i => Math.max(i-1,0))}
                  onNext={() => setMsgIndex(i => Math.min(i+1,messages.length-1))}
                  Content={({uri}) => <Text style={[styles.item,{textAlign:"center"}]}>{uri}</Text>}
                />
              : <Text style={styles.info}>No messages available.</Text>
          )}

          {/* Close × */}
          <TouchableOpacity
            style={styles.closeIconContainer}
            onPress={() => {
              setActive(""); setCamPos(initialPos); setCamTarget(initialTarget);
            }}
          >
            <Text style={styles.closeIcon}>×</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Reusable single‐item viewer with arrows
function SingleViewer({
  uri, index, length, onPrev, onNext, Content
}: {
  uri: string; index: number; length: number;
  onPrev: () => void; onNext: () => void;
  Content: React.FC<{ uri: string }>;
}) {
  return (
    <View style={styles.photoContainer}>
      <Content uri={uri}/>
      <View style={styles.photoNav}>
        <TouchableOpacity onPress={onPrev} disabled={index===0}
          style={[styles.navButton, index===0&&styles.navDisabled]}>
          <ArrowLeft width={44} height={44}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext} disabled={index===length-1}
          style={[styles.navButton2, index===length-1&&styles.navDisabled]}>
          <ArrowRight width={44} height={44}/>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Audio play/pause row
function AudioRow({ url }: { url: string }) {
  const [sound, setSound] = useState<Audio.Sound|null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = async () => {
    if (!sound) {
      const s = new Audio.Sound();
      try {
        await s.loadAsync({ uri: url });
        await s.playAsync();
        setSound(s); setPlaying(true);
      } catch { s && s.unloadAsync(); }
    } else {
      playing ? await sound.pauseAsync() : await sound.playAsync();
      setPlaying(!playing);
    }
  };

  useEffect(() => () => { sound && sound.unloadAsync() }, [sound]);

  return (
    <TouchableOpacity onPress={toggle} style={styles.audioRow}>
      <Text style={styles.item}>
        {playing ? "⏸ Pause audio" : "▶️ Play audio"}
      </Text>
    </TouchableOpacity>
  );
}

const Overlay = ({ text, error }: { text: string; error?: boolean }) => (
  <View style={styles.centered}>
    <Text style={error ? styles.error : styles.info}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:"#000" },
  back: { position:"absolute", top:40,left:20,zIndex:10, padding:8, backgroundColor:"rgba(0,0,0,0.6)", borderRadius:4 },
  backText:{ color:"#fff", fontSize:16 },
  centered:{ flex:1,justifyContent:"center",alignItems:"center" },
  info:{ color:"#fff", fontSize:18, position: "absolute", top: 150, textAlign: "center", width: "80%" },
  error:{ color:"red", fontSize:18 },

  buttons:{ position:"absolute", bottom:200,left:20,width:120,zIndex:10 },
  button:{ backgroundColor:"#11152A", padding:8,borderRadius:4,marginVertical:4 },
  buttonActive:{ backgroundColor:"yellow" },
  buttonText:{ color:"#fff", fontSize:14 },
  buttonTextActive:{ color:"#000" },

  overlay:{ flex:1, backgroundColor:"rgba(0,0,0,0.85)", padding:20 },
  title:{ color:"#fff", fontSize:24, marginBottom:12 },

  photoContainer:{ flex:1, justifyContent:"center",alignItems:"center" },
  photoFull:{ width:"100%", height:500, marginBottom:12 },
  photoNav:{ flexDirection:"row", justifyContent:"space-between", width:"100%" },
  navButton:{ flex:1, alignItems:"flex-end" },
  navButton2:{ flex:1, alignItems:"flex-start" },
  navDisabled:{ opacity:0.3 },

  docContainer:{ flex:1, justifyContent:"center",alignItems:"center",paddingHorizontal:20 },
  docName:{ color:"#fff", fontSize:20, marginBottom:12, textAlign:"center" },
  openButton:{ flex:1, backgroundColor:"#444", paddingVertical:12, marginHorizontal:8, borderRadius:4, alignItems:"center" },
  openButtonText:{ color:"#fff", fontSize:16 },

  audioRow:{ paddingVertical:8, borderBottomWidth:1, borderBottomColor:"#333" },
  item:{ color:"#fff", fontSize:18, marginVertical:4 },

  closeIconContainer:{ position:"absolute", top:150, right:20, width:32, height:32, borderRadius:16, backgroundColor:"rgba(255,255,255,0.2)", alignItems:"center", justifyContent:"center" },
  closeIcon:{ color:"#fff", fontSize:24, lineHeight:24, textAlign:"center" },
});