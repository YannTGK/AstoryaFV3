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
        'https://s3.eu-central-1.wasabisys.com/glb-models/star.glb?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=J4UEISZ6A2HPBYAJL97A%2F20250327%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250327T130026Z&X-Amz-Expires=14400&X-Amz-Signature=e30860792218f00870f3d6f7bfc7df952393272a4bc51ec33982a8edb79435e0&X-Amz-SignedHeaders=host&x-id=GetObject';

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
                    matTyped.emissiveIntensity = 3.0;
                    matTyped.needsUpdate = true;
                    return matTyped;
                  })
                : (() => {
                    const m = mesh.material.clone() as THREE.MeshStandardMaterial;
                    m.color.copy(this.userData.color);
                    m.emissive?.copy(this.userData.color);
                    m.emissiveIntensity = 3.0;
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

