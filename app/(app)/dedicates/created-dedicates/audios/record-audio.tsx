// app/(app)/my-stars/private-star/audios/record-audio/RecordAudioScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import { Audio } from "expo-av";
import { useRouter, useLocalSearchParams } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import RecordIcon from "@/assets/images/svg-icons/microphone.svg";
import PlayIcon from "@/assets/images/icons/play.svg";
import PauseIcon from "@/assets/images/icons/pause.svg";
import StopIcon from "@/assets/images/icons/stop-circle.svg";

export default function RecordAudioScreen() {
  const router = useRouter();
  const { starId, id } = useLocalSearchParams<{ starId?: string; id?: string }>();
  const realStarId = starId ?? id;

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timer | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // pulse animatie
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      if (recording && isPaused) {
        await recording.startAsync();
        setIsRecording(true);
        setIsPaused(false);
        timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
        return;
      }
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: newRec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRec);
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch (e) {
      console.error("Recording error:", e);
    }
  };

  const pauseRecording = async () => {
    if (!recording) return;
    await recording.pauseAsync();
    setIsRecording(false);
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setIsRecording(false);
    setIsPaused(false);
    setRecording(null);
    if (timerRef.current) clearInterval(timerRef.current);
    if (uri) {
      router.push({
        pathname: "/(app)/dedicates/created-dedicates/audios/upload-edit-audio",
        params: { uri, starId: realStarId },
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Achtergrond gradient */}
      <LinearGradient
        colors={["#000", "#273166", "#000"]}
        style={StyleSheet.absoluteFill}
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

      {/* Titel */}
      <Text style={styles.title}>Audio</Text>

      {/* Timer tijdens opnemen */}
      { (isRecording || isPaused) && (
        <View style={styles.timerRow}>
          <Text style={styles.timerText}>Recording: {formatTime(duration)}</Text>
        </View>
      )}

      {/* Record-cirkel */}
      <View style={styles.centerContent}>
        <Animated.View
          style={[styles.recordCircle, { transform: [{ scale: pulseAnim }] }]}
        >
          <RecordIcon width={200} height={200} />
        </Animated.View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={isRecording ? pauseRecording : startRecording}>
            {isRecording ? (
              <PauseIcon width={32} height={32} />
            ) : (
              <PlayIcon width={32} height={32} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={stopRecording} style={{ marginLeft: 30 }}>
            <StopIcon width={32} height={32} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 75, left: 20, zIndex: 10 },
  title: {
    textAlign: "center",
    marginTop: 70,
    fontSize: 20,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
  timerRow: {
    alignItems: "center",
    marginTop: 20,
  },
  timerText: {
    color: "#FEEDB6",
    fontSize: 16,
    fontFamily: "Alice-Regular",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recordCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 12,
    borderColor: "#A3A7B8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  controls: {
    flexDirection: "row",
    backgroundColor: "#FEEDB6",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 40,
    alignItems: "center",
  },
});