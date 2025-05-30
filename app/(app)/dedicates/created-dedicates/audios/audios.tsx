""// app/(app)/my-stars/private-star/audios/audios/AudioScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import AudioPlayer from "@/app/(app)/my-stars/private-star/audios/components/AudioPlayer";
import { Entypo } from "@expo/vector-icons";
import PlusIcon from "@/assets/images/svg-icons/plus.svg";
import DeleteIcon from "@/assets/images/svg-icons/delete.svg";
import DownloadIcon from "@/assets/images/svg-icons/download.svg";
import UploadIcon from "@/assets/images/icons/upload-cloud.svg";
import HeadphoneIcon from "@/assets/images/icons/no-audio.svg";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import api from "@/services/api";
import useAuthStore from "@/lib/store/useAuthStore";

type AudioItem = {
  _id: string;
  title: string;
  url: string;
  addedAt: string;
  canView?: string[];
  canEdit?: string[];
};

export default function AudioScreen() {
  const router = useRouter();
  const { starId, id } = useLocalSearchParams<{ starId?: string; id?: string }>();
  const realStarId = starId ?? id;
  const [audios, setAudios] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!realStarId) {
        Alert.alert("Fout", "Geen starId meegegeven");
        setLoading(false);
        return;
      }

      try {
        const { user } = useAuthStore.getState();
        const userId = user?._id;

        const starRes = await api.get(`/stars/${realStarId}`);
        const star = starRes.data.star || starRes.data;

        const isStarEditor = star.userId === userId || (star.canEdit || []).includes(userId);
        const starCanView = (star.canView || []).includes(userId);

        const audioRes = await api.get(`/stars/${realStarId}/audios`);
        const audios = audioRes.data || [];

        const hasAudioEdit = audios.some(audio => (audio.canEdit || []).includes(userId));
        const hasAudioView = audios.some(audio => (audio.canView || []).includes(userId));

        const onlyCanView = !isStarEditor && !hasAudioEdit && (starCanView || hasAudioView);
        const finalCanEdit = (isStarEditor || hasAudioEdit) && !onlyCanView;

        console.log("🔐 Rights", {
          userId,
          isStarEditor,
          starCanView,
          hasAudioEdit,
          hasAudioView,
          onlyCanView,
          finalCanEdit,
        });

        setAudios(audios);
        setCanEdit(finalCanEdit);
      } catch (err) {
        console.error(err);
        Alert.alert("Fout", "Kon audio's niet ophalen.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [realStarId]);

  const handleDelete = async () => {
    if (deletingIndex == null) return;
    const audio = audios[deletingIndex];
    try {
      await api.delete(`/stars/${realStarId}/audios/detail/${audio._id}`);
      setAudios(audios.filter((_, i) => i !== deletingIndex));
      setMenuOpenIndex(null);
      setDeletingIndex(null);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Fout", "Verwijderen is mislukt.");
    }
  };

  const handleDownload = async (url: string, title: string) => {
    try {
      const filename = `${title || "audio"}.m4a`;
      const path = FileSystem.documentDirectory + filename;
      await FileSystem.downloadAsync(url, path);
      Alert.alert("Success", "Audio lokaal opgeslagen.");
    } catch (err) {
      console.error(err);
      Alert.alert("Fout", "Download mislukt.");
    }
  };

  const handleUploadAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "audio/*" });
    if (result.type !== "success") return;
    const { uri, name } = result.assets[0];
    router.push({
      pathname: "/(app)/dedicates/created-dedicates/audios/upload-edit-audio",
      params: { uri, name, starId: realStarId },
    });
  };

  const renderItem = ({ item, index }: { item: AudioItem; index: number }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(app)/dedicates/created-dedicates/audios/upload-edit-audio",
          params: { id: item._id, starId: realStarId },
        })
      }
      style={styles.audioCard}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.audioTitle}>{item.title || "My story"}</Text>
          <Text style={styles.audioDate}>
            {new Date(item.addedAt).toLocaleDateString("nl-BE", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>
        {canEdit && (
          <TouchableOpacity onPress={() => setMenuOpenIndex(menuOpenIndex === index ? null : index)}>
            <Entypo name="dots-three-vertical" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <AudioPlayer uri={item.url} />

      {canEdit && menuOpenIndex === index && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setDeletingIndex(index);
              setShowModal(true);
            }}
          >
            <DeleteIcon width={16} height={16} />
            <Text style={styles.menuText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => handleDownload(item.url, item.title)}>
            <DownloadIcon width={16} height={16} />
            <Text style={styles.menuText}>Download</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#FEEDB6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Audio</Text>
      {canEdit && (
        <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadAudio}>
          <UploadIcon width={34} height={34} />
        </TouchableOpacity>
      )}

      {audios.length === 0 ? (
        <View style={styles.centerContent}>
          <HeadphoneIcon width={132} height={132} />
          <Text style={styles.emptyText}>No audio memories here…{"\n"}yet!</Text>
        </View>
      ) : (
        <FlatList
          data={audios}
          keyExtractor={i => i._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {canEdit && (
        <View style={styles.plusWrapper}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(app)/dedicates/created-dedicates/audios/record-audio",
                params: { starId: realStarId },
              })
            }
          >
            <PlusIcon width={50} height={50} />
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Weet je het zeker?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Nee</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Ja</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 75, left: 20, zIndex: 10 },
  title: { textAlign: "center", marginTop: 70, fontSize: 20, color: "#fff" },
  uploadBtn: { position: "absolute", top: 70, right: 16, zIndex: 10 },
  centerContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { marginTop: 20, color: "#fff", textAlign: "center" },
  plusWrapper: { position: "absolute", bottom: 100, width: "100%", alignItems: "center" },
  listContent: { paddingTop: 30, paddingHorizontal: 16, paddingBottom: 240 },
  audioCard: { backgroundColor: "#1A1F3D", borderRadius: 16, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  audioTitle: { color: "#fff", fontSize: 16 },
  audioDate: { color: "#CFCFCF", fontSize: 12 },
  menu: { backgroundColor: "#fff", position: "absolute", top: 40, right: 16, borderRadius: 8, padding: 8, zIndex: 20 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  menuText: { marginLeft: 8, color: "#11152A" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { backgroundColor: "#fff", padding: 20, borderRadius: 12, width: 280, alignItems: "center" },
  modalText: { marginBottom: 16 },
  modalActions: { flexDirection: "row", width: "100%" },
  modalButton: { flex: 1, paddingVertical: 12, alignItems: "center" },
  modalButtonText: { color: "#3F64FF" },
});
