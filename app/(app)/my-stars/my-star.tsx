import { View, Text, TouchableOpacity, Pressable, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";

const { width, height } = Dimensions.get("window");

export default function MyStarScreen() {
  const router = useRouter();
  const [isPrivate, setIsPrivate] = useState(true);

  const createScene = async (gl: any) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x000000);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.z = 4;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const geometry = new THREE.DodecahedronGeometry(1.2, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1,
      flatShading: true,
    });
    const star = new THREE.Mesh(geometry, material);
    scene.add(star);

    const animate = () => {
      requestAnimationFrame(animate);
      star.rotation.y += 0.01;
      star.rotation.x += 0.005;
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animate();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
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
          <Text
            style={{
              color: isPrivate ? "#11152A" : "#FFFFFF",
              fontFamily: "Alice-Regular",
              fontSize: 16,
            }}
          >
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
          <Text
            style={{
              color: !isPrivate ? "#11152A" : "#FFFFFF",
              fontFamily: "Alice-Regular",
              fontSize: 16,
            }}
          >
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

      {/* Naam */}
      <Text style={styles.name}>Maria De Sadeleer</Text>

      {/* Customize knop (volledige breedte) */}
      <TouchableOpacity style={styles.button} onPress={() => console.log("Customize star")}>
        <Text style={styles.buttonText}>Customize star</Text>
      </TouchableOpacity>
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
    height: 240,
    width: 240,
    alignSelf: "center",
    marginTop: 60,
    borderRadius: 120,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  glView: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    textAlign: "center",
    color: "#fff",
    fontFamily: "Alice-Regular",
    marginTop: 24,
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#FEEDB6",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginHorizontal: 32,
    marginBottom: 30,
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
