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
    uri?: string;
    name?: string;
    starId?: string;
    id?: string;
  }>();
  const rawUri = params.uri;
  const filename = params.name;
  const realStarId = params.starId;
  const audioId = params.id;           // indien present → edit-mode
  const isEditMode = Boolean(audioId);

  const [uri, setUri] = useState(rawUri || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [barWidth, setBarWidth] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  // ── laad bestaande data in edit-mode
  useEffect(() => {
    if (isEditMode && realStarId && audioId) {
      api
        .get(`/stars/${realStarId}/audios/detail/${audioId}`)
        .then(({ data }) => {
          setTitle(data.title);
          setDescription(data.description);
          setUri(data.url);
        })
        .catch((err) => {
          console.error(err);
          Alert.alert("Fout", "Kon audio detail niet ophalen.");
        });
    }
  }, [isEditMode, realStarId, audioId]);

  // ── Audio modus & cleanup
  useEffect(() => {
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

  // ── play / pauze
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
          if (status.didJustFinish) setIsPlaying(false);
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

  // ── slider PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (!sound || !barWidth) return;
        const ratio = Math.min(Math.max(evt.nativeEvent.locationX / barWidth, 0), 1);
        const newPos = ratio * duration;
        sound.setPositionAsync(newPos);
        setPosition(newPos);
      },
      onPanResponderMove: (evt) => {
        if (!sound || !barWidth) return;
        const ratio = Math.min(Math.max(evt.nativeEvent.locationX / barWidth, 0), 1);
        const newPos = ratio * duration;
        sound.setPositionAsync(newPos);
        setPosition(newPos);
      },
    })
  ).current;

  // ── Upload of Update
  const handleSave = async () => {
    if (!realStarId) return Alert.alert("Fout", "Geen starId");
    if (!title.trim()) return Alert.alert("Vul een titel in");
    try {
      const fd = new FormData();
      if (!isEditMode && uri) {
        fd.append("audio", {
          uri,
          name: filename || "recording.m4a",
          type: "audio/m4a",
        } as any);
      }
      fd.append("title", title);
      fd.append("description", description);
      if (isEditMode) {
        await api.put(`/stars/${realStarId}/audios/detail/${audioId}`, fd);
      } else {
        await api.post(`/stars/${realStarId}/audios/upload`, fd);
      }
      Alert.alert("Succes", isEditMode ? "Audio bijgewerkt!" : "Audio geüpload!");
      router.replace({
        pathname: "/(app)/dedicates/created-dedicates/audios/audios",
        params: { starId: realStarId },
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Fout", isEditMode ? "Bijwerken mislukt." : "Upload mislukt.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Back */}
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

      {/* 3-dots menu */}
      <TouchableOpacity
        style={styles.menuBtn}
        onPress={() => setShowMenu(!showMenu)}
      >
        <Text style={styles.menuText}>⋮</Text>
      </TouchableOpacity>
      {showMenu && (
        <View style={styles.menuDropdown}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              router.push({
                pathname:
                  "/(app)/dedicates/created-dedicates/audios/three-dots/add-people/AddPeoplePage",
                params: {
                  starId: realStarId,
                  id: audioId,
                },
              })
            }
          >
            <UserPlusIcon width={16} height={16} style={{ marginRight: 8 }} />
            <Text style={styles.menuTextItem}>Add people</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              router.push({
                pathname:
                  "/(app)/dedicates/created-dedicates/audios/three-dots/see-members/SeeMembersAudio",
                params: {
                  starId: realStarId,
                  id: audioId,
                },
              })
            }
          >
            <UserIcon width={16} height={16} style={{ marginRight: 8 }} />
            <Text style={styles.menuTextItem}>See members</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        <Text style={styles.title}>Audio</Text>

        {/* form */}
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
        </View>

        {/* speler onder form */}
        <View style={styles.playerBox}>
          <Text style={styles.audioFilename}>
            {title || filename || "audio.mp3"}
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

        {/* Upload/Save */}
        <TouchableOpacity
          style={[styles.addBtn, title.trim() && styles.addBtnActive]}
          disabled={!title.trim()}
          onPress={handleSave}
        >
          <Text
            style={[
              styles.addText,
              title.trim() && styles.addTextActive,
            ]}
          >
            {isEditMode ? "Save" : "Upload"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 80, left: 20, zIndex: 10 },
  menuBtn: { position: "absolute", top: 80, right: 20, zIndex: 20 },
  menuText: { color: "#fff", fontSize: 28, fontFamily: "Alice-Regular" },
  menuDropdown: {
    position: "absolute",
    top: 80,
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
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  menuTextItem: { color: "#11152A", fontFamily: "Alice-Regular", fontSize: 14 },

  title: {
    textAlign: "center",
    marginTop: 80,
    fontSize: 20,
    color: "#fff",
    fontFamily: "Alice-Regular",
  },
  form: { marginTop: 30, paddingHorizontal: 20 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    fontFamily: "Alice-Regular",
  },
  descriptionInput: { height: 100, textAlignVertical: "top" },

  playerBox: { alignItems: "center", marginTop: 20 },
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
  progressFill: { height: "100%", backgroundColor: "#FEEDB6" },
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
  addBtnActive: { backgroundColor: "#FEEDB6" },
  addText: {
    fontSize: 18,
    color: "#333",
    fontFamily: "Alice-Regular",
  },
  addTextActive: { color: "#11152A", fontWeight: "600" },
});