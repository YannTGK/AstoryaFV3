import React, { useState } from "react";
import { View, Text, TouchableOpacity, Pressable, StyleSheet, Dimensions, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import useAuthStore from "@/lib/store/useAuthStore";
import StarView from "@/components/stars/StarView";

// SVG-iconen
import PhotosIcon from "@/assets/images/svg-icons/photos.svg";
import VideosIcon from "@/assets/images/svg-icons/videos.svg";
import AudiosIcon from "@/assets/images/svg-icons/audios.svg";
import MessagesIcon from "@/assets/images/svg-icons/messages.svg";
import DocumentsIcon from "@/assets/images/svg-icons/documents.svg";
import VRSpaceIcon from "@/assets/images/svg-icons/3D-VR-space.svg";

const { width } = Dimensions.get("window");

export default function FinalMyStarPrivate() {
  const router = useRouter();
  const { name, emissive, id } = useLocalSearchParams<{
    name?: string;
    emissive?: string;
    id?: string;
  }>();

  const { user } = useAuthStore();
  const [isPrivate, setIsPrivate] = useState(true);

  /* ───────── navigatie helpers ───────── */
  const handleToggleToPublic = () => {
    setIsPrivate(false);
    router.push({
      pathname: "/(app)/my-stars/start-my-star-public",
      params: {
        name: user?.firstName + " " + user?.lastName,
        emissive,
        id,                           // meegeven!
      },
    });
  };

  const icons = [
    { label: "Photo's",    route: "/(app)/my-stars/private-star/photos/photo-album",              icon: <PhotosIcon    width={60} height={60} /> },
    { label: "Video’s",    route: "/(app)/my-stars/private-star/videos/video-album",  icon: <VideosIcon    width={60} height={60} /> },
    { label: "Audio’s",    route: "/(app)/my-stars/private-star/audios/audios",    icon: <AudiosIcon    width={60} height={60} /> },
    { label: "Messages",   route: "/(app)/my-stars/private-star/messages/add-message",icon: <MessagesIcon  width={60} height={60} /> },
    { label: "Documents",  route: "/(app)/my-stars/private-star/documents/documents", icon: <DocumentsIcon width={60} height={60} /> },
  ];

  const handlePress = (route: string) => {
    if (!id) {
      console.warn("Cannot navigate: id is undefined");
      return;
    }
    router.push({ pathname: route, params: { id } });
  };

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>My personal star</Text>

      <View style={styles.toggleContainer}>
        <Pressable
          style={[
            styles.toggleButton,
            { backgroundColor: isPrivate ? "#FEEDB6" : "#11152A", borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
          ]}
        >
          <Text style={[styles.toggleText, { color: isPrivate ? "#11152A" : "#fff" }]}>Private</Text>
        </Pressable>
        <Pressable
          onPress={handleToggleToPublic}
          style={[
            styles.toggleButton,
            { backgroundColor: !isPrivate ? "#FEEDB6" : "#11152A", borderTopRightRadius: 12, borderBottomRightRadius: 12 },
          ]}
        >
          <Text style={[styles.toggleText, { color: !isPrivate ? "#11152A" : "#fff" }]}>Public</Text>
        </Pressable>
      </View>

      <View style={styles.canvasWrapper}>
        <StarView emissive={parseInt(emissive as string)} rotate={false} />
        <View style={styles.nameOverlay}>
          <Text style={styles.nameText}>{user?.firstName} {user?.lastName}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {icons.map((item) => (
          <View key={item.label} style={styles.iconItem}>
            <TouchableOpacity onPress={() => handlePress(item.route)}>
              {item.icon}
              <Text style={styles.iconLabel}>{item.label}</Text>
            </TouchableOpacity>
          </View>
        ))}
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
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 26,
  },
  toggleText: {
    fontFamily: "Alice-Regular",
    fontSize: 16,
  },
  canvasWrapper: {
    alignSelf: "center",
    marginTop: 30,
    height: 300,
    width: 300,
    borderRadius: 20,
    overflow: "hidden",
  },
  nameOverlay: {
    position: "absolute",
    bottom: "4%",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  nameText: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
    color: "#fff",
    textAlign: "center",
  },
  scrollRow: {
    marginTop: 40,
  },
  iconItem: {
    alignItems: "center",
    marginRight: 20,
  },
  iconLabel: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});