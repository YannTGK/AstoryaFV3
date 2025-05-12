// app/(app)/explores/private/index.tsx
import React, { useEffect, useRef, useState } from "react";
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

import PhotosIcon from "@/assets/images/svg-icons/photos.svg";
import VideosIcon from "@/assets/images/svg-icons/videos.svg";
import AudiosIcon from "@/assets/images/svg-icons/audios.svg";
import MessagesIcon from "@/assets/images/svg-icons/messages.svg";
import DocumentsIcon from "@/assets/images/svg-icons/documents.svg";
import BookIcon from "@/assets/images/svg-icons/book-of-life.svg";
import VRIcon from "@/assets/images/svg-icons/3D-VR-space.svg";

const { width, height } = Dimensions.get("window");
// Cluster-factor om alle sterren dichter bij elkaar te brengen
const CLUSTER_FACTOR = 0.25;

export default function PrivateScreen() {
  // camera refs
  const cameraRotation = useRef({ x: 0, y: 0 });
  const cameraPosition = useRef({ x: 0, y: 0, z: 10 });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // scene & stars
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [stars, setStars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // overlay state
  const [selectedStarName, setSelectedStarName] = useState<string | null>(null);
  const [iconPos, setIconPos] = useState<{ x: number; y: number }[]>([]);
  const [isStarSelected, setIsStarSelected] = useState(false);
  const [joystickKey, setJoystickKey] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [originalScale, setOriginalScale] =
    useState<THREE.Vector3 | null>(null);

  // voor terugkeren camera
  const prevCamPos = useRef(new THREE.Vector3());
  const targetPos = useRef(new THREE.Vector3(0, 0, 10));
  const camLocked = useRef(false);

  const setIsSearching = useLayoutStore((s) => s.setIsSearching);

  // overlay icons
  const iconSize = 65;
  const iconOffset = iconSize / 2;
  const icons = [
    <PhotosIcon key="p" width={iconSize} height={iconSize} />,
    <VideosIcon key="v" width={iconSize} height={iconSize} />,
    <AudiosIcon key="a" width={iconSize} height={iconSize} />,
    <MessagesIcon key="m" width={iconSize} height={iconSize} />,
    <DocumentsIcon key="d" width={iconSize} height={iconSize} />,
    <BookIcon key="b" width={iconSize} height={iconSize} />,
    <VRIcon key="vr" width={iconSize} height={iconSize} />,
  ];

  // 1️⃣ Haal private sterren op en cluster ze
  useEffect(() => {
    (async () => {
      try {
        const { stars: raw } = (await api.get("/stars/private")).data;
        const clustered = raw.map((s: any) => ({
          ...s,
          x: s.x * CLUSTER_FACTOR,
          y: s.y * CLUSTER_FACTOR,
          z: s.z * CLUSTER_FACTOR,
        }));
        setStars(clustered);
      } catch (e) {
        console.error("private stars:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2️⃣ Center camera op het cluster van sterren
  useEffect(() => {
    if (!cameraRef.current || stars.length === 0) return;

    // bereken zwaartepunt
    const center = stars.reduce(
      (acc, s) => {
        acc.x += s.x;
        acc.y += s.y;
        acc.z += s.z;
        return acc;
      },
      { x: 0, y: 0, z: 0 }
    );
    center.x /= stars.length;
    center.y /= stars.length;
    center.z /= stars.length;

    // bepaal maximale afstand
    const maxDist = Math.max(
      ...stars.map((s) =>
        Math.hypot(s.x - center.x, s.y - center.y, s.z - center.z)
      )
    );

    // veilige afstand zodat alles in beeld is
    const safeDistance = maxDist * 1.5 + 20;

    cameraPosition.current = {
      x: center.x,
      y: center.y,
      z: center.z + safeDistance,
    };
    cameraRef.current.position.set(
      center.x,
      center.y,
      center.z + safeDistance
    );
    cameraRef.current.lookAt(new THREE.Vector3(center.x, center.y, center.z));
  }, [stars]);

  // controls
  const panResponder = useRef(
    setupControls({ cameraPosition, cameraRotation })
  ).current;

  const raycaster = new Raycaster();
  const touch = new Vector2();

  // 3️⃣ Complete handleTouch (met overlay en terugbeweging)
  const handleTouch = (e: any) => {
    if (!scene || !cameraRef.current) return;
    const { locationX, locationY } = e;
    touch.x = (locationX / width) * 2 - 1;
    touch.y = -(locationY / height) * 2 + 1;
    raycaster.setFromCamera(touch, cameraRef.current);
    const hits = raycaster.intersectObjects(scene.children, true);
    if (!hits.length) return;

    let obj = hits[0].object;
    while (obj && !obj.userData?.id && obj.parent) obj = obj.parent;
    const id = obj.userData?.id;
    if (!id) return;

    // sluit overlay bij tweede klik
    if (id === activeId) {
      if (originalScale) obj.scale.copy(originalScale);
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

    // open overlay + camera naar de ster
    const star = stars.find((s) => s._id === id);
    prevCamPos.current.copy(cameraRef.current.position);

    setSelectedStarName(star?.publicName ?? "Naam ontbreekt");
    setIsStarSelected(true);
    setActiveId(id);
    setOriginalScale(obj.scale.clone());
    setIsSearching(false);

    const worldPos = obj.getWorldPosition(new THREE.Vector3());
    targetPos.current.copy(worldPos.add(new THREE.Vector3(0, -1, 10)));
    camLocked.current = true;
    obj.scale.setScalar(obj.scale.x * 0.7);

    // spreid de iconen rondom de ster
    const yOff = -40,
      r = 140;
    setIconPos(
      Array.from({ length: 7 }, (_, i) => ({
        x: width / 2 + r * Math.cos((i / 7) * 2 * Math.PI),
        y: height / 2 + yOff + r * Math.sin((i / 7) * 2 * Math.PI),
      }))
    );
  };

  // three.js init
  const createScene = async (gl: any) => {
    const renderer = new Renderer({ gl, preserveDrawingBuffer: true });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const newScene = new THREE.Scene();
    setScene(newScene);

    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      10000
    );
    camera.position.set(
      cameraPosition.current.x,
      cameraPosition.current.y,
      cameraPosition.current.z
    );
    cameraRef.current = camera;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(newScene, camera));
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
      if (camLocked.current) {
        camera.position.lerp(targetPos.current, 0.1);
        if (camera.position.distanceTo(targetPos.current) < 0.01) {
          camLocked.current = false;
          cameraPosition.current = {
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
          };
        }
      } else {
        camera.position.set(
          cameraPosition.current.x,
          cameraPosition.current.y,
          cameraPosition.current.z
        );
      }
      camera.rotation.x = cameraRotation.current.x;
      camera.rotation.y = cameraRotation.current.y;
      composer.render();
      gl.endFrameEXP();
    };
    loop();
  };

  return (
    <View style={styles.container}>
      <GLView
        style={styles.gl}
        onContextCreate={createScene}
        onTouchEnd={(e) => handleTouch(e.nativeEvent)}
        {...(!isStarSelected ? panResponder.panHandlers : {})}
      />

      {/* crosshair */}
      <View style={styles.cross}>
        <Text style={styles.plus}>+</Text>
      </View>

      {/* joystick */}
      {!isStarSelected && (
        <JoystickHandler
          key={joystickKey}
          cameraPosition={cameraPosition}
          cameraRotation={cameraRotation}
        />
      )}

      {/* loading */}
      {(loading || !scene) && (
        <ActivityIndicator style={styles.spinner} size="large" color="#fff" />
      )}

      {/* sterren */}
      {scene && stars.length > 0 && (
        <StarsManager scene={scene} stars={stars} />
      )}

      {/* overlay naam */}
      {selectedStarName && (
        <View style={styles.nameWrap}>
          <Text style={styles.name}>{selectedStarName}</Text>
        </View>
      )}

      {/* overlay icons */}
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