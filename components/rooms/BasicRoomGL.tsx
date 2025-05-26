// components/rooms/BasicRoomGL.tsx
import React, { useRef, useEffect } from "react";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as FileSystem from "expo-file-system";

const REMOTE_GLB =
  "https://raw.githubusercontent.com/YannTGK/GlbFIle/main/room_final.glb";
const LOCAL_GLB = FileSystem.cacheDirectory + "room_final.glb";

export default function BasicRoomGL() {
  const loopRef = useRef<NodeJS.Timeout>();
  useEffect(() => () => clearTimeout(loopRef.current!), []);

  const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
    console.log("🟢  GL context created");

    // 1) Setup renderer & scene
    const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;
    const renderer = new Renderer({ gl });
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 1);
    const scene = new THREE.Scene();

    // 2) Camera
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(0, 1.6, 3);

    // 3) Lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    // 4) Download GLB if needed
    try {
      const info = await FileSystem.getInfoAsync(LOCAL_GLB);
      console.log(`💾  Cache exists? ${info.exists}`);
      if (!info.exists) {
        console.log("⬇️  Downloading GLB…");
        await FileSystem.downloadAsync(REMOTE_GLB, LOCAL_GLB);
        console.log("✅  GLB saved to cache");
      }
    } catch (e) {
      console.error("❌  FileSystem error:", e);
    }

    // 5) Patch console.error to swallow texture errors
    const origError = console.error.bind(console);
    console.error = (...args: any[]) => {
      const msg = `${args[0]}`;
      if (msg.includes("THREE.GLTFLoader: Couldn't load texture")) {
        // swallow exactly those errors
        return;
      }
      origError(...args);
    };

    // 6) Load model
    try {
      console.log("🔄  Loading GLB…");
      const gltf = await new GLTFLoader().loadAsync(LOCAL_GLB);
      console.log("✅  GLB loaded, children:", gltf.scene.children.length);

      // override materials to use simple color
      gltf.scene.traverse((obj) => {
        if ((obj as any).isMesh) {
          const mesh = obj as THREE.Mesh;
          // preserve base color if available
          const baseColor =
            // @ts-ignore
            mesh.material?.color?.getHex() ?? 0x888888;
          mesh.material = new THREE.MeshStandardMaterial({
            color: baseColor,
            metalness: 0.3,
            roughness: 0.7,
          });
          mesh.castShadow = mesh.receiveShadow = true;
        }
      });

      scene.add(gltf.scene);
    } catch (e) {
      console.error("❌  GLTF load error:", e);
      // fallback cube
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      scene.add(cube);
    } finally {
      // restore console.error
      console.error = origError;
    }

    // 7) Render loop
    const render = () => {
      loopRef.current = setTimeout(render, 16);
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
    console.log("▶️  Render loop started");
  };

  return <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />;
}