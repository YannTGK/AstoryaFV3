import React, { useRef, useEffect } from "react";
import { View, PanResponder } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as FileSystem from "expo-file-system";

// suppress GLTFLoader texture warnings in React Native
const _originalConsoleError = console.error.bind(console);
console.error = (...args: any[]) => {
  const msg = args[0] as string;
  if (typeof msg === 'string' && msg.includes("THREE.GLTFLoader: Couldn't load texture")) {
    return;
  }
  _originalConsoleError(...args);
};

const REMOTE_GLB = "https://raw.githubusercontent.com/YannTGK/GlbFIle/main/room_final.glb";
const LOCAL_GLB = FileSystem.cacheDirectory + "room_final.glb";

type Props = {
  initialCameraPosition?: [number, number, number];
  initialCameraTarget?: [number, number, number];
};

export default function BasicRoomGL({
  initialCameraPosition = [0, 16, 20],
  initialCameraTarget = [10, 3, 0],
}: Props) {
  const loopRef = useRef<number>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3(...initialCameraTarget));

  // yaw/pitch voor vrije rotatie rondom target
  const yawRef = useRef(0);
  const pitchRef = useRef(0);

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
    renderer.setClearColor(0xffffff, 1);

    const scene = new THREE.Scene();

    // camera met instelbare startpositie
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(...initialCameraPosition);
    camera.lookAt(targetRef.current);
    cameraRef.current = camera;

    // lights met warme oranje gloed
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.2);
    scene.add(hemiLight);

    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    const pointLight = new THREE.PointLight(0xffffff, 0.8, 30);
    pointLight.position.set(0, 8, 0);
    scene.add(pointLight);

    // laad GLB (met caching)
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
          mesh.material = new THREE.MeshStandardMaterial({
            color: baseColor,
            metalness: 0,
            roughness: 1,
          });
        }
      });
      scene.add(gltf.scene);
    } catch {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      scene.add(cube);
    }

    // render-loop (bijv. overschakelen naar requestAnimationFrame kan nog)
    const render = () => {
      loopRef.current = setTimeout(render, 16);

      const cam = cameraRef.current!;
      cam.position.set(...initialCameraPosition);
      cam.lookAt(targetRef.current);

      // vrije rotatie rondom target
      cam.rotateY(yawRef.current);
      cam.rotateX(pitchRef.current);
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
