import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import Svg, { Rect } from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");

export default function EditAudioScreen() {
  const router = useRouter();
const { uri: rawUri, name } = useLocalSearchParams();
const uri = typeof rawUri === 'string' ? rawUri : rawUri?.[0] ?? '';
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [to, setTo] = useState("");
const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [peaks, setPeaks] = useState<number[]>([]);

  useEffect(() => {
    // Mock peaks for demonstration; replace with real waveform data
    const generatePeaks = () => {
      const count = 60;
      const values = Array.from({ length: count }, () => Math.random());
      setPeaks(values);
    };
    generatePeaks();
  }, []);

  const loadAndPlay = async () => {
    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      await newSound.playAsync();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={{ color: "#FEEDB6", fontSize: 24 }}>{"<"}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Audio</Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
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
  <View style={styles.controls}>
    <TouchableOpacity style={styles.controlBtn} onPress={loadAndPlay}>
      <Text style={styles.controlText}>{isPlaying ? "⏸" : "▶️"}</Text>
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
  controls: {
    flexDirection: "row",
    justifyContent: "center",
  },
  controlBtn: {
    backgroundColor: "#FEEDB6",
    padding: 12,
    borderRadius: 30,
  },
  controlText: {
    fontSize: 20,
    color: "#11152A",
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