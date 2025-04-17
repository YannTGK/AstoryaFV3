import { THREE } from 'expo-three';
import ThreeGLTFLoader from '@/Loaders/GLTFLoaderWrapper';

type StarProps = {
  position?: [number, number, number];
  size?: [number, number, number];
  id: string;
};

export default class Star extends THREE.Object3D {
  constructor({ position = [0, 0, 0], size = [1, 1, 1], id }: StarProps) {
    super();
    this.position.set(...position);
    this.userData = { id };
    this.rotation.x = -Math.PI / 2;
    this.loadModel(size);
  }

  async loadModel(size: [number, number, number]) {
    try {
      const loader = new ThreeGLTFLoader();

      const glbUrl =
        'https://cdn.jsdelivr.net/gh/YannTGK/GlbFIle@main/star.glb';

      loader.load(
        glbUrl,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(...size);

          if (this.userData.color) {
            model.traverse((child) => {
              const mesh = child as THREE.Mesh;
              if (mesh.isMesh && mesh.material) {
                mesh.material = Array.isArray(mesh.material)
                ? mesh.material.map((mat) => {
                    const matTyped = mat.clone() as THREE.MeshStandardMaterial;
                    matTyped.color.copy(this.userData.color);
                    matTyped.emissive?.copy(this.userData.color);
                    matTyped.emissiveIntensity = 1.5;
                    matTyped.needsUpdate = true;
                    return matTyped;
                  })
                : (() => {
                    const m = mesh.material.clone() as THREE.MeshStandardMaterial;
                    m.color.copy(this.userData.color);
                    m.emissive?.copy(this.userData.color);
                    m.emissiveIntensity = 1.5;
                    m.needsUpdate = true;
                    return m;
                  })();
              }
            });
          }

          model.traverse((child) => {
            child.userData = { ...child.userData, ...this.userData };
          });

          this.add(model);
        },
        undefined,
        (error) => {
          console.error('❌ Error loading remote GLB:', error);
        }
      );
    } catch (err) {
      console.error('❌ GLB loading exception:', err);
    }
  }
}