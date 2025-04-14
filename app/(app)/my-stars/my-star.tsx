import { View, Text, TouchableOpacity, Pressable, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

const { width, height } = Dimensions.get("window");

export default function MyStarScreen() {
  const router = useRouter();
  const [isPrivate, setIsPrivate] = useState(true);

  const createScene = async (gl: any) => {
    const renderer = new Renderer({ gl, preserveDrawingBuffer: true });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x000000, 0); // transparant zwart (niet zichtbaar i.c.m. gradient)

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.z = 7; // iets dichterbij

    const light = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(light);

    const loader = new GLTFLoader();
    loader.load(
      "https://cdn.jsdelivr.net/gh/YannTGK/GlbFIle@main/star.glb",
      (gltf) => {
        const star = gltf.scene;
        star.scale.set(3.2, 3.2, 3.2);
        star.position.set(0, 0, 0);

        // Draai rechtop (bovenste punt naar boven)
        star.rotation.x = -Math.PI / 2;

        star.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => {
                m.color?.set(0xffffff);
                m.emissive?.set(0xffffff);
              });
            } else {
              mesh.material.color?.set(0xffffff);
              mesh.material.emissive?.set(0xffffff);
              mesh.material.emissiveIntensity = 0.5;
            }
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
          star.rotation.z += 0.005; // draai alleen rond Z-as
          composer.render();
          gl.endFrameEXP();
        };

        animate();
      },
      undefined,
      (error) => {
        console.error("❌ Error loading star.glb:", error);
      }
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Gradient background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["#000000", "#273166", "#000000"]}
          style={{ flex: 1 }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      {/* Back button */}
      <TouchableOpacity
        style={{ position: "absolute", top: 50, left: 20, zIndex: 10, padding: 10 }}
        onPress={() => router.back()}
      >
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

      {/* Title */}
      <Text style={styles.title}>My personal star</Text>

      {/* Toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          onPress={() => setIsPrivate(true)}
          style={[
            styles.toggleButton,
            {
              backgroundColor: isPrivate ? "#FEEDB6" : "#11152A",
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
            },
          ]}
        >
          <Text style={{
            color: isPrivate ? "#11152A" : "#FFFFFF",
            fontFamily: "Alice-Regular",
            fontSize: 16,
          }}>
            Private
          </Text>
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
          <Text style={{
            color: !isPrivate ? "#11152A" : "#FFFFFF",
            fontFamily: "Alice-Regular",
            fontSize: 16,
          }}>
            Public
          </Text>
        </Pressable>
      </View>

      {/* 3D ster */}
      <View style={styles.starWrapper}>
        <GLView
          style={styles.glView}
          onContextCreate={createScene}
        />
      </View>

      {/* Customize knop */}
      <View style={styles.fixedButtonWrapper}>
        <TouchableOpacity style={styles.button} onPress={() => console.log("Customize star")}>
          <Text style={styles.buttonText}>Customize star</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "white",
    fontSize: 22,
    textAlign: "center",
    marginTop: 50,
    fontFamily: "Alice-Regular",
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
  starWrapper: {
    height: 300,
    width: 300,
    alignSelf: "center",
    marginTop: 60,
    backgroundColor: "transparent",
  },
  glView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  fixedButtonWrapper: {
    position: "absolute",
    bottom: 110,
    left: 20,
    right: 20,
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
