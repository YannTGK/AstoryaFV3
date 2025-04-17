import { View, Text, TouchableOpacity, Pressable, StyleSheet, Dimensions, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { useState } from "react";
import useAuthStore from "@/lib/store/useAuthStore";

// SVG-component imports
import PhotosIcon from "@/assets/images/svg-icons/photos.svg";
import VideosIcon from "@/assets/images/svg-icons/videos.svg";
import AudiosIcon from "@/assets/images/svg-icons/audios.svg";
import MessagesIcon from "@/assets/images/svg-icons/messages.svg";
import DocumentsIcon from "@/assets/images/svg-icons/documents.svg";
import BookOfLifeIcon from "@/assets/images/svg-icons/book-of-life.svg";
import VRSpaceIcon from "@/assets/images/svg-icons/3D-VR-space.svg";

const { width } = Dimensions.get("window");

export default function MyStarPrivate2() {
  const router = useRouter();
  const { name, emissive } = useLocalSearchParams();
  const { user } = useAuthStore();
  const [isPrivate, setIsPrivate] = useState(true);

  const createScene = async (gl: any) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = true;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
    camera.position.z = 7;

    const light = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(light);

    const loader = new GLTFLoader();
    loader.load(
      "https://cdn.jsdelivr.net/gh/YannTGK/GlbFIle@main/star.glb",
      (gltf) => {
        const star = gltf.scene;
        star.scale.set(3.2, 3.2, 3.2);
        star.position.set(0, 0, 0);
        star.rotation.x = -Math.PI / 2;

        const glowColor = new THREE.Color(parseInt(emissive as string));
        star.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            material.color.set(0xffffff);
            material.emissive.set(glowColor);
            material.emissiveIntensity = 1.5;
          }
        });

        scene.add(star);

        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        composer.addPass(
          new UnrealBloomPass(
            new THREE.Vector2(gl.drawingBufferWidth, gl.drawingBufferHeight),
            0.9,
            0.3,
            0
          )
        );

        const animate = () => {
          requestAnimationFrame(animate);
          star.rotation.z += 0.005;
          composer.render();
          gl.endFrameEXP();
        };

        animate();
      },
      undefined,
      (error) => {
        console.error("Error loading star.glb", error);
      }
    );
  };

  const icons = [
    { label: "Photo's", icon: <PhotosIcon width={40} height={40} /> },
    { label: "Video’s", icon: <VideosIcon width={40} height={40} /> },
    { label: "Audio’s", icon: <AudiosIcon width={40} height={40} /> },
    { label: "Messages", icon: <MessagesIcon width={40} height={40} /> },
    { label: "Documents", icon: <DocumentsIcon width={40} height={40} /> },
    { label: "Book of Life", icon: <BookOfLifeIcon width={40} height={40} /> },
    { label: "3D VR Space", icon: <VRSpaceIcon width={40} height={40} /> },
  ];

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>My personal star</Text>

      {/* Toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          onPress={() => setIsPrivate(true)}
          style={[styles.toggleButton, { backgroundColor: isPrivate ? "#FEEDB6" : "#11152A", borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }]}
        >
          <Text style={[styles.toggleText, { color: isPrivate ? "#11152A" : "#fff" }]}>Private</Text>
        </Pressable>
        <Pressable
          onPress={() => setIsPrivate(false)}
          style={[styles.toggleButton, { backgroundColor: !isPrivate ? "#FEEDB6" : "#11152A", borderTopRightRadius: 12, borderBottomRightRadius: 12 }]}
        >
          <Text style={[styles.toggleText, { color: !isPrivate ? "#11152A" : "#fff" }]}>Public</Text>
        </Pressable>
      </View>

      {/* 3D ster + naam overlay */}
      <View style={styles.canvasWrapper}>
        <GLView style={styles.glView} onContextCreate={createScene} />
        <View style={styles.nameOverlay}>
          <Text style={styles.nameText}>{user?.firstName} {user?.lastName}</Text>
        </View>
      </View>

      {/* Iconen horizontaal */}
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
    top: 40,
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
  glView: {
    height: 300,
    width: 300,
    backgroundColor: "transparent",
  },
  nameOverlay: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  nameText: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
    color: "#000",
    textAlign: "center",
  },
  scrollRow: {
    marginTop: 30,
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
