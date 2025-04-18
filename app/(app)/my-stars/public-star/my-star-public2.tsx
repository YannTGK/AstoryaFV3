import { View, Text, TouchableOpacity, Pressable, StyleSheet, Dimensions } from "react-native";
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

const { width } = Dimensions.get("window");

export default function MyStarPublic2() {
  const router = useRouter();
  const { name, emissive } = useLocalSearchParams(); // ✅ name = fullName of initials (van ingelogde user)
  const [isPrivate, setIsPrivate] = useState(false);

  const displayName = typeof name === "string" ? name : "";

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
          onPress={() =>
            router.push({
              pathname: "/(app)/my-stars/private-star/my-star-private2",
              params: { name, emissive },
            })
          }
          style={[
            styles.toggleButton,
            {
              backgroundColor: isPrivate ? "#FEEDB6" : "#11152A",
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
            },
          ]}
        >
          <Text style={[styles.toggleText, { color: isPrivate ? "#11152A" : "#fff" }]}>Private</Text>
        </Pressable>
        <Pressable
          onPress={() => setIsPrivate(false)}
          style={[
            styles.toggleButton,
            {
              backgroundColor: !isPrivate ? "#FEEDB6" : "#11152A",
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
            },
          ]}
        >
          <Text style={[styles.toggleText, { color: !isPrivate ? "#11152A" : "#fff" }]}>Public</Text>
        </Pressable>
      </View>

      <View style={styles.canvasWrapper}>
        <GLView style={styles.glView} onContextCreate={createScene} />
        <View style={styles.nameOverlay}>
          <Text style={styles.nameText}>{displayName}</Text>
        </View>
      </View>

      <View style={styles.fixedButtonWrapper}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Add 3D/VR - space</Text>
        </TouchableOpacity>
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
  fixedButtonWrapper: {
    position: "absolute",
    bottom: 110,
    left: 20,
    right: 20,
    zIndex: 2,
  },
  button: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: "#FEEDB6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Alice-Regular",
    textAlign: "center",
  },
});
