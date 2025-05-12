import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { useAudio } from "@/app/(app)/my-stars/private-star/audios/audioProvider"; // Dit is de correcte import
import PlayIcon from "@/assets/images/icons/play.svg";

// Optioneel: type voor audio-item
interface AudioItem {
  uri: string;
  title: string;
  description: string;
  to: string;
  date: string;
}

export default function AudioListScreen() {
  const { audios = [] } = useAudio(); // fallback naar lege lijst indien undefined
  const router = useRouter();

  const renderItem = ({ item }: { item: AudioItem }) => (
    <View style={styles.audioBox}>
      <Text style={styles.audioTitle}>{item.title || "My story"}</Text>
      <Text style={styles.audioDate}>
        {new Date(item.date).toLocaleDateString("nl-BE", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </Text>

      <View style={styles.player}>
        <Text style={styles.duration}>0:00</Text>
        <TouchableOpacity>
          <PlayIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.duration}>10:50</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Audio</Text>

      <FlatList
        data={audios}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 140 }}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          router.push("/(app)/my-stars/private-star/audios/upload-edit-audio")
        }
      >
        <Text style={styles.plus}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#11152A",
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Alice-Regular",
    textAlign: "center",
    marginBottom: 20,
  },
  audioBox: {
    backgroundColor: "#1A1F3D",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  audioTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
  audioDate: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 8,
    fontFamily: "Alice-Regular",
  },
  player: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  duration: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Alice-Regular",
  },
  addButton: {
    position: "absolute",
    bottom: 32,
    left: "50%",
    transform: [{ translateX: -28 }],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FEEDB6",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 4,
  },
  plus: {
    fontSize: 32,
    color: "#11152A",
    marginTop: -4,
  },
});
