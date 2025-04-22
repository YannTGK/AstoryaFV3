/*  Starmanager.tsx
    – alle sterren draaien nu automatisch rond hun Z‑as         */

    import { useEffect, useRef } from 'react';
    import { THREE } from 'expo-three';
    import ThreeGLTFLoader from '@/Loaders/GLTFLoaderWrapper';
    
    /* ------------------------------------------------------------------ */
    /*  Palette                                                            */
    /* ------------------------------------------------------------------ */
    
    const starOptions = [
      { name: 'PEACE',        color: 0xffffff, emissive: 0xffffff }, // white–white
      { name: 'HOPE',         color: 0xffffff, emissive: 0xffedaa }, // soft yellow
      { name: 'SUCCESS',      color: 0xffffff, emissive: 0xffb3b3 }, // pastel red
      { name: 'WEALTH',       color: 0xffffff, emissive: 0xffc9aa }, // pastel orange
      { name: 'HEALTH',       color: 0xffffff, emissive: 0xd8ffd8 }, // pastel green
      { name: 'OPPORTUNITY',  color: 0xffffff, emissive: 0xaacfff }, // pastel blue
      { name: 'INSPIRATION',  color: 0xffffff, emissive: 0xe3d1ff }, // pastel purple
      { name: 'REMEMBRANCE',  color: 0xffffff, emissive: 0xffc1e6 }, // pastel pink
    ] as const;
    
    /* ------------------------------------------------------------------ */
    /*  Helpers                                                            */
    /* ------------------------------------------------------------------ */
    
    function seededRandom(seed: number) {
      const x = Math.sin(seed) * 10_001;
      return x - Math.floor(x);
    }
    
    /* ------------------------------------------------------------------ */
    /*  Star class                                                         */
    /* ------------------------------------------------------------------ */
    
    type StarProps = {
      position?: [number, number, number];
      size?: [number, number, number];
      id: string;
      color: THREE.Color;
      emissive: THREE.Color;
    };
    
    class Star extends THREE.Object3D {
      constructor({
        position = [0, 0, 0],
        size = [1, 1, 1],
        id,
        color,
        emissive,
      }: StarProps) {
        super();
    
        this.position.set(...position);
        this.userData = { id, color, emissive };
    
        // Make the star face “up” (Expo‑Three loads +Z forward)
        this.rotation.x = -Math.PI / 2;
    
        this.loadModel(size).catch((err) =>
          console.error('❌ GLB loading exception:', err)
        );
      }
    
      /** Loads the GLB, applies base‑white + emissive tint, then adds it. */
      private async loadModel(size: [number, number, number]) {
        const loader = new ThreeGLTFLoader();
        const glbUrl =
          'https://cdn.jsdelivr.net/gh/YannTGK/GlbFIle@main/star.glb';
    
        loader.load(
          glbUrl,
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
                mesh.material = Array.isArray(mesh.material)
                  ? mesh.material.map((mat) => {
                      const m = mat.clone() as THREE.MeshStandardMaterial;
                      m.color.copy(color);        // always white
                      m.emissive.copy(emissive);  // soft glow
                      m.emissiveIntensity = 1; // Sterkte glow van de ster
                      m.needsUpdate = true;
                      return m;
                    })
                  : (() => {
                      const m = mesh.material.clone() as THREE.MeshStandardMaterial;
                      m.color.copy(color);
                      m.emissive.copy(emissive);
                      m.emissiveIntensity = 0.3; //Sterkte glow van de emissie
                      m.needsUpdate = true;
                      return m;
                    })();
              }
              child.userData = { ...child.userData, ...this.userData };
            });
    
            this.add(model);
          },
          undefined,
          (error) => console.error('❌ Error loading remote GLB:', error)
        );
      }
    }
    
    /* ------------------------------------------------------------------ */
    /*  StarsManager component                                             */
    /* ------------------------------------------------------------------ */
    
    type StarsManagerProps = {
      scene: THREE.Scene;
    };
    
    export default function StarsManager({ scene }: StarsManagerProps) {
      const starsRef = useRef<Star[]>([]);
      const seed = 42; // deterministic placement
    
      useEffect(() => {
        const numStars = 40;
        const sizeRange: [number, number] = [2.5, 3.5];
        const positionRange = 500;
    
        /* ---------- maak sterren -------------------------------------- */
        for (let i = 0; i < numStars; i++) {
          const uniqueSeed = seed + i;
    
          const sizeVal =
            seededRandom(uniqueSeed) * (sizeRange[1] - sizeRange[0]) +
            sizeRange[0];
          const size: [number, number, number] = [sizeVal, sizeVal, sizeVal];
    
          const position: [number, number, number] = [
            (seededRandom(uniqueSeed * 1.1) - 0.5) * positionRange * 2,
            (seededRandom(uniqueSeed * 1.2) - 0.5) * positionRange * 2,
            (seededRandom(uniqueSeed * 1.3) - 0.5) * positionRange * 2,
          ];
    
          const option = starOptions[i % starOptions.length];
          const star = new Star({
            position,
            size,
            id: `star_${i}`,
            color: new THREE.Color(option.color),
            emissive: new THREE.Color(option.emissive),
          });
    
          /* ---------- random rotation speed ---------------------------- */
          star.userData.name = option.name;
          star.userData.rotationSpeed =
            seededRandom(uniqueSeed * 99) * 0.010 + 0.025; // 0.002–0.008 rad/frame
          starsRef.current.push(star);
          scene.add(star);
        }
    
        /* ---------- animatie‑loop ------------------------------------- */
        let frameId: number;
        const spin = () => {
          starsRef.current.forEach(
            (s) => (s.rotation.z += s.userData.rotationSpeed ?? 0.005)
          );
          frameId = requestAnimationFrame(spin);
        };
        spin();
    
        /* ---------- cleanup ------------------------------------------- */
        return () => {
          frameId && cancelAnimationFrame(frameId);
          starsRef.current.forEach((s) => scene.remove(s));
          starsRef.current = [];
        };
      }, [scene]);
    
      return null; // manager voegt alleen objecten toe
    }
    
    export { Star };