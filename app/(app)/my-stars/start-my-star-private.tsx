import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, Pressable,
  StyleSheet, Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import StarView from "@/components/stars/StarView";

import UpgradePopup from "@/components/pop-ups/UpgradePopup";
import useAuthStore from "@/lib/store/useAuthStore";
import api from "@/services/api";

const { width } = Dimensions.get("window");

export default function StartMyStarPrivate() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [showPopup, setShowPopup] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!user) return;

      try {
        const { data: stars } = await api.get("/stars");
        console.log("⭐ sterren van user →", stars);

        const hasPrivateStar = stars.some((s: any) => s.isPrivate);
        const plan = user.plan;

        if (
          (plan === "PREMIUM" || plan === "LEGACY") &&
          hasPrivateStar
        ) {
          router.replace("/(app)/my-stars/private-star/final-my-star-private");
          return;
        }

        /* EXPLORER of geen private ster → banner tonen */
        setShowPopup(true);
      } catch (err) {
        console.error("❌ Fout bij ophalen sterren:", err);
        setShowPopup(true);        // fallback
      } finally {
        setIsReady(true);
      }
    };

    init();
  }, [user]);

  const handleToggleToPublic = () => {
    router.replace("/(app)/my-stars/start-my-star-public");
  };

  const handleCustomize = () => {
    router.push("/(app)/my-stars/private-star/color-my-star-private");
  };

  const createScene = async (gl: any) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000
    );
    camera.position.z = 7;
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    new GLTFLoader().load(
      "https://cdn.jsdelivr.net/gh/YannTGK/GlbFIle@main/star.glb",
      gltf => {
        const star = gltf.scene;
        star.scale.set(3.2, 3.2, 3.2);
        star.rotation.x = -Math.PI / 2;
        star.traverse(obj => {
          if (obj instanceof THREE.Mesh) {
            const mat = obj.material as THREE.MeshStandardMaterial;
            mat.color.set(0xffffff);
            mat.emissive.set(0xffffff);
            mat.emissiveIntensity = 1.5;
          }
        });
        scene.add(star);

        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        composer.addPass(
          new UnrealBloomPass(
            new THREE.Vector2(gl.drawingBufferWidth, gl.drawingBufferHeight),
            0.9, 0.3, 0
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
      err => console.error("Star load error:", err)
    );
  };

  if (!isReady) return null;                        
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#000", "#273166", "#000"]}
        style={StyleSheet.absoluteFill}
      />

      {showPopup && <UpgradePopup onClose={() => setShowPopup(false)} />}

      {!showPopup && (
        <>
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path d="M15 18l-6-6 6-6" stroke="#FEEDB6" strokeWidth={2}
                    strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          <Text style={styles.title}>My personal star</Text>

          {/* Private / Public */}
          <View style={styles.toggleContainer}>
            <Pressable style={[styles.toggleBtn, styles.privateOn]}>
              <Text style={[styles.toggleTxt, { color: "#11152A" }]}>Private</Text>
            </Pressable>
            <Pressable style={[styles.toggleBtn, styles.publicOff]}
                       onPress={handleToggleToPublic}>
              <Text style={[styles.toggleTxt, { color: "#fff" }]}>Public</Text>
            </Pressable>
          </View>

          {/* Ster */}
          <View style={styles.canvasWrapper}>
            <StarView emissive={0xffffff} size={300} rotate={true} />
          </View>

          {/* CTA */}
          <View style={styles.fixedButtonWrapper}>
            <TouchableOpacity style={styles.button} onPress={handleCustomize}>
              <Text style={styles.buttonText}>Customize star</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  title: {
    fontFamily: "Alice-Regular", fontSize: 20, color: "#fff",
    textAlign: "center", marginTop: 50,
  },
  toggleContainer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
  toggleBtn: { paddingVertical: 10, paddingHorizontal: 26 },
  privateOn: { backgroundColor: "#FEEDB6", borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  publicOff: { backgroundColor: "#11152A", borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  toggleTxt: { fontFamily: "Alice-Regular", fontSize: 16 },
  canvasWrapper: {
    position: "absolute", height: 300, width: 300, alignSelf: "center",
    marginTop: 200, borderRadius: 20, overflow: "hidden",
  },
  glView: { height: 300, width: 300, backgroundColor: "transparent" },
  fixedButtonWrapper: { position: "absolute", bottom: 100, left: 20, right: 20 },
  button: {
    backgroundColor: "#FEEDB6", paddingVertical: 14, borderRadius: 12,
    shadowColor: "#FEEDB6", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8, shadowRadius: 12, elevation: 6,
  },
  buttonText: { fontSize: 16, color: "#000", fontFamily: "Alice-Regular", textAlign: "center" },
});