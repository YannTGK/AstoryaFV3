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
  Modal,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";

import PlusCircle from "@/assets/images/svg-icons/plus-circle.svg";
import PlusSquare from "@/assets/images/svg-icons/plus-square.svg";
import PlusLetter from "@/assets/images/svg-icons/plus-letter.svg";
import AudioIcon from "@/assets/images/svg-icons/audio-line.svg";
import PdfIcon from "@/assets/images/svg-icons/pdf-image.svg";
import WordIcon from "@/assets/images/svg-icons/word-image.svg";
import EditIcon from "@/assets/images/svg-icons/edit2.svg";

const { width } = Dimensions.get("window");

export default function AddContentSpace() {
  const router = useRouter();
  const { starId, roomId } = useLocalSearchParams<{
    starId?: string;
    roomId?: string;
  }>();

  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [audios, setAudios] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);

  const [showAudioPopup, setShowAudioPopup] = useState(false);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [showPhotoPopup, setShowPhotoPopup] = useState(false);
  const [showDocumentPopup, setShowDocumentPopup] = useState(false);

  if (!starId || !roomId) {
    Alert.alert("Error", "Geen starId of roomId gevonden");
    router.back();
    return null;
  }

  // photo picker
  const pickPhotos = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!res.canceled) {
      setPhotos((prev) =>
        [...prev, ...res.assets.map((a) => a.uri)].slice(0, 10)
      );
    }
  };

  // video picker
  const pickVideos = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!res.canceled) {
      setVideos((prev) =>
        [...prev, ...res.assets.map((a) => a.uri)].slice(0, 3)
      );
    }
  };

  // audio picker
  const pickAudios = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      multiple: true,
    });
    if (!res.canceled && res.assets) {
      setAudios((prev) =>
        [...prev, ...res.assets.map((f) => f.uri)].slice(0, 3)
      );
    }
  };

  // document picker
  const pickDocs = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      multiple: true,
    });
    if (!res.canceled && res.assets) {
      setDocuments((prev) =>
        [...prev, ...res.assets.map((f) => f.uri)].slice(0, 3)
      );
    }
  };

  const handleNext = () => {
    // TODO: hier je API‐calls om de geselecteerde media naar je backend te sturen,
    // bvb. via FormData + axios naar `/stars/${starId}/three-d-rooms/${roomId}/media`
    // ...

    // en daarna navigeren naar SaveSpace
    router.push({
      pathname:
        "/(app)/my-stars/public-star/space/save-space",
      params: { starId, roomId },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Back */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() =>
          router.push({
            pathname:
              "/(app)/my-stars/public-star/space/save-space",
            params: { starId, roomId },
          })
        }
      >
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path
            d="M15 18l-6-6 6-6"
            stroke="#FEEDB6"
            strokeWidth={2}
          />
        </Svg>
      </TouchableOpacity>

      {/* Edit icon (bijv. bewerken metadata) */}
      <TouchableOpacity style={styles.editIcon} onPress={() => {}}>
        <EditIcon width={28} height={28} />
      </TouchableOpacity>

      <Text style={styles.title}>3D/VR – space</Text>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ───── PHOTOS ───── */}
        <View style={styles.item}>
          <Text style={styles.label}>Photos {photos.length}/10</Text>
          <View style={styles.row}>
            {photos.map((uri, i) => (
              <Image
                key={i}
                source={{ uri }}
                style={styles.mediaThumbnail}
              />
            ))}
            {photos.length < 10 && (
              <TouchableOpacity onPress={pickPhotos}>
                <PlusSquare width={60} height={60} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ───── VIDEOS ───── */}
        <View style={styles.item}>
          <Text style={styles.label}>Videos {videos.length}/3</Text>
          <View style={styles.row}>
            {videos.map((uri, i) => (
              <View key={i} style={styles.videoPlaceholder} />
            ))}
            {videos.length < 3 && (
              <TouchableOpacity onPress={pickVideos}>
                <PlusSquare width={60} height={60} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ───── AUDIOS ───── */}
        <View style={styles.item}>
          <Text style={styles.label}>Audios {audios.length}/3</Text>
          <View style={styles.row}>
            {audios.map((uri, i) => (
              <AudioIcon key={i} width={60} height={60} style={{ marginRight: 8 }} />
            ))}
            {audios.length < 3 && (
              <TouchableOpacity onPress={pickAudios}>
                <PlusCircle width={60} height={60} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ───── MESSAGES ───── */}
        <View style={styles.item}>
          <Text style={styles.label}>Messages 0/3</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname:
                  "/(app)/my-stars/public-star/space/add-message/write-message-space",
                params: { starId, roomId },
              })
            }
          >
            <PlusLetter width={80} height={80} />
          </TouchableOpacity>
        </View>

        {/* ───── DOCUMENTS ───── */}
        <View style={styles.item}>
          <Text style={styles.label}>Documents {documents.length}/3</Text>
          <View style={styles.row}>
            {documents.map((uri, i) => {
              const ext = uri.split(".").pop()?.toLowerCase();
              return (
                <View key={i} style={{ marginRight: 8 }}>
                  {ext === "pdf" && <PdfIcon width={60} height={60} />}
                  {(ext === "doc" || ext === "docx") && (
                    <WordIcon width={60} height={60} />
                  )}
                  {!["pdf", "doc", "docx"].includes(ext || "") && (
                    <View style={styles.docIcon} />
                  )}
                </View>
              );
            })}
            {documents.length < 3 && (
              <TouchableOpacity onPress={pickDocs}>
                <PlusSquare width={60} height={60} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  editIcon: { position: "absolute", top: 52, right: 20, zIndex: 10 },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  scrollContent: {
    paddingTop: 25,
    paddingBottom: 160,
    paddingHorizontal: 20,
  },
  item: { marginBottom: 24 },
  label: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
  },
  mediaThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  videoPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "#444",
    borderRadius: 8,
    marginRight: 8,
  },
  docIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#1166ff",
    borderRadius: 8,
  },
  buttonWrapper: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
  },
  button: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#FEEDB6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
    textAlign: "center",
    color: "#000",
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  popupBox: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  popupText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#11152A",
    textAlign: "center",
    marginBottom: 24,
  },
  popupButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    width: "100%",
  },
  popupButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  rightBorder: {
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  popupButtonTextYes: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#0A84FF",
  },
});