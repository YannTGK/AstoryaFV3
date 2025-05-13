import React, { useCallback, useEffect, useRef } from "react";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/*──────────────────────────────
 * Component props
 *─────────────────────────────*/
export type StarViewProps = {
  emissive?: THREE.ColorRepresentation; // Bloom colour
  size?: number;                        // Square size in px
  rotate?: boolean;                     // false ⇒ still thumbnail
  style?: object;                       // React‑Native style override
};

/*──────────────────────────────
 * Module‑level GLTF cache (lifetime = JS bundle)
 *─────────────────────────────*/
let cachedGLTF: THREE.Object3D | null = null;

/*──────────────────────────────
 *  Helper – wrap numeric GL handles so Three can WeakMap‑pen
 *─────────────────────────────*/
function patchNumericHandles(gl: ExpoWebGLRenderingContext) {
  type HandleMap = Map<number, any>;
  // Eén cache per type, we maken die dynamisch aan
  const wrappers: Record<string, HandleMap> = {};

  // Helper om een type (bv. "buffer") te wrappen
  const makePatch = (
    type: string,
    createFn: string,
    deleteFn: string
  ) => {
    // maak bij de eerste keer een cache aan
    if (!wrappers[type]) {
      wrappers[type] = new Map<number, any>();
    }
    const cache = wrappers[type]!;
    const origCreate = (gl as any)[createFn].bind(gl);
    const origDelete = (gl as any)[deleteFn].bind(gl);

    // override createFn
    (gl as any)[createFn] = (...args: any[]) => {
      const handle = origCreate(...args);
      if (typeof handle === "number") {
        let obj = cache.get(handle);
        if (!obj) {
          obj = Object.create(null);
          Object.defineProperty(obj, "__expoHandle", { value: handle });
          cache.set(handle, obj);
        }
        return obj;
      }
      return handle;
    };

    // override deleteFn
    (gl as any)[deleteFn] = (obj: any, ...args: any[]) => {
      // sleutel is ofwel een nummer, of ons wrapper‐object
      const handle =
        typeof obj === "number" ? obj : obj?.__expoHandle ?? obj;
      cache.delete(handle);
      return origDelete(handle, ...args);
    };
  };

  // Doorzoek gl op alle create/delete-paren
  Object.keys(gl).forEach((key) => {
    if (!key.startsWith("create")) return;
    const type = key.slice("create".length);                // bv. "Buffer"
    const deleteFn = "delete" + type;                       // bv. "deleteBuffer"
    if (typeof (gl as any)[deleteFn] !== "function") return; 
    const lowerType = type.charAt(0).toLowerCase() + type.slice(1);
    makePatch(lowerType, key, deleteFn);
  });
}

/*──────────────────────────────
 * StarView component
 *─────────────────────────────*/
export default function StarView({
  emissive = 0xffffff,
  size = 300,
  rotate = true,
  style,
}: StarViewProps) {
  const starRef = useRef<THREE.Object3D>();
  const frameRef = useRef<number>();

  /*────────────────────────────
   * 1. Create GL context + scene
   *───────────────────────────*/
  const onContextCreate = useCallback(
    async (gl: ExpoWebGLRenderingContext) => {
      /* 1.a – patch GL so WeakMap‑errors nooit optreden */
      patchNumericHandles(gl);

      /* renderer -----------------------------------------------------*/
      const renderer = new Renderer({ gl });
      renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
      renderer.setClearColor(0x000000, 0);

      /* scene --------------------------------------------------------*/
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        gl.drawingBufferWidth / gl.drawingBufferHeight,
        0.1,
        1000
      );
      camera.position.z = 7;
      scene.add(new THREE.AmbientLight(0xffffff, 1.5));

      /* mesh (clone of cached GLTF) ----------------------------------*/
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

      // init material
      starRef.current.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const m = o.material as THREE.MeshStandardMaterial;
          m.color.set(0xffffff);
          m.emissive.set(emissive as any);
          m.emissiveIntensity = 1.5;
        }
      });

      /* post‑processing (safe, want WeakMap‑proof) -------------------*/
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

      /* render loop --------------------------------------------------*/
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
    starRef.current.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        const m = o.material as THREE.MeshStandardMaterial;
        const col =
          typeof emissive === "string" && emissive.startsWith("#")
            ? emissive
            : typeof emissive === "string"
            ? `#${emissive.replace(/^0x/i, "")}`
            : emissive;
        m.emissive.set(col as any);
        m.needsUpdate = true;
      }
    });
  }, [emissive]);

  /*────────────────────────────
   * 3. Cleanup on unmount
   *───────────────────────────*/
  useEffect(() => () => frameRef.current && cancelAnimationFrame(frameRef.current), []);

  /*────────────────────────────
   * 4. Render
   *───────────────────────────*/
  return (
    <GLView
      style={[{ width: size, height: size, backgroundColor: "transparent" }, style]}
      onContextCreate={onContextCreate}
    />
  );
}
