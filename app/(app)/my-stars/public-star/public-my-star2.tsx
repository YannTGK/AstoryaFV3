import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

const { width } = Dimensions.get("window");

const starOptions = [
    { name: "PEACE", color: 0xffffff, emissive: 0xffffff },
    { name: "HOPE", color: 0xffffff, emissive: 0xffedaa },         // zacht geel
    { name: "SUCCESS", color: 0xffffff, emissive: 0xffb3b3 },      // pastel rood
    { name: "WEALTH", color: 0xffffff, emissive: 0xffc9aa },       // pastel oranje
    { name: "HEALTH", color: 0xffffff, emissive: 0xd8ffd8 },       // pastel groen
    { name: "OPPORTUNITY", color: 0xffffff, emissive: 0xaacfff },  // pastel blauw 
    { name: "INSPIRATION", color: 0xffffff, emissive: 0xe3d1ff },  // pastel paars
    { name: "REMEMBRANCE", color: 0xffffff, emissive: 0xffc1e6 },  // pastel roze
  ]; 
  

export default function PrivateMyStar() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

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

        const applyMaterial = () => {
          star.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              const material = child.material as THREE.MeshStandardMaterial;
              const { color, emissive } = starOptions[currentIndex];
              material.color.setHex(0xffffff); // ster blijft wit
              material.emissive.setHex(emissive); 
              material.emissiveIntensity = 1.5;
            }
          });
        };

        applyMaterial();
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
      }
    );
  };

  const nextStar = () => setCurrentIndex((prev) => (prev + 1) % starOptions.length);
  const prevStar = () => setCurrentIndex((prev) => (prev - 1 + starOptions.length) % starOptions.length);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000000", "#273166", "#000000"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Back button */}
      <TouchableOpacity style={{ position: "absolute", top: 50, left: 20, zIndex: 10 }} onPress={() => router.back()}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.title}>My personal star</Text>
      <Text style={styles.subtitle}>Choose the color of your star that will hold your last wish to the world.</Text>

      {/* 3D ster */}
      <View style={styles.canvasWrapper}>
        <GLView key={currentIndex} style={styles.glView} onContextCreate={createScene} />
      </View>

      {/* Naam met pijltjes */}
      <View style={styles.nameRow}>
        <TouchableOpacity style={styles.arrowSide} onPress={prevStar}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>

        <Text style={styles.starName}>{starOptions[currentIndex].name}</Text>

        <TouchableOpacity style={styles.arrowSide} onPress={nextStar}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M9 6l6 6-6 6" stroke="#FEEDB6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      </View>

      {/* Select knop */}
    {/* Select knop */}
    <View style={styles.selectButtonWrapper}>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/(app)/my-stars/public-star/chosen-star-public",
            params: {
              name: starOptions[currentIndex].name,
              emissive: starOptions[currentIndex].emissive.toString(),
            },
          })
        }
      >
        <Text style={styles.buttonText}>Select star</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "Alice-Regular",
    fontSize: 20,
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
  },
  subtitle: {
    fontFamily: "Alice-Regular",
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 30,
    marginTop: 20,
  },
  canvasWrapper: {
    alignSelf: "center",
    marginTop: 40,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  glView: {
    width: 300,
    height: 300,
    backgroundColor: "transparent",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginTop: 15,
  },
  starName: {
    textAlign: "center",
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 20,
  },
  arrowSide: {
    padding: 10,
  },
  selectButtonWrapper: {
    position: "absolute",
    bottom: 110,
    left: 20,
    right: 20,
    zIndex: 2,
  },
  button: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#FEEDB6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Alice-Regular",
    textAlign: "center",
    color: "#000",
  },
});
