// app/(app)/my-stars/private-star/audios/components/AudioPlayer.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Audio } from "expo-av";
import PlayIcon from "@/assets/images/svg-icons/play-white.svg";
import PauseIcon from "@/assets/images/svg-icons/pause-white.svg";

interface AudioPlayerProps {
  uri: string;
}

export default function AudioPlayer({ uri }: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const progress = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const togglePlayPause = async () => {
    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false, isLooping: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      await newSound.playAsync();
      setIsPlaying(true);
    } else {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;
      if (status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const onPlaybackStatusUpdate = async (status: Audio.AVPlaybackStatus) => {
    if (!status.isLoaded) return;
  
    const pos = status.positionMillis;
    const dur = status.durationMillis || 1;
    progress.setValue(pos / dur);
    setPosition(pos);
    setDuration(dur);
    setIsPlaying(status.isPlaying);
  
    if (status.didJustFinish) {
      if (sound) {
        try {
          await sound.setPositionAsync(0);
          await sound.playAsync();
        } catch (e) {
          console.error("Auto-restart failed:", e);
        }
      }
    }
  };

  // timeline is exact 300px breed
  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  // dot moet van -5 (half dot left) tot 295 (300 - half dot)
  const thumbTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 295],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.wrapper}>
      <View style={styles.timelineWrapper}>
        <View style={styles.line} />
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        <Animated.View
          style={[styles.movingDot, { transform: [{ translateX: thumbTranslateX }] }]}
        />
        <TouchableOpacity onPress={togglePlayPause} style={styles.playIcon}>
          {isPlaying ? (
            <PauseIcon width={20} height={20} />
          ) : (
            <PlayIcon width={20} height={20} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
  },
  timelineWrapper: {
    position: "relative",
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    width: 300,
  },
  line: {
    height: 1,
    backgroundColor: "#fff",
    width: "100%",
    position: "absolute",
  },
  progressFill: {
    position: "absolute",
    height: 1,
    backgroundColor: "#FEEDB6",
    top: "50%",
    left: 0,
  },
  movingDot: {
    position: "absolute",
    top: "50%",
    left: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FEEDB6",
    marginTop: -5,
    zIndex: 2,
  },
  playIcon: {
    position: "absolute",
    top: "150%",
    left: "50%",
    transform: [{ translateX: -10 }, { translateY: -10 }],
    zIndex: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  time: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Alice-Regular",
    width: 40,
    textAlign: "center",
  },
});