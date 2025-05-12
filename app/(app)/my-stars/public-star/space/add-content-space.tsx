import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

import PlusCircle from "@/assets/images/svg-icons/plus-circle.svg";
import PlusSquare from "@/assets/images/svg-icons/plus-square.svg";
import PlusLetter from "@/assets/images/svg-icons/plus-letter.svg";

const { width } = Dimensions.get("window");

export default function AddContentSpace() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [audios, setAudios] = useState<string[]>([]);
  const [documents, setDocuments] = useState<string[]>([]);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 10));
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      const newVideos = result.assets.map((asset) => asset.uri);
      setVideos((prev) => [...prev, ...newVideos].slice(0, 3));
    }
  };

  const pickAudio = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      multiple: true,
    });
    if (!result.canceled && result.assets) {
      const newAudios = result.assets.map((file) => file.uri);
      setAudios((prev) => [...prev, ...newAudios].slice(0, 3));
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: true,
    });
    if (!result.canceled && result.assets) {
      const newDocs = result.assets.map((file) => file.uri);
      setDocuments((prev) => [...prev, ...newDocs].slice(0, 3));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Back-button */}
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

      <Text style={styles.title}>3D/VR - space</Text>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Photos */}
        <View style={styles.item}>
          <Text style={styles.label}>Photo’s {photos.length}/10</Text>
          <View style={styles.row}>
            {photos.map((uri, index) => (
              <Image key={index} source={{ uri }} style={styles.mediaThumbnail} />
            ))}
            {photos.length < 10 && (
              <TouchableOpacity onPress={pickPhoto}>
                <PlusSquare width={60} height={60} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Videos */}
        <View style={styles.item}>
          <Text style={styles.label}>Video’s {videos.length}/3</Text>
          <View style={styles.row}>
            {videos.map((uri, index) => (
              <View key={index} style={styles.videoPlaceholder} />
            ))}
            {videos.length < 3 && (
              <TouchableOpacity onPress={pickVideo}>
                <PlusSquare width={60} height={60} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Audios */}
        <View style={styles.item}>
          <Text style={styles.label}>Audio’s {audios.length}/3</Text>
          <View style={styles.row}>
            {audios.map((uri, index) => (
              <View key={index} style={styles.audioIcon} />
            ))}
            {audios.length < 3 && (
              <TouchableOpacity onPress={pickAudio}>
                <PlusCircle width={60} height={60} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Messages */}
        <View style={styles.item}>
          <Text style={styles.label}>Messages 0/3</Text>
          <PlusLetter width={80} height={80} />
        </View>

        {/* Documents */}
        <View style={styles.item}>
          <Text style={styles.label}>Documents {documents.length}/3</Text>
          <View style={styles.row}>
            {documents.map((uri, index) => (
              <View key={index} style={styles.docIcon} />
            ))}
            {documents.length < 3 && (
              <TouchableOpacity onPress={pickDocument}>
                <PlusSquare width={60} height={60} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Songs */}
        <View style={styles.item}>
          <Text style={styles.label}>Songs 0/3</Text>
          <PlusCircle width={60} height={60} />
        </View>
      </ScrollView>

      {/* Next button */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 40,
  },
  scrollContent: {
    paddingTop: 25,
    paddingBottom: 160,
    paddingHorizontal: 20,
  },
  item: {
    marginBottom: 24,
  },
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
  audioIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#7733aa",
    borderRadius: 30,
    marginRight: 8,
  },
  docIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#1166ff",
    borderRadius: 8,
    marginRight: 8,
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
});
