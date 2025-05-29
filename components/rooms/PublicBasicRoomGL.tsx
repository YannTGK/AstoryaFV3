// components/rooms/PublicBasicRoomGL.tsx
import React, { useRef, useEffect } from "react";
import { View, PanResponder } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as FileSystem from "expo-file-system";

// suppress GLTFLoader texture warnings in React Native
const _origConsoleError = console.error.bind(console);
console.error = (...args: any[]) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("THREE.GLTFLoader: Couldn't load texture")
  ) {
    return;
  }
  _origConsoleError(...args);
};

const REMOTE_GLB =
  "https://raw.githubusercontent.com/YannTGK/GlbFIle/main/room_final.glb";
const LOCAL_GLB = FileSystem.cacheDirectory + "room_final.glb";

type Props = {
  initialCameraPosition?: [number, number, number];
  initialCameraTarget?: [number, number, number];
  onMeshClick?: (mesh: THREE.Mesh) => void;
};

export default function PublicBasicRoomGL({
  initialCameraPosition = [0, 16, 20],
  initialCameraTarget = [10, 3, 0],
  onMeshClick,
}: Props) {
  const loopRef = useRef<number>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const sceneRef = useRef<THREE.Scene>();
  const raycasterRef = useRef(new THREE.Raycaster());
  const layoutRef = useRef<{ x: number; y: number; w: number; h: number }>({
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  });
  const targetRef = useRef(new THREE.Vector3(...initialCameraTarget));

  // pan controls for yaw/pitch
  const yawRef = useRef(0);
  const pitchRef = useRef(0);

  // if set, we will focus this mesh next frame
  const focusMeshRef = useRef<THREE.Mesh | null>(null);

  const panResponder = useRef(
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
    const renderer = new Renderer({ gl, preserveDrawingBuffer: true });
    renderer.setSize(w, h);
    renderer.setClearColor(0xffffff, 1);

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(...initialCameraPosition);
    camera.lookAt(targetRef.current);
    cameraRef.current = camera;

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.2);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(5, 10, 7);
    scene.add(dir);
    const point = new THREE.PointLight(0xffffff, 0.8, 30);
    point.position.set(0, 8, 0);
    scene.add(point);

    // Load GLB with caching
    try {
      const info = await FileSystem.getInfoAsync(LOCAL_GLB);
      if (!info.exists) {
        await FileSystem.downloadAsync(REMOTE_GLB, LOCAL_GLB);
      }
      const gltf = await new GLTFLoader().loadAsync(LOCAL_GLB);
      gltf.scene.traverse((obj) => {
        if ((obj as any).isMesh) {
          const mesh = obj as THREE.Mesh;
          const baseColor =
            (mesh.material as any).color?.getHex() ?? 0x888888;
          mesh.material = new THREE.MeshStandardMaterial({
            color: baseColor,
            metalness: 0,
            roughness: 1,
          });
        }
      });
      scene.add(gltf.scene);
    } catch {
      // fallback cube
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      cube.name = "cube";
      scene.add(cube);
    }

    // Render loop
    const render = () => {
      loopRef.current = setTimeout(render, 16);

      const cam = cameraRef.current!;
      cam.position.set(...initialCameraPosition);
      cam.lookAt(targetRef.current);

      // orbit adjustments
      cam.rotateY(yawRef.current);
      cam.rotateX(pitchRef.current);
      cam.updateProjectionMatrix();

      // if we have a focus target, reposition camera above it
      if (focusMeshRef.current) {
        const mesh = focusMeshRef.current;
        const pos = new THREE.Vector3();
        mesh.getWorldPosition(pos);
        // move camera directly above
        cam.position.set(pos.x, pos.y + 10, pos.z);
        cam.lookAt(pos);
        focusMeshRef.current = null;
      }

      renderer.render(scene, cam);
      gl.endFrameEXP();
    };
    render();
  };

  function handleTouch(event: React.TouchEvent) {
    const { pageX, pageY } = event.nativeEvent;
    const { x, y, w, h } = layoutRef.current;
    const ndcX = ((pageX - x) / w) * 2 - 1;
    const ndcY = -((pageY - y) / h) * 2 + 1;

    const ray = raycasterRef.current;
    ray.setFromCamera({ x: ndcX, y: ndcY }, cameraRef.current!);
    const hits = ray.intersectObjects(sceneRef.current!.children, true);
    if (!hits.length) return;

    const mesh = hits[0].object as THREE.Mesh;
    // if it's one of our target names, focus on it:
    if (mesh.name === "Cube" || mesh.name === "Cube_1") {
      focusMeshRef.current = mesh;
    }
    onMeshClick?.(mesh);
  }

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(e) => {
        const { x, y, width, height } = e.nativeEvent.layout;
        layoutRef.current = { x, y, w: width, h: height };
      }}
    >
      <GLView
        style={{ flex: 1 }}
        onContextCreate={onContextCreate}
        {...panResponder.panHandlers}
        onTouchEnd={handleTouch}
      />
    </View>
  );
}