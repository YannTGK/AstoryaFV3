// components/stars/StarView.tsx

import React, { useCallback, useEffect, useRef } from "react";
import { GLView } from "expo-gl";
import { PixelRatio } from "react-native";
import { Renderer } from "expo-three";
import * as THREE from "three";
import ThreeGLTFLoader from "@/Loaders/GLTFLoaderWrapper";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const _origConsoleError = console.error;
console.error = (...args: any[]) => {
  const first = args[0];
  if (typeof first === "string" && first.includes("WeakMap key must be an Object")) {
    return; // swallow this one
  }
  _origConsoleError(...args);
};

export type StarViewProps = {
  emissive?: THREE.ColorRepresentation;
  size?: number;
  rotate?: boolean;
  style?: object;
};

let cachedGLTF: THREE.Object3D | null = null;

export default function StarView({
  emissive = 0xffffff,
  size = 300,
  rotate = true,
  style,
}: StarViewProps) {
  const starRef = useRef<THREE.Object3D | null>(null);
  const frameRef = useRef<number | null>(null);

  const onContextCreate = useCallback(
    async (gl: ExpoWebGLRenderingContext) => {
      // 1. Renderer
      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x000000, 0); // transparent
  
      // 2. Scene & Camera
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 10);
      scene.add(camera);
  
      // 3. Load GLTF (cached)
      if (!cachedGLTF) {
        try {
          const loader = new ThreeGLTFLoader(); // no args
          const gltf: any = await new Promise((resolve, reject) => {
            loader.load(
              "https://cdn.jsdelivr.net/gh/YannTGK/GlbFIle@main/star.glb",
              resolve,
              undefined,
              reject
            );
          });
          cachedGLTF = gltf.scene;
        } catch {
          return; // abort if load fails
        }
      }
  
      // 4. Clone, position & scale
      const star = cachedGLTF.clone();
      starRef.current = star;
      star.position.set(0, 0, 0);
      star.rotation.x = -Math.PI / 2;
      star.scale.set(3.2, 3.2, 3.2);
      scene.add(star);
  
      // 5. Camera lookAt origin
      camera.lookAt(0, 0, 0);
  
      // 6. Emissive material
      star.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const m = o.material as THREE.MeshStandardMaterial;
          m.color.set(0xffffff);
          m.emissive.set(emissive as any);
          m.emissiveIntensity = 1.0;
          m.needsUpdate = true;
        }
      });
  
      // 7. Bloom composer
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(
        new UnrealBloomPass(
          new THREE.Vector2(gl.drawingBufferWidth, gl.drawingBufferHeight),
          1.2,
          0.5,
          0
        )
      );
  
      // 8. Render loop
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        if (rotate && star) star.rotation.z += 0.005;
        composer.render();
        gl.endFrameEXP();
      };
      animate();
    },
    [rotate, emissive]
  );

  // Update emissive color if prop changes
  useEffect(() => {
    if (!starRef.current) return;
    starRef.current.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        const m = o.material as THREE.MeshStandardMaterial;
        m.emissive.set(emissive as any);
        m.needsUpdate = true;
      }
    });
  }, [emissive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <GLView
      style={[{ width: size, height: size, backgroundColor: "transparent" }, style]}
      onContextCreate={onContextCreate}
    />
  );
}