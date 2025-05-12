import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
} from "react-native";
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

/* icoontjes voor overlay */
import PhotosIcon from "@/assets/images/svg-icons/photos.svg";
import VideosIcon from "@/assets/images/svg-icons/videos.svg";
import AudiosIcon from "@/assets/images/svg-icons/audios.svg";
import MessagesIcon from "@/assets/images/svg-icons/messages.svg";
import DocumentsIcon from "@/assets/images/svg-icons/documents.svg";
import BookIcon from "@/assets/images/svg-icons/book-of-life.svg";
import VRIcon from "@/assets/images/svg-icons/3D-VR-space.svg";

const { width, height } = Dimensions.get("window");
// cluster-factor om sterren bij elkaar te brengen
const CLUSTER_FACTOR = 0.25;

export default function PrivateScreen() {
  // camera refs
  const cameraRotation = useRef({ x: 0, y: 0 });
  const cameraPosition = useRef({ x: 0, y: 0, z: 10 });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // raw data + scene
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [rawStars, setRawStars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // filters & jump-to-star uit de store
  const { dob, dod, country, coordX, coordY, coordZ, searchQuery, selectedStarId } =
    useFilterStore();
  const setFilters = useFilterStore((s) => s.setFilters);

  // overlay-state
  const [selectedStarName, setSelectedStarName] = useState<string | null>(null);
  const [iconPos, setIconPos] = useState<{ x: number; y: number }[]>([]);
  const [isStarSelected, setIsStarSelected] = useState(false);
  const [joystickKey, setJoystickKey] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [originalScale, setOriginalScale] = useState<THREE.Vector3 | null>(null);

  // voor terugkeren camera
  const prevCamPos = useRef(new THREE.Vector3());
  const targetPos = useRef(new THREE.Vector3(0, 0, 10));
  const camLocked = useRef(false);

  const setIsSearching = useLayoutStore((s) => s.setIsSearching);

  // overlay-icoontjes
  const iconSize = 65,
    iconOffset = iconSize / 2;
  const icons = [
    <PhotosIcon key="p" width={iconSize} height={iconSize} />,
    <VideosIcon key="v" width={iconSize} height={iconSize} />,
    <AudiosIcon key="a" width={iconSize} height={iconSize} />,
    <MessagesIcon key="m" width={iconSize} height={iconSize} />,
    <DocumentsIcon key="d" width={iconSize} height={iconSize} />,
    <BookIcon key="b" width={iconSize} height={iconSize} />,
    <VRIcon key="vr" width={iconSize} height={iconSize} />,
  ];

  // ─── 1️⃣ Haal raw sterren op
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

  // ─── 2️⃣ Cluster en filter / zoek
  const stars = useMemo(() => {
    let f = rawStars.map((s) => ({
      ...s,
      x: s.x * CLUSTER_FACTOR,
      y: s.y * CLUSTER_FACTOR,
      z: s.z * CLUSTER_FACTOR,
    }));
    const near = (v: number, t: number, m = 2) => Math.abs(v - t) <= m;

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
    if (country) {
      f = f.filter((s) => s.user?.country === country);
    }
    if (coordX) {
      const x = parseFloat(coordX.replace(",", "."));
      !isNaN(x) && (f = f.filter((s) => near(s.x, x)));
    }
    if (coordY) {
      const y = parseFloat(coordY.replace(",", "."));
      !isNaN(y) && (f = f.filter((s) => near(s.y, y)));
    }
    if (coordZ) {
      const z = parseFloat(coordZ.replace(",", "."));
      !isNaN(z) && (f = f.filter((s) => near(s.z, z)));
    }
    if (searchQuery) {
      const q = searchQuery.trim().toLowerCase();
      f = f.filter((s) => s.publicName.toLowerCase().includes(q));
    }
    return f;
  }, [rawStars, dob, dod, country, coordX, coordY, coordZ, searchQuery]);

  // ─── 3️⃣ Center camera op de cluster
  useEffect(() => {
    if (!cameraRef.current || stars.length === 0) return;

    const c = stars.reduce(
      (acc, s) => {
        acc.x += s.x;
        acc.y += s.y;
        acc.z += s.z;
        return acc;
      },
      { x: 0, y: 0, z: 0 }
    );
    c.x /= stars.length;
    c.y /= stars.length;
    c.z /= stars.length;

    const maxD = Math.max(
      ...stars.map((s) => Math.hypot(s.x - c.x, s.y - c.y, s.z - c.z))
    );
    const safeDist = maxD * 1.5 + 20;

    cameraPosition.current = { x: c.x, y: c.y, z: c.z + safeDist };
    cameraRef.current.position.set(c.x, c.y, c.z + safeDist);
    cameraRef.current.lookAt(new THREE.Vector3(c.x, c.y, c.z));
  }, [stars]);

  // ─── 4️⃣ Jump naar geselecteerde ster
  useEffect(() => {
    if (
      !cameraRef.current ||
      !scene ||
      stars.length === 0 ||
      !selectedStarId
    )
      return;
    const tgt = stars.find((s) => s._id === selectedStarId);
    if (!tgt) return;

    console.log(
      `[JumpToStar] star(${tgt._id}) coords: x=${tgt.x.toFixed(
        2
      )} y=${tgt.y.toFixed(2)} z=${tgt.z.toFixed(2)}`
    );
    console.log(
      `[JumpToStar] camera before: x=${cameraRef.current.position.x.toFixed(
        2
      )} y=${cameraRef.current.position.y.toFixed(
        2
      )} z=${cameraRef.current.position.z.toFixed(2)}`
    );

    cameraRef.current.position.set(tgt.x, tgt.y, tgt.z + 20);
    cameraRef.current.lookAt(new THREE.Vector3(tgt.x, tgt.y, tgt.z));

    console.log(
      `[JumpToStar] camera after: x=${tgt.x.toFixed(
        2
      )} y=${tgt.y.toFixed(2)} z=${(tgt.z + 20).toFixed(2)}`
    );

    // clear selectie
    useFilterStore.getState().setFilters({ selectedStarId: "" });
  }, [selectedStarId, stars, scene]);

  // ─── 5️⃣ Three.js setup
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
      cameraPosition.current.x,
      cameraPosition.current.y,
      cameraPosition.current.z
    );
    cameraRef.current = cam;

    const comp = new EffectComposer(renderer);
    comp.addPass(new RenderPass(sc, cam));
    comp.addPass(
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
      if (camLocked.current) {
        cam.position.lerp(targetPos.current, 0.1);
        if (cam.position.distanceTo(targetPos.current) < 0.01) {
          camLocked.current = false;
          cameraPosition.current = {
            x: cam.position.x,
            y: cam.position.y,
            z: cam.position.z,
          };
        }
      } else {
        cam.position.set(
          cameraPosition.current.x,
          cameraPosition.current.y,
          cameraPosition.current.z
        );
      }
      cam.rotation.x = cameraRotation.current.x;
      cam.rotation.y = cameraRotation.current.y;
      comp.render();
      gl.endFrameEXP();
    };
    loop();
  };

  // ─── 6️⃣ Touch-handler (overlay + terugbeweging)
  const pan = useRef(
    setupControls({ cameraPosition, cameraRotation })
  ).current;
  const ray = new Raycaster();
  const touchPt = new Vector2();

  const handleTouch = (e: any) => {
    if (!scene || !cameraRef.current) return;
    const { locationX, locationY } = e;
    touchPt.x = (locationX / width) * 2 - 1;
    touchPt.y = -(locationY / height) * 2 + 1;
    ray.setFromCamera(touchPt, cameraRef.current);
    const hit = ray.intersectObjects(scene.children, true)[0];
    if (!hit) return;

    let obj: any = hit.object;
    while (obj && !obj.userData?.id && obj.parent) obj = obj.parent;
    const id = obj.userData?.id;
    if (!id) return;

    // sluit overlay op tweede klik
    if (id === activeId) {
      originalScale && obj.scale.copy(originalScale);
      setSelectedStarName(null);
      setIconPos([]);
      setIsStarSelected(false);
      setJoystickKey((k) => k + 1);
      setActiveId(null);
      setOriginalScale(null);
      camLocked.current = true;
      targetPos.current.copy(prevCamPos.current);
      setIsSearching(false);
      return;
    }

    // open overlay + camera naar ster
    const star = stars.find((s) => s._id === id);
    prevCamPos.current.copy(cameraRef.current.position);

    setSelectedStarName(star?.publicName ?? "");
    setIsStarSelected(true);
    setActiveId(id);
    setOriginalScale(obj.scale.clone());
    setIsSearching(false);

    const world = obj.getWorldPosition(new THREE.Vector3());
    targetPos.current.copy(world.add(new THREE.Vector3(0, -1, 10)));
    camLocked.current = true;
    obj.scale.setScalar(obj.scale.x * 0.7);

    const yOff = -40,
      r = 140;
    setIconPos(
      Array.from({ length: 7 }, (_, i) => ({
        x: width / 2 + r * Math.cos((i / 7) * 2 * Math.PI),
        y: height / 2 + yOff + r * Math.sin((i / 7) * 2 * Math.PI),
      }))
    );
  };

  return (
    <View style={styles.container}>
      <GLView
        style={styles.gl}
        onContextCreate={createScene}
        onTouchEnd={(e) => handleTouch(e.nativeEvent)}
        {...(!isStarSelected ? pan.panHandlers : {})}
      />

      <View style={styles.cross}>
        <Text style={styles.plus}>+</Text>
      </View>

      {!isStarSelected && (
        <JoystickHandler
          key={joystickKey}
          cameraPosition={cameraPosition}
          cameraRotation={cameraRotation}
        />
      )}

      {(loading || !scene) && (
        <ActivityIndicator style={styles.spinner} size="large" color="#fff" />
      )}

      {scene && stars.length > 0 && (
        <StarsManager scene={scene} stars={stars} />
      )}

      {selectedStarName && (
        <View style={styles.nameWrap}>
          <Text style={styles.name}>{selectedStarName}</Text>
        </View>
      )}

      {iconPos.map((p, i) => (
        <View
          key={i}
          style={[styles.icon, { top: p.y - iconOffset, left: p.x - iconOffset }]}
        >
          {icons[i]}
        </View>
      ))}
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
  nameWrap: {
    position: "absolute",
    top: height / 2 + 135,
    left: width / 2 - 100,
    width: 200,
    alignItems: "center",
  },
  name: {
    color: "#fff",
    fontFamily: "Alice-Regular",
    fontSize: 16,
  },
  icon: { position: "absolute", zIndex: 99 },
});