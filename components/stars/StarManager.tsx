import { useEffect, useRef } from "react";
import { THREE } from "expo-three";
import ThreeGLTFLoader from "@/Loaders/GLTFLoaderWrapper";

/* ─── Star class ────────────────────────────────────────── */
type StarProps = {
  position: [number, number, number];
  size: [number, number, number];
  id: string;
  color: THREE.Color;
  emissive: THREE.Color;
};

class Star extends THREE.Object3D {
  constructor({ position, size, id, color, emissive }: StarProps) {
    super();
    this.position.set(...position);
    this.rotation.x = -Math.PI / 2;
    this.userData = { id, color, emissive };
    this.loadModel(size).catch(console.error);
  }

  private async loadModel(size: [number, number, number]) {
    const loader = new ThreeGLTFLoader();
    const url =
      "https://cdn.jsdelivr.net/gh/YannTGK/GlbFIle@main/star.glb";

    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(...size);

        const { color, emissive } = this.userData as {
          color: THREE.Color;
          emissive: THREE.Color;
        };

        model.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh && mesh.material) {
            const apply = (m: THREE.MeshStandardMaterial) => {
              m.color.copy(color);
              m.emissive.copy(emissive);
              m.emissiveIntensity = 0.3;
              m.needsUpdate = true;
              return m;
            };
            mesh.material = Array.isArray(mesh.material)
              ? mesh.material.map((mat) => apply(mat.clone()))
              : apply(mesh.material.clone());
          }
          /* userData (id, color, emissive, content) doorkopiëren */
          child.userData = { ...child.userData, ...this.userData };
        });

        this.add(model);
      },
      undefined,
      (e) => console.error("GLB load error:", e)
    );
  }
}

/* ─── Manager ───────────────────────────────────────────── */
type StarsManagerProps = {
  scene : THREE.Scene;
  stars : Array<{
    _id: string;
    x:number; y:number; z:number;
    color:string;
    publicName?:string;
  }>;
};

export default function StarsManager({ scene, stars }: StarsManagerProps) {
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    /* ── opbouwen ─────────────────────────────────────── */
    stars.forEach((s) => {
      const star = new Star({
        position: [s.x, s.y, s.z],
        size: [3, 3, 3],
        id: s._id,
        color: new THREE.Color(s.color),
        emissive: new THREE.Color(s.color),
      });

      star.userData.rotationSpeed = 0.008;
      star.userData.content       = true;   //  ←  BELANGRIJK: maakt ster klikbaar

      scene.add(star);
      starsRef.current.push(star);
    });

    /* ── eenvoudige spin‑animatie ─────────────────────── */
    let frame = 0;
    const spin = () => {
      starsRef.current.forEach(
        (st) => (st.rotation.z += st.userData.rotationSpeed)
      );
      frame = requestAnimationFrame(spin);
    };
    spin();

    /* ── clean‑up ──────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(frame);
      starsRef.current.forEach((st) => scene.remove(st));
      starsRef.current = [];
    };
  }, [scene, stars]);

  return null;
}