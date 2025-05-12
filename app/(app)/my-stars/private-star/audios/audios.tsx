import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useAudio } from "./audioProvider";
import AudioPlayer from "@/app/(app)/my-stars/private-star/audios/components/AudioPlayer";
import { Entypo } from "@expo/vector-icons";
import PlusIcon from "@/assets/images/svg-icons/plus.svg";

interface AudioItem {
  uri: string;
  title: string;
  description: string;
  to: string;
  date: string;
}

export default function AudioListScreen() {
  const { audios = [] } = useAudio();
  const router = useRouter();

  const renderItem = ({ item }: { item: AudioItem }) => (
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
        <TouchableOpacity onPress={() => console.log("Menu opened")}>
          <Entypo name="dots-three-vertical" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <AudioPlayer uri={item.uri} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000", "#273166", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Back Button */}
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

      {/* Start-knop */}

      {/* Plus-knop */}
      <View style={styles.plusWrapper}>
        <TouchableOpacity
          onPress={() =>
            router.push("/(app)/my-stars/private-star/audios/upload-edit-audio")
          }
        >
          <PlusIcon width={50} height={50} />
        </TouchableOpacity>
      </View>
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
    paddingBottom: 240, // genoeg ruimte voor buttons onderaan
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
});
