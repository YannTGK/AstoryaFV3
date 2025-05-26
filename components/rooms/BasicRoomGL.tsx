// components/rooms/BasicRoomGL.tsx
import React, { useRef, useEffect } from "react";
import { View, PanResponder } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as FileSystem from "expo-file-system";

const REMOTE_GLB = "https://raw.githubusercontent.com/YannTGK/GlbFIle/main/room_final.glb";
const LOCAL_GLB = FileSystem.cacheDirectory + "room_final.glb";

export default function BasicRoomGL() {
  const loopRef = useRef<number>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();

  // Gebruik refs voor yaw/pitch (camera rotatie)
  const yawRef = useRef(0);
  const pitchRef = useRef(0);

  // PanResponder om yaw/pitch te muteren
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_evt, { dx, dy }) => {
        yawRef.current -= dx * 0.00015;
        pitchRef.current = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, pitchRef.current - dy * 0.00015)
        );
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  useEffect(() => {
    return () => {
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, []);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;
    const renderer = new Renderer({ gl });
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 1);

    const scene = new THREE.Scene();

    // Camera initiëren op vaste positie
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(-10, 10, 10);

    // Lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    // Model laden
    try {
      const info = await FileSystem.getInfoAsync(LOCAL_GLB);
      if (!info.exists) {
        await FileSystem.downloadAsync(REMOTE_GLB, LOCAL_GLB);
      }
      const gltf = await new GLTFLoader().loadAsync(LOCAL_GLB);
      gltf.scene.traverse((obj) => {
        if ((obj as any).isMesh) {
          const mesh = obj as THREE.Mesh;
          const baseColor = (mesh.material as any).color?.getHex() ?? 0x888888;
          mesh.material = new THREE.MeshStandardMaterial({ color: baseColor, metalness: 0, roughness: 1 });
        }
      });
      scene.add(gltf.scene);
    } catch (e) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      scene.add(cube);
    }

    // Render loop
    const render = () => {
      loopRef.current = setTimeout(render, 16);
      const cam = cameraRef.current!;
      // Camera blijft op (-10,10,10)
      cam.position.set(-10, 10, 10);
      // Rotatie instellen volgens yaw/pitch
      cam.rotation.order = "YXZ";
      cam.rotation.y = yawRef.current;
      cam.rotation.x = pitchRef.current;
      cam.updateProjectionMatrix();

      renderer.render(scene, cam);
      gl.endFrameEXP();
    };
    render();
  };

  return (
    <View style={{ flex: 1 }}>
      <GLView
        style={{ flex: 1 }}
        onContextCreate={onContextCreate}
        {...pan.panHandlers}
      />
    </View>
  );
}
