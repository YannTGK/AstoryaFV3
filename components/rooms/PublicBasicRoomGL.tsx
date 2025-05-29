// BasicRoomGL.tsx
import React, { useRef, useEffect, useState } from "react";
import { View, PanResponder, LayoutChangeEvent } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as FileSystem from "expo-file-system";

// suppress GLTFLoader texture warnings
const _origErr = console.error.bind(console);
console.error = (...args: any[]) => {
  const m = args[0] as string;
  if (typeof m === "string" && m.includes("Couldn't load texture")) return;
  _origErr(...args);
};

const REMOTE_GLB =
  "https://raw.githubusercontent.com/YannTGK/GlbFIle/main/room_final.glb";
const LOCAL_GLB = FileSystem.cacheDirectory + "room_final.glb";

// duur van de animatie in ms
const TRANSITION_DURATION = 1000;

export default function BasicRoomGL({
  initialCameraPosition = [0, 16, 20],
  initialCameraTarget = [0, 3, 0],
}: {
  initialCameraPosition?: [number, number, number];
  initialCameraTarget?: [number, number, number];
}) {
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const sceneRef = useRef<THREE.Scene>();
  const targetRef = useRef(new THREE.Vector3(...initialCameraTarget));
  const yawRef = useRef(0);
  const pitchRef = useRef(0);

  // voor touch-lookaround
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_e, { dx, dy }) => {
        yawRef.current -= dx * 0.00015;
        pitchRef.current = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, pitchRef.current - dy * 0.00015)
        );
      },
      onPanResponderRelease: () => {},
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  // animatiestates
  const animStartTime = useRef<number>();
  const fromPos = useRef(new THREE.Vector3());
  const toPos = useRef(new THREE.Vector3(...initialCameraPosition));
  const fromTarget = useRef(new THREE.Vector3());
  const toTarget = useRef(new THREE.Vector3(...initialCameraTarget));

  // start nieuwe animatie wanneer props wijzigen
  useEffect(() => {
    if (!cameraRef.current) return;
    const now = performance.now();
    animStartTime.current = now;
    // begin-waarden
    fromPos.current.copy(cameraRef.current.position);
    toPos.current.set(...initialCameraPosition);
    fromTarget.current.copy(targetRef.current);
    toTarget.current.set(...initialCameraTarget);
    // start animatieloop
    const tick = () => {
      const t0 = animStartTime.current!;
      const t = Math.min((performance.now() - t0) / TRANSITION_DURATION, 1);
      // lerp positie en target
      cameraRef.current!.position.lerpVectors(fromPos.current, toPos.current, t);
      targetRef.current.lerpVectors(fromTarget.current, toTarget.current, t);
      if (t < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, [initialCameraPosition, initialCameraTarget]);

  // GL setup en render-loop
  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;
    const renderer = new Renderer({ gl });
    renderer.setSize(w, h);
    renderer.setClearColor(0xffffff, 1);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(...initialCameraPosition);
    camera.lookAt(targetRef.current);
    cameraRef.current = camera;

    scene.add(new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6));
    const dl = new THREE.DirectionalLight(0xffffff, 1.2);
    dl.position.set(5, 10, 7);
    scene.add(dl);

    // GLB laden
    const info = await FileSystem.getInfoAsync(LOCAL_GLB);
    if (!info.exists) {
      await FileSystem.downloadAsync(REMOTE_GLB, LOCAL_GLB);
    }
    const gltf = await new GLTFLoader().loadAsync(LOCAL_GLB);
    scene.add(gltf.scene);

    // render-loop (draait continu)
    const render = () => {
      // kijk altijd naar de (eventueel geanimeerde) target
      camera.lookAt(targetRef.current);
      // pas yaw/pitch toe
      camera.rotateY(yawRef.current);
      camera.rotateX(pitchRef.current);
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);
      gl.endFrameEXP();
      requestAnimationFrame(render);
    };
    render();
  };

  return (
    <View style={{ flex: 1 }} onLayout={() => {}}>
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} {...pan.panHandlers} />
    </View>
  );
}