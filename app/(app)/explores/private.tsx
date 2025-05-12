// app/(app)/explores/private/index.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, StyleSheet, Dimensions, ActivityIndicator, Text } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { Raycaster, Vector2 } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { useRouter } from "expo-router";

import JoystickHandler from "@/components/joystick/JoystickHandler";
import { setupControls } from "@/components/three/setupControls";
import StarsManager from "@/components/stars/StarManager";
import api from "@/services/api";
import { useFilterStore } from "@/lib/store/filterStore";
import { useLayoutStore } from "@/lib/store/layoutStore";

const { width, height } = Dimensions.get("window");
const CLUSTER_FACTOR = 0.15;
const isNear = (v: number, t: number, m = 2) => Math.abs(v - t) <= m;

export default function PrivateScreen() {
  const router = useRouter();
  const camPos = useRef({ x: 0, y: 0, z: 10 });
  const camRot = useRef({ x: 0, y: 0 });
  const camRef = useRef<THREE.PerspectiveCamera | null>(null);

  const [rawStars, setRawStars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scene, setScene] = useState<THREE.Scene | null>(null);

  const setIsSearching = useLayoutStore((s) => s.setIsSearching);
  const {
    dob,
    dod,
    country,
    coordX,
    coordY,
    coordZ,
    searchQuery,
    selectedStarId,
  } = useFilterStore();

  // 1️⃣ Load private stars
  useEffect(() => {
    (async () => {
      try {
        const { stars } = (await api.get("/stars/private")).data;
        setRawStars(stars);
      } catch (err) {
        console.error("★ private fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2️⃣ Filter & search
  const stars = useMemo(() => {
    let f = [...rawStars];
    if (dob) {
      const d = new Date(dob.split("/").reverse().join("-"))
        .toISOString()
        .slice(0, 10);
      f = f.filter((s) => s.user?.dob?.slice(0, 10) === d);
    }
    if (dod) {
      const D = new Date(dod.split("/").reverse().join("-"))
        .toISOString()
        .slice(0, 10);
      f = f.filter((s) => s.user?.dod?.slice(0, 10) === D);
    }
    if (country) f = f.filter((s) => s.user?.country === country);
    if (coordX) {
      const x = parseFloat(coordX);
      if (!isNaN(x)) f = f.filter((s) => isNear(s.x, x));
    }
    if (coordY) {
      const y = parseFloat(coordY);
      if (!isNaN(y)) f = f.filter((s) => isNear(s.y, y));
    }
    if (coordZ) {
      const z = parseFloat(coordZ);
      if (!isNaN(z)) f = f.filter((s) => isNear(s.z, z));
    }
    if (searchQuery) {
      const q = searchQuery.trim().toLowerCase();
      f = f.filter((s) => s.publicName.toLowerCase().includes(q));
    }
    return f;
  }, [rawStars, dob, dod, country, coordX, coordY, coordZ, searchQuery]);

  // 3️⃣ Center on cluster
  useEffect(() => {
    if (!camRef.current || stars.length === 0) return;
    const center = stars.reduce(
      (a, s) => ({ x: a.x + s.x, y: a.y + s.y, z: a.z + s.z }),
      { x: 0, y: 0, z: 0 }
    );
    center.x /= stars.length;
    center.y /= stars.length;
    center.z /= stars.length;

    const maxD = Math.max(
      ...stars.map((s) =>
        Math.hypot(s.x - center.x, s.y - center.y, s.z - center.z)
      )
    );
    const dist = maxD * 1.5 + 50;
    camPos.current = { x: center.x, y: center.y, z: center.z + dist };
    camRef.current!.position.set(center.x, center.y, center.z + dist);
    camRef.current!.lookAt(new THREE.Vector3(center.x, center.y, center.z));
  }, [stars]);

  // 4️⃣ Jump to selectedStarId
  useEffect(() => {
    if (
      !camRef.current ||
      !scene ||
      stars.length === 0 ||
      !selectedStarId
    )
      return;
    const target = stars.find((s) => s._id === selectedStarId);
    if (target) {
      const offset = 20;
      camPos.current = {
        x: target.x,
        y: target.y,
        z: target.z + offset,
      };
      camRef.current!.position.set(
        target.x,
        target.y,
        target.z + offset
      );
      camRef.current!.lookAt(
        new THREE.Vector3(target.x, target.y, target.z)
      );
      // clear selection
      useFilterStore.getState().setFilters({ selectedStarId: null });
    }
  }, [selectedStarId, stars, scene]);

  // 5️⃣ Three.js setup
  const createScene = async (gl: any) => {
    const renderer = new Renderer({ gl, preserveDrawingBuffer: true });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const sc = new THREE.Scene();
    setScene(sc);

    const cam = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      10000
    );
    cam.position.z = camPos.current.z;
    camRef.current = cam;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(sc, cam));
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(
          gl.drawingBufferWidth,
          gl.drawingBufferHeight
        ),
        3,
        1,
        0
      )
    );

    const loop = () => {
      requestAnimationFrame(loop);
      cam.position.set(
        camPos.current.x,
        camPos.current.y,
        camPos.current.z
      );
      cam.rotation.x = camRot.current.x;
      cam.rotation.y = camRot.current.y;
      composer.render();
      gl.endFrameEXP();
    };
    loop();
  };

  // 6️⃣ Interaction
  const ray = new Raycaster();
  const touch = new Vector2();
  const pan = useRef(
    setupControls({
      cameraPosition: camPos,
      cameraRotation: camRot,
    })
  ).current;

  const handleTouch = (e: any) => {
    if (!scene || !camRef.current) return;
    touch.x = (e.locationX / width) * 2 - 1;
    touch.y = -(e.locationY / height) * 2 + 1;
    ray.setFromCamera(touch, camRef.current!);
    const hit = ray.intersectObjects(scene.children, true)[0];
    if (!hit) return;
    let o: any = hit.object;
    while (o && !o.userData?.id && o.parent) o = o.parent;
    if (o.userData?.id) {
      console.log("🟢 click star:", o.userData.id);
    }
  };

  // ─── Render ───────────────────────────────────────────
  return (
    <View style={styles.container}>
      <GLView
        style={styles.gl}
        onContextCreate={createScene}
        onTouchEnd={(e) => handleTouch(e.nativeEvent)}
        {...pan.panHandlers}
      />

      <View style={styles.cross}>
        <Text style={styles.plus}>+</Text>
      </View>

      <JoystickHandler cameraPosition={camPos} cameraRotation={camRot} />

      {loading && (
        <ActivityIndicator
          style={styles.spinner}
          size="large"
          color="#fff"
        />
      )}

      {scene && (
        <StarsManager
          scene={scene}
          stars={stars}
          highlightIds={stars.map((s) => s._id)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  gl: { position: "absolute", width, height, top: 0, left: 0 },
  cross: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [
      { translateX: -10 },
      { translateY: -10 },
    ],
    zIndex: 10,
  },
  plus: { fontSize: 24, color: "#fff" },
  spinner: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -15,
  },
});