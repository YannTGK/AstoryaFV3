import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { Animated } from "react-native";
import { useRouter } from "expo-router";
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
const FOCUS_DISTANCE = 25; // afstand tussen camera en ster

const isNear = (v: number, t: number, m = 2) => Math.abs(v - t) <= m;

export default function PublicScreen() {
  const router = useRouter();

  // Camera refs
  const camPos = useRef(new THREE.Vector3(0, 0, 10));
  const camRot = useRef({ x: 0, y: 0 });
  const camRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Voor terugkeer bij Back
  const prevCamPos = useRef(new THREE.Vector3());
  const prevCamRot = useRef({ x: 0, y: 0 });

  const [rawStars, setRawStars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scene, setScene] = useState<THREE.Scene | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;


  const [overlayStar, setOverlayStar] = useState<{
    id: string;
    publicName: string;
  } | null>(null);

  const showOnlyMine = useLayoutStore((s) => s.showOnlyMine);
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

  // ─── Fetch public stars ─────────────────
  useEffect(() => {
    (async () => {
      try {
        const { stars } = (await api.get("/stars/public")).data;
        setRawStars(stars);
      } catch (err) {
        console.error("★ public fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ─── Apply filters & search ─────────────
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
    if (showOnlyMine) {
      f = f
        .filter((s) => s.related)
        .map((s) => ({
          ...s,
          x: s.x * CLUSTER_FACTOR,
          y: s.y * CLUSTER_FACTOR,
          z: s.z * CLUSTER_FACTOR,
        }));
    }
    return f;
  }, [
    rawStars,
    dob,
    dod,
    country,
    coordX,
    coordY,
    coordZ,
    searchQuery,
    showOnlyMine,
  ]);

  const highlightIds = useMemo(
    () => (showOnlyMine ? stars.map((s) => s._id) : []),
    [stars, showOnlyMine]
  );

  // ─── Center on cluster ────────────────
  useEffect(() => {
    if (!camRef.current || stars.length === 0) return;
    const center = stars
      .reduce(
        (acc, s) => acc.add(new THREE.Vector3(s.x, s.y, s.z)),
        new THREE.Vector3()
      )
      .divideScalar(stars.length);

    const maxD = Math.max(
      ...stars.map((s) =>
        new THREE.Vector3(s.x, s.y, s.z).distanceTo(center)
      )
    );
    const dist = maxD * 1.5 + 50;
    camPos.current.set(center.x, center.y, center.z + dist);
    camRef.current.position.copy(camPos.current);
    camRef.current.lookAt(center);
  }, [stars]);

  // ─── Jump to selectedStarId ────────────
  useEffect(() => {
    if (
      !camRef.current ||
      !scene ||
      stars.length === 0 ||
      !selectedStarId
    )
      return;
    const t = stars.find((s) => s._id === selectedStarId);
    if (t) {
      const center = new THREE.Vector3(t.x, t.y, t.z);
      const offset = 20;
      camPos.current.set(center.x, center.y, center.z + offset);
      camRef.current.position.copy(camPos.current);
      camRef.current.lookAt(center);
      useFilterStore.getState().setFilters({ selectedStarId: null });
    }
  }, [selectedStarId, stars, scene]);

  // ─── Three.js setup ───────────────────
  const createScene = async (gl: any) => {
    const renderer = new Renderer({ gl, preserveDrawingBuffer: true });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const sc = new THREE.Scene();
    sc.background = new THREE.Color(0x000000);
    sc.fog = new THREE.Fog(0x000000, 200, 1200);
    renderer.setClearColor(sc.background);

    // point-cloud
    const count = 1000;
    const posArr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      posArr[3 * i] = (Math.random() - 0.5) * 2000;
      posArr[3 * i + 1] = (Math.random() - 0.5) * 2000;
      posArr[3 * i + 2] = (Math.random() - 0.5) * 1500;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });
    sc.add(new THREE.Points(geo, mat));

    setScene(sc);

    const cam = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      10000
    );
    cam.position.copy(camPos.current);
    camRef.current = cam;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(sc, cam));
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(gl.drawingBufferWidth, gl.drawingBufferHeight),
        3,
        1,
        0
      )
    );

    const loop = () => {
      requestAnimationFrame(loop);
      cam.position.copy(camPos.current);
      cam.rotation.x = camRot.current.x;
      cam.rotation.y = camRot.current.y;
      composer.render();
      gl.endFrameEXP();
    };
    loop();
  };

  // ─── Touch & zoom / overlay ─────────────
  const ray = new Raycaster();
  const touch = new Vector2();
  const pan = useRef(
    setupControls({ cameraPosition: camPos, cameraRotation: camRot })
  ).current;

  // helper to show-and-fade toast
  const showToast = (msg: string) => {
    setToast(msg);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setToast(null));
  };
  
  const handleTouch = async (e: any) => {
    if (!scene || !camRef.current) return;

    touch.x = (e.locationX / width) * 2 - 1;
    touch.y = -(e.locationY / height) * 2 + 1;
    ray.setFromCamera(touch, camRef.current);

    const hits = ray.intersectObjects(scene.children, true);
    const hit = hits.find((h) => h.object.userData?.id);
    if (!hit) return;

    const id = hit.object.userData.id as string;
    const star = rawStars.find((s) => s._id === id);

    // eerste klik: zoom+overlay
    if (!overlayStar) {
      prevCamPos.current.copy(camPos.current);
      prevCamRot.current = { ...camRot.current };

      const starPos = new THREE.Vector3();
      hit.object.getWorldPosition(starPos);

      const dir = new THREE.Vector3();
      camRef.current.getWorldDirection(dir);

      const newPos = starPos.clone().sub(dir.multiplyScalar(FOCUS_DISTANCE));
      camPos.current.copy(newPos);
      camRef.current.position.copy(newPos);
      camRef.current.lookAt(starPos);

      setOverlayStar({ id, publicName: star?.publicName ?? "Unknown" });
      return;
    }

    // tweede klik: navigatie
    if (overlayStar.id === id) {
      try {
        const res = await api.get(`/stars/${id}/three-d-rooms`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          router.push({
            pathname: "/(app)/explores/public-spaces/room",
            params: { starId: id },
          });
        } else {
          // public star, but no rooms
          showToast("Star is not public");
        }
      } catch (err: any) {
        const status = err.response?.status;
        console.log("→ three-d-rooms error:", status, err.response?.data);
        if (status === 404) {
          // no public rooms endpoint or not public at all
          showToast("Star is not public");
        } else if (status === 403) {
          showToast("Star is not for you");
        } else {
          showToast(`Error ${status ?? ""}: ${err.message}`);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <GLView
        style={styles.gl}
        onContextCreate={createScene}
        onTouchEnd={(e) => handleTouch(e.nativeEvent)}
        {...(!overlayStar ? pan.panHandlers : {})}
      />

      <View style={styles.cross}>
        <Text style={styles.plus}>+</Text>
      </View>

      {/* Back-icon linkboven als overlay open */}
      {overlayStar && (
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => {
            camPos.current.copy(prevCamPos.current);
            camRot.current = { ...prevCamRot.current };
            if (camRef.current) {
              camRef.current.position.copy(prevCamPos.current);
              camRef.current.rotation.x = prevCamRot.current.x;
              camRef.current.rotation.y = prevCamRot.current.y;
            }
            setOverlayStar(null);
          }}
        >
          <Text style={styles.backIconText}>←</Text>
        </TouchableOpacity>
      )}

      {/* Overlay met publicName */}
      {overlayStar && (
        <View style={styles.overlayBadge}>
          <Text style={styles.overlayText}>{overlayStar.publicName}</Text>
        </View>
      )}

      {/* Alleen joystick als overlay gesloten */}
      {!overlayStar && (
        <JoystickHandler
          cameraPosition={camPos}
          cameraRotation={camRot}
        />
      )}

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
          highlightIds={highlightIds}
        />
      )}

      {toast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
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
  backIcon: {
    position: "absolute",
    top: 80,
    left: 20,
    zIndex: 20,
  },
  backIconText: {
    fontSize: 28,
    color: "#fff",
  },
  overlayBadge: {
    position: "absolute",
    bottom: 250,
    left: width / 2 - 100,
    width: 200,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 6,
    alignItems: "center",
    zIndex: 20,
  },
  overlayText: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
  },
  spinner: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -15,
  },
  toast: {
    position: "absolute",
    top: 200,
    left: "50%",
    transform: [{ translateX: -100 }],
    width: 200,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 4,
    fontFamily: "Alice-Regular",
    alignItems: "center",
    zIndex: 50,
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
  },
});