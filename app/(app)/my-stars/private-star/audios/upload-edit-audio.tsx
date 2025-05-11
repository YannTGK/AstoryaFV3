import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  PanResponder,
  GestureResponderEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import PlayIcon from "@/assets/images/icons/play.svg";
import PauseIcon from "@/assets/images/icons/pause.svg";
import StopIcon from "@/assets/images/icons/stop-circle.svg";

const { width: screenWidth } = Dimensions.get("window");

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export default function EditAudioScreen() {
  const router = useRouter();
  const { uri: rawUri, name } = useLocalSearchParams();
  const uri = typeof rawUri === "string" ? rawUri : rawUri?.[0] ?? "";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [to, setTo] = useState("");
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  const loadAndPlay = async () => {
    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        setPosition(status.positionMillis);
        setDuration(status.durationMillis || 1);
        setIsPlaying(status.isPlaying);
      });
    } else {
      const status = await sound.getStatusAsync();
      if ('isLoaded' in status && status.isLoaded) {
        if (status.isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    }
  };

  const seekAudio = async (event: GestureResponderEvent) => {
    if (!sound) return;
    const { locationX } = event.nativeEvent;
    const percent = locationX / (screenWidth * 0.9);
    const newPosition = percent * duration;
    await sound.setPositionAsync(newPosition);
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={{ color: "#FEEDB6", fontSize: 24 }}>{"<"}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Audio</Text>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Title: Give the audio a title."
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Description: Write a small description."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={styles.input}
            placeholder="To: @username"
            placeholderTextColor="#999"
            value={to}
            onChangeText={setTo}
          />
        </View>

        <View style={styles.playerBox}>
          <Text style={styles.audioFilename}>{name ?? "audio.mp3"}</Text>
          <Text style={styles.timestamp}>00:00 / 00:30</Text>

          <TouchableOpacity onPress={seekAudio} style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(position / duration) * 100}%` },
              ]}
            />
          </TouchableOpacity>

          <Text style={styles.timestamp}>
            {formatTime(position)} / {formatTime(duration)}
          </Text>

          <View style={styles.controlsContainer}>
            <TouchableOpacity onPress={loadAndPlay}>
              {isPlaying ? (
                <PauseIcon width={24} height={24} />
              ) : (
                <PlayIcon width={24} height={24} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (sound) {
                  sound.stopAsync();
                  setIsPlaying(false);
                }
              }}
              style={{ marginLeft: 20 }}
            >
              <StopIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </ScrollView>
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
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  form: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    fontFamily: "Alice-Regular",
  },
  audioFilename: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Alice-Regular",
    marginBottom: 8,
  },
  timestamp: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Alice-Regular",
    marginBottom: 16,
  },
  playerBox: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FEEDB6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 40,
    marginTop: 16,
  },
  progressBar: {
    width: "90%",
    height: 6,
    backgroundColor: "#999",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: {
    height: 6,
    backgroundColor: "#FEEDB6",
  },
  addBtn: {
    backgroundColor: "#ccc",
    paddingVertical: 16,
    margin: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  addText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
    color: "#333",
  },
});