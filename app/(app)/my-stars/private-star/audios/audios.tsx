// app/(app)/my-stars/private-star/audios/AudioScreen.tsx
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

type AudioItem = {
  _id: string;
  title: string;
  url: string;
  addedAt: string;
};

export default function AudioScreen() {
  const router = useRouter();
  const { starId, id } = useLocalSearchParams<{ starId?: string; id?: string }>();
  // soms ontvang je de param als `id` in plaats van `starId`
  const realStarId = starId ?? id;

  const [audios, setAudios] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  // ① Lijst ophalen
  useEffect(() => {
    if (!realStarId) {
      Alert.alert("Fout", "Geen starId meegegeven");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const resp = await api.get<AudioItem[]>(`/stars/${realStarId}/audios`);
        setAudios(resp.data);
      } catch (err) {
        console.error(err);
        Alert.alert("Fout", "Kon audio's niet ophalen.");
      } finally {
        setLoading(false);
      }
    })();
  }, [realStarId]);

  // ② Verwijderen
  const handleDelete = async () => {
    if (deletingIndex === null) return;
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

  // ③ Download
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

  // ④ Upload vanuit bestand
  const handleUploadAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "audio/*" });
    if (result.type !== "success") return;
    const { uri, name } = result.assets[0];
    router.push({
      pathname: "/(app)/my-stars/private-star/audios/upload-edit-audio",
      params: { uri, name, starId: realStarId },
    });
  };

  // ⑤ Item renderen
  const renderItem = ({ item, index }: { item: AudioItem; index: number }) => (
    <View style={styles.audioCard}>
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
        <TouchableOpacity
          onPress={() => setMenuOpenIndex(menuOpenIndex === index ? null : index)}
        >
          <Entypo name="dots-three-vertical" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <AudioPlayer uri={item.url} />

      {menuOpenIndex === index && (
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
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleDownload(item.url, item.title)}
          >
            <DownloadIcon width={16} height={16} />
            <Text style={styles.menuText}>Download</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
      <LinearGradient
        colors={["#000", "#273166", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24}>
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Audio</Text>

      <TouchableOpacity style={styles.uploadBtn} onPress={handleUploadAudio}>
        <UploadIcon width={34} height={34} />
      </TouchableOpacity>

      {audios.length === 0 ? (
        <View style={styles.centerContent}>
          <HeadphoneIcon width={132} height={132} />
          <Text style={styles.emptyText}>
            No audio memories here…{"\n"}yet!
          </Text>
        </View>
      ) : (
        <FlatList
          data={audios}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.plusWrapper}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(app)/my-stars/private-star/audios/record-audio",
              params: { starId: realStarId },
            })
          }
        >
          <PlusIcon width={50} height={50} />
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              Are you sure you want to remove the audio?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
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
  title: {
    textAlign: "center",
    marginTop: 70,
    paddingBottom: 30,
    fontSize: 20,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
  uploadBtn: {
    position: "absolute",
    top: 70,
    right: 16,
    zIndex: 10,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 20,
    textAlign: "center",
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#fff",
    lineHeight: 22,
  },
  plusWrapper: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  listContent: {
    paddingTop: 30,
    paddingHorizontal: 16,
    paddingBottom: 240,
  },
  audioCard: {
    backgroundColor: "#1A1F3D",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  audioTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
  audioDate: {
    color: "#CFCFCF",
    fontSize: 12,
    fontFamily: "Alice-Regular",
    marginTop: 2,
  },
  menu: {
    backgroundColor: "#fff",
    position: "absolute",
    top: 40,
    right: 16,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  menuText: {
    marginLeft: 8,
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#11152A",
  },
  listContent: {
    paddingTop: 30,
    paddingHorizontal: 16,
    paddingBottom: 240,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: 280,
    alignItems: "center",
  },
  modalText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#3F64FF",
  },
});