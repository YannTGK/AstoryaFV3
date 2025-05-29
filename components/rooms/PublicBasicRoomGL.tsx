// components/rooms/PublicBasicRoomGL.tsx
import React, { useRef, useEffect } from "react";
import { View, PanResponder } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as FileSystem from "expo-file-system";

const REMOTE_GLB =
  "https://raw.githubusercontent.com/YannTGK/GlbFIle/main/room_final.glb";
const LOCAL_GLB = FileSystem.cacheDirectory + "room_final.glb";

type FocusRequest = {
  meshName: string;
  worldPos: THREE.Vector3;
  heightOffset: number;
};

type Props = {
  initialCameraPosition?: [number, number, number];
  initialCameraTarget?: [number, number, number];
  panEnabled?: boolean;
  onMeshClick?: (mesh: THREE.Mesh, worldPos: THREE.Vector3) => void;
  focusRequest?: FocusRequest;
  onFocusComplete?: (meshName: string) => void;
};

export default function PublicBasicRoomGL({
  initialCameraPosition = [0, 16, 20],
  initialCameraTarget = [0, 3, 0],
  panEnabled = true,
  onMeshClick,
  focusRequest,
  onFocusComplete,
}: Props) {
  const rendererRef = useRef<Renderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const raycaster = useRef(new THREE.Raycaster());
  const layout = useRef({ x: 0, y: 0, w: 1, h: 1 });
  const target = useRef(new THREE.Vector3(...initialCameraTarget));

  const yaw = useRef(0);
  const pitch = useRef(0);

  const tween = useRef<{
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    start: number;
    duration: number;
    meshName: string;
  } | null>(null);

  const panMoved = useRef(false);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => panEnabled,
      onPanResponderGrant: () => { panMoved.current = false; },
      onPanResponderMove: (_e, { dx, dy }) => {
        panMoved.current = true;
        yaw.current -= dx * 0.00015;
        pitch.current = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, pitch.current - dy * 0.00015)
        );
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  // kick off tween when focusRequest changes
  useEffect(() => {
    if (!focusRequest || !cameraRef.current) return;
    const cam = cameraRef.current;
    const now = performance.now();

    // if it's 'fullroom', override to initial props
    const isFull = focusRequest.meshName === "fullroom";
    const toPos = isFull
      ? new THREE.Vector3(...initialCameraPosition)
      : focusRequest.worldPos.clone().add(new THREE.Vector3(0, focusRequest.heightOffset, 0));
    const toTarget = isFull
      ? new THREE.Vector3(...initialCameraTarget)
      : focusRequest.worldPos.clone();

    tween.current = {
      fromPos: cam.position.clone(),
      toPos,
      fromTarget: target.current.clone(),
      toTarget,
      start: now,
      duration: 500,
      meshName: focusRequest.meshName,
    };
  }, [focusRequest]);

  const loopRef = useRef<number>();
  useEffect(() => () => cancelAnimationFrame(loopRef.current!), []);

  const onContextCreate = async (gl: any) => {
    const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;
    const renderer = new Renderer({ gl, preserveDrawingBuffer: true });
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 1);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(...initialCameraPosition);
    camera.lookAt(target.current);
    cameraRef.current = camera;

    scene.add(new THREE.HemisphereLight(0xffffff, 0xffffff, 0.2));
    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(5, 10, 7);
    scene.add(dir);
    const p = new THREE.PointLight(0xffffff, 0.8, 30);
    p.position.set(0, 8, 0);
    scene.add(p);

    try {
      const info = await FileSystem.getInfoAsync(LOCAL_GLB);
      if (!info.exists) {
        await FileSystem.downloadAsync(REMOTE_GLB, LOCAL_GLB);
      }
      const gltf = await new GLTFLoader().loadAsync(LOCAL_GLB);
      gltf.scene.traverse((obj) => {
        if ((obj as any).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.material = new THREE.MeshStandardMaterial({
            color: (mesh.material as any).color?.getHex() ?? 0x888888,
            metalness: 0,
            roughness: 1,
          });
        }
      });
      scene.add(gltf.scene);
    } catch {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      cube.name = "cube";
      scene.add(cube);
    }

    const render = () => {
      loopRef.current = requestAnimationFrame(render);

      const cam = cameraRef.current!;
      cam.rotateY(yaw.current);
      cam.rotateX(pitch.current);

      if (tween.current) {
        const t = tween.current;
        const now = performance.now();
        const α = Math.min(1, (now - t.start) / t.duration);
        cam.position.lerpVectors(t.fromPos, t.toPos, α);
        target.current.lerpVectors(t.fromTarget, t.toTarget, α);
        cam.lookAt(target.current);
        if (α === 1) {
          const name = t.meshName;
          tween.current = null;
          onFocusComplete?.(name);
        }
      } else {
        cam.lookAt(target.current);
      }

      renderer.render(scene, cam);
      gl.endFrameEXP();
    };
    render();
  };

  function handleTouch(e: any) {
    if (panMoved.current) return;

    const { pageX, pageY } = e.nativeEvent;
    const { x, y, w, h } = layout.current;
    const ndcX = ((pageX - x) / w) * 2 - 1;
    const ndcY = -((pageY - y) / h) * 2 + 1;

    const cam = cameraRef.current!;
    raycaster.current.setFromCamera({ x: ndcX, y: ndcY }, cam);
    const hits = raycaster.current.intersectObjects(
      sceneRef.current!.children,
      true
    );
    if (!hits.length) return;

    const mesh = hits[0].object as THREE.Mesh;
    const pos = new THREE.Vector3();
    mesh.getWorldPosition(pos);
    onMeshClick?.(mesh, pos);
  }

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(e) => {
        const { x, y, width, height } = e.nativeEvent.layout;
        layout.current = { x, y, w: width, h: height };
      }}
    >
      <GLView
        style={{ flex: 1 }}
        onContextCreate={onContextCreate}
        {...(panEnabled ? panResponder.panHandlers : {})}
        onTouchEnd={handleTouch}
      />
    </View>
  );
}