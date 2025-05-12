import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, StyleSheet, Dimensions, Text, ActivityIndicator } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { Raycaster, Vector2 } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import JoystickHandler from "@/components/joystick/JoystickHandler";
import { setupControls } from "@/components/three/setupControls";
import StarsManager from "@/components/stars/StarManager";
import api from "@/services/api";
import { useLayoutStore } from "@/lib/store/layoutStore";
import { useFilterStore } from "@/lib/store/filterStore";

const { width, height } = Dimensions.get("window");
const CLUSTER_FACTOR = 0.15;

export default function PrivateScreen() {
  // camera setup
  const camPos = useRef({ x: 0, y: 0, z: 10 });
  const camRot = useRef({ x: 0, y: 0 });
  const camRef = useRef<THREE.PerspectiveCamera | null>(null);

  // scene & data
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [rawStars, setRawStars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const setIsSearching = useLayoutStore((s) => s.setIsSearching);
  const { dob, dod, country, coordX, coordY, coordZ, searchQuery, selectedStarId } =
    useFilterStore();

  // overlay
  const [selectedStarName, setSelectedStarName] = useState<string | null>(null);
  const [iconPos, setIconPos] = useState<{ x: number; y: number }[]>([]);
  const [isStarSelected, setIsStarSelected] = useState(false);
  const [joystickKey, setJoystickKey] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [originalScale, setOriginalScale] = useState<THREE.Vector3 | null>(null);

  // for “return camera”
  const prevCamPos = useRef(new THREE.Vector3());
  const targetPos = useRef(new THREE.Vector3(0, 0, 10));
  const camLocked = useRef(false);

  // icons
  const iconSize = 65;
  const iconOffset = iconSize / 2;
  const icons = [
    /* your 7 icons here… */
  ];

  // 1️⃣ Fetch
  useEffect(() => {
    (async () => {
      try {
        const { stars } = (await api.get("/stars/private")).data;
        setRawStars(stars);
      } catch (e) {
        console.error("★ private fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2️⃣ Cluster + filter + search
  const stars = useMemo(() => {
    let f = rawStars.map((s) => ({
      ...s,
      x: s.x * CLUSTER_FACTOR,
      y: s.y * CLUSTER_FACTOR,
      z: s.z * CLUSTER_FACTOR,
    }));

    // DOB / DOD
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
    // country
    if (country) f = f.filter((s) => s.user?.country === country);

    // coords (allow comma)
    const near = (v: number, t: number) => Math.abs(v - t) <= 2;
    if (coordX) {
      const x = parseFloat(coordX.replace(",", "."));
      if (!isNaN(x)) f = f.filter((s) => near(s.x, x));
    }
    if (coordY) {
      const y = parseFloat(coordY.replace(",", "."));
      if (!isNaN(y)) f = f.filter((s) => near(s.y, y));
    }
    if (coordZ) {
      const z = parseFloat(coordZ.replace(",", "."));
      if (!isNaN(z)) f = f.filter((s) => near(s.z, z));
    }

    // text search
    if (searchQuery) {
      const q = searchQuery.trim().toLowerCase();
      f = f.filter((s) => s.publicName.toLowerCase().includes(q));
    }

    return f;
  }, [rawStars, dob, dod, country, coordX, coordY, coordZ, searchQuery]);

  // 3️⃣ Center camera on the cluster
  useEffect(() => {
    if (!camRef.current || stars.length === 0) return;
    const c = stars.reduce(
      (a, s) => ({ x: a.x + s.x, y: a.y + s.y, z: a.z + s.z }),
      { x: 0, y: 0, z: 0 }
    );
    c.x /= stars.length;
    c.y /= stars.length;
    c.z /= stars.length;

    const maxD = Math.max(
      ...stars.map((s) =>
        Math.hypot(s.x - c.x, s.y - c.y, s.z - c.z)
      )
    );
    const dist = maxD * 1.5 + 20;

    camPos.current = { x: c.x, y: c.y, z: c.z + dist };
    camRef.current!.position.set(c.x, c.y, c.z + dist);
    camRef.current!.lookAt(new THREE.Vector3(c.x, c.y, c.z));
  }, [stars]);

  // 4️⃣ Jump to search-selected star
  useEffect(() => {
    if (
      !camRef.current ||
      !scene ||
      stars.length === 0 ||
      !selectedStarId
    )
      return;

    const tgt = stars.find((s) => s._id === selectedStarId);
    if (!tgt) return;

    const offset = 20;
    camRef.current!.position.set(tgt.x, tgt.y, tgt.z + offset);
    camRef.current!.lookAt(new THREE.Vector3(tgt.x, tgt.y, tgt.z));
    camPos.current = { x: tgt.x, y: tgt.y, z: tgt.z + offset };

    // clear selection so it doesn’t repeat
    useFilterStore.getState().setFilters({ selectedStarId: "" });
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
    cam.position.set(
      camPos.current.x,
      camPos.current.y,
      camPos.current.z
    );
    camRef.current = cam;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(sc, cam));
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(gl.drawingBufferWidth, gl.drawingBufferHeight),
        3, 1, 0
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

  // 6️⃣ Touch / raycast (to open overlay)
  const ray = new Raycaster();
  const touchPt = new Vector2();
  const pan = useRef(
    setupControls({ cameraPosition: camPos, cameraRotation: camRot })
  ).current;

  const handleTouch = (e: any) => {
    if (!scene || !camRef.current) return;
    const { locationX, locationY } = e;
    touchPt.x = (locationX / width) * 2 - 1;
    touchPt.y = -(locationY / height) * 2 + 1;
    ray.setFromCamera(touchPt, camRef.current);
    const hit = ray.intersectObjects(scene.children, true)[0];
    if (!hit) return;
    let obj: any = hit.object;
    while (obj && !obj.userData?.id && obj.parent) obj = obj.parent;
    const id = obj.userData?.id;
    if (!id) return;

    // (overlay open/close logic…)
  };

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

      {!isStarSelected && (
        <JoystickHandler
          key={joystickKey}
          cameraPosition={camPos}
          cameraRotation={camRot}
        />
      )}

      {(loading || !scene) && (
        <ActivityIndicator style={styles.spinner} size="large" color="#fff" />
      )}

      {scene && stars.length > 0 && (
        <StarsManager scene={scene} stars={stars} />
      )}

      {/* overlay elements… */}
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
    transform: [{ translateX: -10 }, { translateY: -10 }],
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