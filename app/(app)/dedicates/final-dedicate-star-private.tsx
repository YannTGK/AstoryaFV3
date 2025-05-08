import { View, Text, TouchableOpacity, Pressable, StyleSheet, Dimensions, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { useState } from "react";
import useAuthStore from "@/lib/store/useAuthStore";
import StarView from "@/components/stars/StarView";

import PhotosIcon from "@/assets/images/svg-icons/photos.svg";
import VideosIcon from "@/assets/images/svg-icons/videos.svg";
import AudiosIcon from "@/assets/images/svg-icons/audios.svg";
import DocumentsIcon from "@/assets/images/svg-icons/documents.svg";
import BookOfLifeIcon from "@/assets/images/svg-icons/book-of-life.svg";
import MoreIcon from "@/assets/images/svg-icons/more.svg"; 
import AddPeopleIcon from "@/assets/images/svg-icons/add-people.svg"; 
import SeeMembersIcon from "@/assets/images/svg-icons/see-members.svg"; 

const { width } = Dimensions.get("window");

export default function FinalDedicateStarPrivate() {
  const router = useRouter();
  const { name, emissive } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [isPrivate, setIsPrivate] = useState(true); // standaard PRIVATE
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggleToPublic = () => {
    setIsPrivate(false);
    router.push({
      pathname: "/dedicates/final-dedicate-star-public",
      params: {
        name: user?.firstName + " " + user?.lastName,
        emissive: emissive as string,
      },
    });
  };

  const icons = [
    { label: "Photo's", icon: <PhotosIcon width={60} height={60} /> },
    { label: "Video’s", icon: <VideosIcon width={60} height={60} /> },
    { label: "Audio’s", icon: <AudiosIcon width={60} height={60} /> },
    { label: "Documents", icon: <DocumentsIcon width={60} height={60} /> },
    { label: "Book of Life", icon: <BookOfLifeIcon width={60} height={60} /> },
  ];

  const handleAddPeople = () => {
    router.push("/dedicates/created-dedicates/add-people/add-people-dedicate");
  };

  const handleSeeMembers = () => {
    router.push("/dedicates/no-members-dedicate");
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

      <TouchableOpacity style={styles.moreBtn} onPress={() => setMenuOpen(!menuOpen)}>
        <MoreIcon width={24} height={24} />
      </TouchableOpacity>

      {menuOpen && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={handleAddPeople}>
            <AddPeopleIcon width={16} height={16} />
            <Text style={styles.menuText}>Add people</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleSeeMembers}>
            <SeeMembersIcon width={16} height={16} />
            <Text style={styles.menuText}>See members</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.title}>Dedicated star</Text>

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
          <Text style={styles.nameText}>First- & lastname</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {icons.map((item, index) => (
          <View key={index} style={styles.iconItem}>
            {item.icon}
            <Text style={styles.iconLabel}>{item.label}</Text>
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
  moreBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  menu: {
    position: "absolute",
    top: 90,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    gap: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  menuText: {
    fontSize: 13,
    fontFamily: "Alice-Regular",
    color: "#11152A",
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
