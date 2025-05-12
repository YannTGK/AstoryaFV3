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
import Svg, { Path } from "react-native-svg";
import PlayIcon from "@/assets/images/icons/play.svg";
import PauseIcon from "@/assets/images/icons/pause.svg";
import StopIcon from "@/assets/images/icons/stop-circle.svg";
import UserPlusIcon from "@/assets/images/svg-icons/add-people.svg";
import UserIcon from "@/assets/images/svg-icons/see-members.svg";
import { useAudio } from "@/app/(app)/my-stars/private-star/audios/audioProvider";

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
  const [showMenu, setShowMenu] = useState(false); // menu toggle

  const { addAudio } = useAudio();

  const isFormComplete =
    title.trim() !== "" && description.trim() !== "" && to.trim() !== "";

  const handleAddAudio = () => {
    addAudio({
      uri,
      title,
      description,
      to,
      date: new Date().toISOString(),
    });

    router.replace("/(app)/my-stars/private-star/audios/audios");
  };

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
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
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

      {/* Menu Toggle Button */}
      <TouchableOpacity
        style={styles.menuBtn}
        onPress={() => setShowMenu(!showMenu)}
      >
        <Text style={styles.menuText}>⋮</Text>
      </TouchableOpacity>

      {/* Dropdown Menu */}
      {showMenu && (
        <View style={styles.menuDropdown}>
<TouchableOpacity
  style={styles.menuItem}
  onPress={() => router.push("/(app)/my-stars/private-star/photos/three-dots/add-people/AddMorePeople")}
>            <UserPlusIcon width={16} height={16} style={{ marginRight: 8 }} />
            <Text style={styles.menuTextItem}>Add people</Text>
          </TouchableOpacity>
<TouchableOpacity
  style={styles.menuItem}
  onPress={() => router.push("/(app)/my-stars/private-star/photos/three-dots/see-members/SeeMembersPhoto")}
>            <UserIcon width={16} height={16} style={{ marginRight: 8 }} />
            <Text style={styles.menuTextItem}>See members</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.title}>Audio</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
        />
        <TextInput
  style={[styles.input, styles.descriptionInput]}
  placeholder="Description"
  value={description}
  onChangeText={setDescription}
  placeholderTextColor="#999"
  multiline
  numberOfLines={3}
/>

        <TextInput
          style={styles.input}
          placeholder="To: @username"
          value={to}
          onChangeText={setTo}
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 150, flexGrow: 1 }}>
        <View style={styles.playerBox}>
          <Text style={styles.audioFilename}>
            {title ? title : name || "audio.mp3"}
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
                if (sound) {
                  sound.stopAsync();
                  setIsPlaying(false);
                }
              }}
              style={{ marginLeft: 30 }}
            >
              <StopIcon width={24} height={24} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.addBtn, isFormComplete && styles.addBtnActive]}
        disabled={!isFormComplete}
        onPress={handleAddAudio}
      >
        <Text style={[styles.addText, isFormComplete && styles.addTextActive]}>
          Add
        </Text>
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
  menuBtn: {
    position: "absolute",
    top: 80,
    right: 20,
    zIndex: 20,
  },
  menuText: {
    color: "#fff",
    fontSize: 28,
    fontFamily: "Alice-Regular",
  },
  menuDropdown: {
    position: "absolute",
    top: 110,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 25,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  menuTextItem: {
    color: "#11152A",
    fontFamily: "Alice-Regular",
    fontSize: 14,
  },
  title: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 20,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
  form: {
    marginTop: 50,
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
    marginBottom: 8,
    fontFamily: "Alice-Regular",
  },
  timestamp: {
    color: "#fff",
    fontSize: 16,
    marginVertical: 8,
    fontFamily: "Alice-Regular",
  },
  playerBox: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  progressBar: {
    width: "90%",
    height: 16,
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
    borderRadius: 8,
    backgroundColor: "#FEEDB6",
    transform: [{ translateX: -10 }],
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
  addBtn: {
    position: "absolute",
    bottom: 110,
    left: 16,
    right: 16,
    backgroundColor: "#ccc",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    zIndex: 10,
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
  descriptionInput: {
  height: 100, // of bijv. 80 als je het compacter wil
  textAlignVertical: "top", // zorgt dat de tekst bovenaan begint
},

});
