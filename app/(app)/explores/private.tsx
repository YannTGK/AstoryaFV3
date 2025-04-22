import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
} from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Raycaster, Vector2 } from 'three';
import JoystickHandler from '@/components/joystick/JoystickHandler';
import { setupControls } from '@/components/three/setupControls';
import StarsManager from '@/components/stars/StarManager';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { useLayoutStore } from '@/lib/store/layoutStore';

import PhotosIcon from '@/assets/images/svg-icons/photos.svg';
import VideosIcon from '@/assets/images/svg-icons/videos.svg';
import AudiosIcon from '@/assets/images/svg-icons/audios.svg';
import MessagesIcon from '@/assets/images/svg-icons/messages.svg';
import DocumentsIcon from '@/assets/images/svg-icons/documents.svg';
import BookIcon from '@/assets/images/svg-icons/book-of-life.svg';
import VRIcon from '@/assets/images/svg-icons/3D-VR-space.svg';

const { width, height } = Dimensions.get('window');

export default function PublicScreen() {
  const cameraRotation = useRef({ x: 0, y: 0 });
  const cameraPosition = useRef({ x: 0, y: 0, z: 10 });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<any>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [selectedStarName, setSelectedStarName] = useState<string | null>(null);
  const [iconPositions, setIconPositions] = useState<{ x: number; y: number }[]>([]);
  const [isStarSelected, setIsStarSelected] = useState(false);
  const [joystickKey, setJoystickKey] = useState(0);
  const [activeStarId, setActiveStarId] = useState<string | null>(null);
  const [originalScale, setOriginalScale] = useState<THREE.Vector3 | null>(null);
  const previousCameraPosition = useRef<THREE.Vector3>(new THREE.Vector3());

  const setIsSearching = useLayoutStore((state) => state.setIsSearching);

  const raycaster = new Raycaster();
  const touchPosition = new Vector2();
  const panResponder = useRef(setupControls({ cameraPosition, cameraRotation })).current;

  const isCameraLocked = useRef(false);
  const targetCameraPosition = useRef(new THREE.Vector3(0, 0, 10));

  const [bloomSettings] = useState({
    threshold: 0,
    strength: 3,
    radius: 1,
    exposure: 1,
  });

  const iconSize = 65;
  const iconOffset = iconSize / 2;

  const iconComponents = [
    <PhotosIcon key="photos" width={iconSize} height={iconSize} />,
    <VideosIcon key="videos" width={iconSize} height={iconSize} />,
    <AudiosIcon key="audios" width={iconSize} height={iconSize} />,
    <MessagesIcon key="messages" width={iconSize} height={iconSize} />,
    <DocumentsIcon key="docs" width={iconSize} height={iconSize} />,
    <BookIcon key="book" width={iconSize} height={iconSize} />,
    <VRIcon key="vr" width={iconSize} height={iconSize} />,
  ];

  const handleTouch = (event: any) => {
    if (!scene || !cameraRef.current) return;
    const { locationX, locationY } = event;
    touchPosition.x = (locationX / width) * 2 - 1;
    touchPosition.y = -(locationY / height) * 2 + 1;
    raycaster.setFromCamera(touchPosition, cameraRef.current);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && !obj.userData?.id && obj.parent) {
        obj = obj.parent;
      }

      const data = obj.userData;

      if (data?.id && data?.content) {
        if (data.id === activeStarId) {
          if (originalScale) obj.scale.copy(originalScale);
          setSelectedStarName(null);
          setIconPositions([]);
          setIsStarSelected(false);
          setJoystickKey((prev) => prev + 1);
          setActiveStarId(null);
          setOriginalScale(null);
          isCameraLocked.current = true;
          targetCameraPosition.current.copy(previousCameraPosition.current);
          setIsSearching(false);
        } else {
          previousCameraPosition.current.copy(cameraRef.current.position);
          setSelectedStarName('Voor- & Achternaam');
          setIsStarSelected(true);
          setActiveStarId(data.id);
          setOriginalScale(obj.scale.clone());
          setIsSearching(false);

          const starWorldPos = obj.getWorldPosition(new THREE.Vector3());
          const offset = new THREE.Vector3(0, -1, 10);
          targetCameraPosition.current.copy(starWorldPos.clone().add(offset));
          isCameraLocked.current = true;

          obj.scale.setScalar(obj.scale.x * 0.7);

          const yOffset = -40; // naar boven verplaatsen
          const r = 140;
          const positions = Array.from({ length: 7 }, (_, i) => {
            const angle = (i / 7) * 2 * Math.PI;
            return {
              x: width / 2 + r * Math.cos(angle),
              y: height / 2 + yOffset + r * Math.sin(angle),
            };
          });
          
          setIconPositions(positions);
        }
      }
    }
  };

  const createScene = async (gl: any) => {
    const renderer = new Renderer({ gl, preserveDrawingBuffer: true });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = bloomSettings.exposure;
    rendererRef.current = renderer;

    const newScene = new THREE.Scene();
    newScene.background = null;
    setScene(newScene);

    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      10000
    );
    camera.position.z = cameraPosition.current.z;
    cameraRef.current = camera;

    const composer = new EffectComposer(renderer);
    composer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    composer.addPass(new RenderPass(newScene, camera));
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(gl.drawingBufferWidth, gl.drawingBufferHeight),
        bloomSettings.strength,
        bloomSettings.radius,
        bloomSettings.threshold
      )
    );

    const render = () => {
      requestAnimationFrame(render);

      if (isCameraLocked.current && cameraRef.current) {
        camera.position.lerp(targetCameraPosition.current, 0.1);
      
        // Check of camera dichtbij genoeg is om te stoppen met lock
        const distance = camera.position.distanceTo(targetCameraPosition.current);
        if (distance < 0.01) {
          isCameraLocked.current = false;
          // Update manual position so joystick resumes from correct spot
          cameraPosition.current.x = camera.position.x;
          cameraPosition.current.y = camera.position.y;
          cameraPosition.current.z = camera.position.z;
        }
      } else {
        camera.position.set(
          cameraPosition.current.x,
          cameraPosition.current.y,
          cameraPosition.current.z
        );
      }      

      camera.rotation.x = cameraRotation.current.x;
      camera.rotation.y = cameraRotation.current.y;
      composer.render();
      gl.endFrameEXP();
    };

    render();
  };

  return (
    <View style={styles.container}>
      <GLView
        style={styles.glView}
        onContextCreate={createScene}
        onTouchEnd={(e) => handleTouch(e.nativeEvent)}
        {...(!isStarSelected && panResponder.panHandlers)}
      />
      <View style={styles.crosshairContainer}>
        <Text style={styles.crosshair}>+</Text>
      </View>

      {!isStarSelected && (
        <JoystickHandler
          key={joystickKey}
          cameraPosition={cameraPosition}
          cameraRotation={cameraRotation}
        />
      )}

      {scene && <StarsManager scene={scene} />}

      {selectedStarName && (
        <View style={styles.nameOverlay}>
          <Text style={styles.nameText}>{selectedStarName}</Text>
        </View>
      )}

      {iconPositions.map((pos, index) => (
        <View
          key={index}
          style={[styles.iconOverlay, { top: pos.y - iconOffset, left: pos.x - iconOffset }]}
        >
          {iconComponents[index]}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  glView: { position: 'absolute', width, height, top: 0, left: 0 },
  crosshairContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -10 }],
    zIndex: 10,
  },
  crosshair: { fontSize: 24, color: 'white', textAlign: 'center' },
  nameOverlay: {
    position: 'absolute',
    top: height / 2 + 135,
    left: width / 2 - 100,
    width: 200,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    borderRadius: 8,
  },
  nameText: {
    color: '#fff',
    fontFamily: 'Alice-Regular',
    fontSize: 16,
  },
  iconOverlay: {
    position: 'absolute',
    zIndex: 99,
  },
});