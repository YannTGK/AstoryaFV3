import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useAudio } from "./audioProvider";
import AudioPlayer from "@/app/(app)/my-stars/private-star/audios/components/AudioPlayer";
import { Entypo } from "@expo/vector-icons";
import PlusIcon from "@/assets/images/svg-icons/plus.svg";
import DeleteIcon from "@/assets/images/svg-icons/delete.svg";
import DownloadIcon from "@/assets/images/svg-icons/download.svg";

interface AudioItem {
  uri: string;
  title: string;
  description: string;
  to: string;
  date: string;
}

export default function AudioListScreen() {
  const { audios = [], removeAudio } = useAudio();
  const router = useRouter();
  const [menuOpenIndex, setMenuOpenIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [audioToDeleteIndex, setAudioToDeleteIndex] = useState<number | null>(null);

  const handleDelete = () => {
    if (audioToDeleteIndex !== null && typeof removeAudio === 'function') {
      removeAudio(audioToDeleteIndex);
      setAudioToDeleteIndex(null);
      setMenuOpenIndex(null);
    }
    setShowModal(false);
  };

  const renderItem = ({ item, index }: { item: AudioItem; index: number }) => (
    <View style={styles.audioCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.audioTitle}>{item.title || "My story"}</Text>
          <Text style={styles.audioDate}>
            {new Date(item.date).toLocaleDateString("nl-BE", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setMenuOpenIndex(menuOpenIndex === index ? null : index)}>
          <Entypo name="dots-three-vertical" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <AudioPlayer uri={item.uri} />

      {menuOpenIndex === index && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setAudioToDeleteIndex(index);
              setShowModal(true);
            }}
          >
            <View style={styles.menuItemRow}>
              <DeleteIcon width={16} height={16} />
              <Text style={styles.menuText}>Delete</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => console.log("Download")}>
            <View style={styles.menuItemRow}>
              <DownloadIcon width={16} height={16} />
              <Text style={styles.menuText}>Download</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000", "#273166", "#000"]} style={StyleSheet.absoluteFill} />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M15 18l-6-6 6-6"
            stroke="#FEEDB6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>Audio</Text>

      <FlatList
        data={audios}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.plusWrapper}>
        <TouchableOpacity onPress={() => router.push("/(app)/my-stars/private-star/audios/upload-edit-audio")}>
          <PlusIcon width={50} height={50} />
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Are you sure you want to remove the audio?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.modalButton}>
                <Text style={[styles.modalButtonText, { color: "#3F64FF" }]}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.modalButton}>
                <Text style={[styles.modalButtonText, { color: "#3F64FF" }]}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  title: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 20,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
  listContent: {
    paddingTop: 32,
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
  plusWrapper: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  menu: {
    backgroundColor: "#fff",
    position: "absolute",
    top: 40,
    right: 16,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 20,
  },
  menuItem: {
    paddingVertical: 8,
  },
  menuItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuText: {
    fontSize: 14,
    fontFamily: "Alice-Regular",
    color: "#11152A",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: 280,
    alignItems: "center",
  },
  modalText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    borderTopWidth: 1,
    borderColor: "#E6E6E6",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
  },
});
