import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { Audio } from "expo-av";
import Svg, { Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import RecordIcon from "@/assets/images/svg-icons/microphone.svg";
import PauseIcon from "@/assets/images/icons/pause.svg";
import StopIcon from "@/assets/images/icons/stop-circle.svg";

export default function RecordAudioScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const pauseRecording = async () => {
    if (recording) {
      await recording.pauseAsync();
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

      if (uri) {
        router.push({
          pathname: "/(app)/my-stars/private-star/audios/upload-edit-audio",
          params: { uri },
        });
      }
    }
  };

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

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

      <View style={styles.recorderContainer}>
        <Animated.View style={[styles.recordCircle, { transform: [{ scale: pulseAnim }] }]}>
          <RecordIcon width={278} height={278} />
        </Animated.View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            onPress={isRecording ? pauseRecording : startRecording}
          >
            <PauseIcon width={24} height={24} />
          </TouchableOpacity>

          <TouchableOpacity onPress={stopRecording} style={{ marginLeft: 30 }}>
            <StopIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
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
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    fontFamily: "Alice-Regular",
  },
  recorderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recordCircle: {
    width: 140,
    height: 140,
    borderRadius: 120,
    borderWidth: 12,
    borderColor: "#A3A7B8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 120,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FEEDB6",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 40,
  },
});
