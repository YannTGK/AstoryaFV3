import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  PanResponder,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import PlayIcon from "@/assets/images/icons/play.svg";
import PauseIcon from "@/assets/images/icons/pause.svg";
import StopIcon from "@/assets/images/icons/stop-circle.svg";
import Svg, { Path } from "react-native-svg";

function formatTime(ms: number): string {
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
  const [barWidth, setBarWidth] = useState(0);

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
      const { sound: newSound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
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
      if (status.isLoaded) {
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (!sound || !duration || barWidth === 0) return;
        const x = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(x / barWidth, 1));
        const newPos = ratio * duration;
        sound.setPositionAsync(newPos);
        setPosition(newPos);
      },
      onPanResponderMove: (evt) => {
        if (!sound || !duration || barWidth === 0) return;
        const x = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(x / barWidth, 1));
        const newPos = ratio * duration;
        sound.setPositionAsync(newPos);
        setPosition(newPos);
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#000000", "#273166", "#000000"]} style={StyleSheet.absoluteFill} />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>

<TouchableOpacity style={styles.menuBtn} onPress={() => console.log("Menu opened")}>
  <Text style={styles.menuText}>⋮</Text>
</TouchableOpacity>

      <Text style={styles.title}>Audio</Text>

        <View style={styles.form}>
  <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
  <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
  <TextInput style={styles.input} placeholder="To: @username" value={to} onChangeText={setTo} />
</View>
      <ScrollView contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}>
  <View style={styles.playerBox}>
          <Text style={styles.audioFilename}>{name ?? "audio.mp3"}</Text>

          <View
            style={styles.progressBar}
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
            {...panResponder.panHandlers}
          >
            <View style={[styles.progressFill, { width: `${(position / duration) * 100}%` }]} />
            <View style={[styles.progressThumb, { left: `${(position / duration) * 100}%` }]} />
          </View>

          <Text style={styles.timestamp}>{formatTime(position)} / {formatTime(duration)}</Text>

          <View style={styles.controlsContainer}>
            <TouchableOpacity onPress={loadAndPlay}>
              {isPlaying ? <PauseIcon width={24} height={24} /> : <PlayIcon width={24} height={24} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { if (sound) { sound.stopAsync(); setIsPlaying(false); } }}>
              <StopIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.addBtn}>
        <Text style={styles.addText}>Add</Text>
      </TouchableOpacity>
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
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    fontFamily: "Alice-Regular",
  },
  menuBtn: {
  position: "absolute",
  top: 100,
  right: 20,
  zIndex: 10,
},
menuText: {
  color: "#fff",
  fontSize: 32,
},

  form: {
    marginTop: 80,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  audioFilename: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  timestamp: {
    color: "#fff",
    fontSize: 14,
    marginVertical: 8,
  },
  playerBox: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  progressBar: {
    width: "90%",
    height: 14,
    backgroundColor: "#999",
    borderRadius: 7,
    overflow: "hidden",
    marginTop: 8,
    position: "relative",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FEEDB6",
  },
  progressThumb: {
    position: "absolute",
    top: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FEEDB6",
    transform: [{ translateX: -10 }],
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
  addBtn: {
    position: "absolute",
    bottom: 110,
    left: 20,
    right: 20,
    backgroundColor: "#ccc",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    zIndex: 10,
  },
  addText: {
    fontSize: 16,
    color: "#333",
  },
});
