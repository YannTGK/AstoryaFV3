// app/(app)/my-stars/private-star/audios/upload-edit-audio/EditAudioScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  PanResponder,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import Svg, { Path } from "react-native-svg";
import PlayIcon from "@/assets/images/icons/play.svg";
import PauseIcon from "@/assets/images/icons/pause.svg";
import StopIcon from "@/assets/images/icons/stop-circle.svg";
import UserPlusIcon from "@/assets/images/svg-icons/add-people.svg";
import UserIcon from "@/assets/images/svg-icons/see-members.svg";
import api from "@/services/api";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export default function UploadEditAudioScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    uri: string;
    name?: string;
    starId?: string;
    id?: string;
  }>();
  const rawUri = params.uri;
  const name = params.name;
  const realStarId = params.starId ?? params.id;
  const uri = typeof rawUri === "string" ? rawUri : "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    // audio-mode
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const loadAndPlay = async () => {
    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (!status.isLoaded) return;
          setPosition(status.positionMillis);
          setDuration(status.durationMillis || 1);
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      );
      setSound(newSound);
      setIsPlaying(true);
    } else {
      const st = await sound.getStatusAsync();
      if (!st.isLoaded) return;
      if (st.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (!sound || !duration || !barWidth) return;
        const x = evt.nativeEvent.locationX;
        const ratio = Math.min(Math.max(x / barWidth, 0), 1);
        const newPos = ratio * duration;
        sound.setPositionAsync(newPos);
        setPosition(newPos);
      },
      onPanResponderMove: (evt) => {
        if (!sound || !duration || !barWidth) return;
        const x = evt.nativeEvent.locationX;
        const ratio = Math.min(Math.max(x / barWidth, 0), 1);
        const newPos = ratio * duration;
        sound.setPositionAsync(newPos);
        setPosition(newPos);
      },
    })
  ).current;

  const handleUpload = async () => {
    if (!realStarId) {
      Alert.alert("Fout", "Geen starId meegegeven.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Vul een titel in");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("audio", {
        uri,
        name: name || "recording.m4a",
        type: "audio/m4a",
      } as any);
      fd.append("title", title);
      fd.append("description", description || "");
      // canView / canEdit niet nodig nu

      await api.post(`/stars/${realStarId}/audios/upload`, fd);
      Alert.alert("Succes", "Audio geüpload!");
      router.replace({
        pathname: "/(app)/my-stars/private-star/audios/audios",
        params: { starId: realStarId },
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Fout", "Upload mislukt.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Back */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
      >
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

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        <Text style={styles.title}>Audio</Text>
        { /* form */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Description"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
          <TextInput
            style={styles.input}
            placeholder="To: @username"
            placeholderTextColor="#999"
            value={""} // voorlopig leeg, niet gebruikt
            onChangeText={() => {}}
          />
        </View>
        {/* player */}
        <View style={styles.playerBox}>
          <Text style={styles.audioFilename}>
            {title || name || "audio.mp3"}
          </Text>
          <View
            style={styles.progressBar}
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
            {...panResponder.panHandlers}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${(position / duration) * 100}%` },
              ]}
            />
            <View
              style={[
                styles.progressThumb,
                { left: `${(position / duration) * 100}%` },
              ]}
            />
          </View>
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
                sound?.stopAsync();
                setIsPlaying(false);
              }}
              style={{ marginLeft: 30 }}
            >
              <StopIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>

        

        <TouchableOpacity
          style={[styles.addBtn, title.trim() && styles.addBtnActive]}
          disabled={!title.trim()}
          onPress={handleUpload}
        >
          <Text
            style={[
              styles.addText,
              title.trim() && styles.addTextActive,
            ]}
          >
            Upload
          </Text>
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
    textAlign: "center",
    marginTop: 80,
    fontSize: 20,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
  playerBox: {
    alignItems: "center",
    marginTop: 20,
  },
  audioFilename: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Alice-Regular",
  },
  progressBar: {
    width: "90%",
    height: 16,
    backgroundColor: "#999",
    borderRadius: 7,
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FEEDB6",
  },
  progressThumb: {
    position: "absolute",
    top: -52,
    width: 20,
    height: 20,
    borderRadius: 8,
    backgroundColor: "#FEEDB6",
    transform: [{ translateX: -10 }],
  },
  timestamp: {
    color: "#fff",
    fontSize: 16,
    marginVertical: 8,
    fontFamily: "Alice-Regular",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 30,
    alignItems: "center",
    backgroundColor: "#FEEDB6",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 40,
    marginTop: 16,
  },
  form: {
    marginTop: 30,
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
  descriptionInput: {
    height: 100,
    textAlignVertical: "top",
  },
  addBtn: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#ccc",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtnActive: {
    backgroundColor: "#FEEDB6",
  },
  addText: {
    fontSize: 18,
    color: "#333",
    fontFamily: "Alice-Regular",
  },
  addTextActive: {
    color: "#11152A",
    fontWeight: "600",
  },
});