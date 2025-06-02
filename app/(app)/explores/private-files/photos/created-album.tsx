/* /(app)/dedicates/created-dedicates/photos/created-album.tsx */
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image, FlatList,
  Modal, ActivityIndicator, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import ImageViewer from "react-native-image-zoom-viewer";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem   from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

import DownloadIcon   from "@/assets/images/svg-icons/download-white.svg";
import NoPictureIcon  from "@/assets/images/svg-icons/no-picture.svg";
import StarLoader     from "@/components/loaders/StarLoader";
import api            from "@/services/api";

type Photo = { _id: string; url: string };

export default function AlbumPage() {
  /* ───────── params & state ───────── */
  const router = useRouter();
  const { id, albumId, albumName } =
    useLocalSearchParams<{ id: string; albumId: string; albumName: string }>();

  const [images, setImages]       = useState<Photo[]>([]);
  const [loading, setLoading]     = useState(true);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIdx, setViewerIdx]   = useState(0);

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected]     = useState<string[]>([]);
  const isSel = (pid: string) => selected.includes(pid);

  /* loader overlay */
  const [downloading, setDownloading] = useState(false);
  const [dlProgress,  setDlProgress]  = useState(0);     // 0-100

  /* ───────── fetch ───────── */
  const fetchPhotos = async () => {
    if (!id || !albumId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/stars/${id}/photo-albums/${albumId}/photos`);
      setImages(data as Photo[]);
    } catch { Alert.alert("Error", "Could not load photos."); }
    finally   { setLoading(false); }
  };
  useEffect(() => { fetchPhotos(); }, [id, albumId]);

  useFocusEffect(useCallback(() => {
    setSelectMode(false); setSelected([]); fetchPhotos();
  }, [id, albumId]));

  /* ───────── download flow ───────── */
  const handleDownloadPress = () => {
    if (!selectMode) { setSelectMode(true); return; }
    if (!selected.length) { Alert.alert("No photos selected"); return; }

    Alert.alert(
      "Download photos",
      `Download ${selected.length} photo${selected.length !== 1 ? "s" : ""} to your gallery?`,
      [{ text:"Cancel", style:"cancel" },
       { text:"Download", onPress: downloadSelected }]
    );
  };

  const downloadSelected = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission denied"); return; }

    setDownloading(true); setDlProgress(0);

    for (let i = 0; i < selected.length; i++) {
      const pid   = selected[i];
      const photo = images.find(p => p._id === pid);
      if (!photo) continue;

      const to = FileSystem.documentDirectory + pid + ".jpg";
      try {
        const dl = await FileSystem.downloadAsync(photo.url, to);
        await MediaLibrary.saveToLibraryAsync(dl.uri);
      } catch (e) { console.warn("DL error", e); }

      setDlProgress(Math.round(((i + 1) / selected.length) * 100));
    }

    setDownloading(false);
    Alert.alert("Done", `${selected.length} file${selected.length !== 1 ? "s" : ""} saved.`);
    setSelectMode(false); setSelected([]);
  };

  /* ───────── UI ───────── */
  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FEEDB6" /></View>;
  }

  const viewerData = images.map(p => ({ url: p.url }));

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      {/* album title + download */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding:4 }}>
          <Svg width={24} height={24}><Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2}/></Svg>
        </TouchableOpacity>
        <Text style={styles.albumTitle}>{decodeURIComponent(albumName)}</Text>
        <TouchableOpacity onPress={handleDownloadPress} style={{ padding:8 }}>
          <DownloadIcon width={22} height={22} />
        </TouchableOpacity>
      </View>

      {/* grid */}
      <FlatList
        data={images}
        keyExtractor={i => i._id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item, index }) => {
          const first = index % 3 === 0;
          return (
            <TouchableOpacity onPress={() => {
              if (selectMode) {
                setSelected(s => isSel(item._id) ? s.filter(x => x!==item._id) : [...s,item._id]);
              } else { setViewerIdx(index); setViewerOpen(true); }
            }}>
              <View style={{ position:"relative" }}>
                <Image
                  source={{ uri: item.url }}
                  style={[
                    styles.thumb,
                    { marginLeft:first?16:8, marginRight:8,
                      opacity: selectMode && !isSel(item._id) ? 0.6 : 1 }
                  ]}
                />
                {selectMode && (
                  <View style={[styles.check, isSel(item._id) && styles.checkActive]} />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <NoPictureIcon width={130} height={130}/>
            <Text style={styles.emptyText}>No photos yet.</Text>
          </View>}
      />

      {/* bottom bar */}
      {selectMode && selected.length > 0 && (
        <TouchableOpacity style={styles.bar} onPress={handleDownloadPress}>
          <Text style={styles.barText}>
            Download {selected.length} photo{selected.length !== 1 ? "s" : ""}
          </Text>
        </TouchableOpacity>
      )}

      {/* viewer */}
      <Modal visible={viewerOpen} transparent>
        <ImageViewer
          imageUrls={viewerData}
          index={viewerIdx}
          enableSwipeDown
          onSwipeDown={() => setViewerOpen(false)}
          onCancel={() => setViewerOpen(false)}
        />
        <TouchableOpacity style={styles.close} onPress={() => setViewerOpen(false)}>
          <Text style={{ color:"#fff", fontSize:32 }}>×</Text>
        </TouchableOpacity>
      </Modal>

      {/* star-loader overlay */}
      {downloading && (
        <View style={styles.loaderOverlay}>
          <StarLoader progress={dlProgress} />
        </View>
      )}
    </View>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  center:{ flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"#000" },

  header:{ flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:16,marginTop:50 },
  title:{ color:"#fff",fontSize:20,fontFamily:"Alice-Regular" },

  albumRow:{ flexDirection:"row",alignItems:"center",justifyContent:"center",marginTop:28,marginHorizontal:20 },
  albumTitle:{ flex:1,color:"#fff",fontSize:20,fontFamily:"Alice-Regular",textAlign:"center" },

  grid:{ paddingTop:68,paddingBottom:180 },
  thumb:{ width:109,height:109,borderRadius:8,marginBottom:16 },
  check:{ position:"absolute",top:6,right:12,width:18,height:18,borderRadius:9,borderWidth:2,borderColor:"#fff" },
  checkActive:{ backgroundColor:"#FEEDB6" },

  empty:{ flex:1,justifyContent:"center",alignItems:"center",minHeight:400 },
  emptyText:{ marginTop:16,color:"#fff",fontFamily:"Alice-Regular",textAlign:"center" },

  bar:{ position:"absolute",bottom:80,left:0,right:0,backgroundColor:"#11152A",padding:22,alignItems:"center" },
  barText:{ color:"#fff",fontSize:16,fontFamily:"Alice-Regular" },

  close:{ position:"absolute",top:72,right:20 },

  loaderOverlay:{ position:"absolute",top:0,left:0,right:0,bottom:0,backgroundColor:"rgba(0,0,0,0.85)",justifyContent:"center",alignItems:"center",zIndex:50 },
});