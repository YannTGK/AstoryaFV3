// StarView.tsx ───────────────────────────────────────────────────────────
import React, { useCallback, useEffect, useRef } from "react";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

/*──────────────────────────────
 * Component props
 *─────────────────────────────*/
export type StarViewProps = {
  /** Bloom colour (hex number **0xffedaa**, string `"ffedaa"` or CSS‐style `"#ffedaa"`) */
  emissive?: THREE.ColorRepresentation;
  /** Square size in px */
  size?: number;
  /** Set `false` if you need a still thumbnail */
  rotate?: boolean;
  /** Forward any React Native style */
  style?: object;
};

/*──────────────────────────────
 * Module‑level GLTF cache
 *─────────────────────────────*/
let cachedGLTF: THREE.Object3D | null = null; // lives for the lifetime of the JS bundle

/*──────────────────────────────
 * StarView component
 *─────────────────────────────*/
export default function StarView({
  emissive = 0xffffff,
  size = 300,
  rotate = true,
  style,
}: StarViewProps) {
  const starRef = useRef<THREE.Object3D>();     // this component’s mesh clone
  const frameRef = useRef<number>();            // rAF id so we can cancel on unmount

  /*────────────────────────────
   * 1. Create GL context + scene
   *───────────────────────────*/
  const onContextCreate = useCallback(
    async (gl: ExpoWebGLRenderingContext) => {
      /* renderer -------------------------------------------------------*/
      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x000000, 0);

      /* scene ----------------------------------------------------------*/
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      );
      camera.position.z = 7;
      scene.add(new THREE.AmbientLight(0xffffff, 1.5));

      /* mesh (clone of cached GLTF) ------------------------------------*/
      if (!cachedGLTF) {
        const root = await new GLTFLoader().loadAsync(
          "https://cdn.jsdelivr.net/gh/YannTGK/GlbFIle@main/star.glb"
        );
        cachedGLTF = root.scene;
      }
      starRef.current = cachedGLTF.clone();
      starRef.current!.rotation.x = -Math.PI / 2;
      starRef.current!.scale.set(3.2, 3.2, 3.2);
      scene.add(starRef.current);

      /* initial material setup */
      starRef.current.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          const mat = obj.material as THREE.MeshStandardMaterial;
          mat.color.set(0xffffff);
          mat.emissive.set(emissive as any);
          mat.emissiveIntensity = 1.5;
        }
      });

      /* post‑processing -----------------------------------------------*/
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(
        new UnrealBloomPass(
          new THREE.Vector2(gl.drawingBufferWidth, gl.drawingBufferHeight),
          0.9,
          0.3,
          0
        )
      );

      /* render loop ----------------------------------------------------*/
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        if (rotate && starRef.current) starRef.current.rotation.z += 0.005;
        composer.render();
        gl.endFrameEXP();
      };
      animate();
    },
    [rotate, emissive]
  );

  /*────────────────────────────
   * 2. Update material on prop change
   *───────────────────────────*/
  useEffect(() => {
    if (!starRef.current) return;

    starRef.current.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mat = obj.material as THREE.MeshStandardMaterial;

        // accept 0xaabbcc | "aabbcc" | "#aabbcc"
        const color = typeof emissive === "string" && emissive.startsWith("#")
          ? emissive
          : typeof emissive === "string"
            ? `#${emissive.replace(/^0x/i, "")}`
            : emissive;

        mat.emissive.set(color as any);
        mat.needsUpdate = true; // ensure WebGL gets the new uniform
      }
    });
  }, [emissive]);

  /*────────────────────────────
   * 3. Cleanup on unmount
   *───────────────────────────*/
  useEffect(() => {
    return () => frameRef.current && cancelAnimationFrame(frameRef.current);
  }, []);

  /*────────────────────────────
   * 4. Render GLView
   *───────────────────────────*/
  return (
    <GLView
      style={[
        { width: size, height: size, backgroundColor: "transparent" },
        style,
      ]}
      onContextCreate={onContextCreate}
    />
  );
}