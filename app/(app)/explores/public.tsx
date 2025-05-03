import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text
} from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Raycaster, Vector2 } from 'three';
import JoystickHandler from '@/components/joystick/JoystickHandler';
import { setupControls } from '@/components/three/setupControls';
import StarsManager from '@/components/stars/StarManager';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const { width, height } = Dimensions.get('window');

export default function PublicScreen() {
  const cameraRotation = useRef({ x: 0, y: 0 });
  const cameraPosition = useRef({ x: 0, y: 0, z: 10 });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<any>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);

  const raycaster = new Raycaster();
  const touchPosition = new Vector2();
  const panResponder = useRef(setupControls({ cameraPosition, cameraRotation })).current;

  const [bloomSettings] = useState({
    threshold: 0,
    strength: 3,
    radius: 1,
    exposure: 1,
  });

  const handleTouch = (event: any) => {
    if (!scene || !cameraRef.current) return;
    const { locationX, locationY } = event;
    touchPosition.x = (locationX / width) * 2 - 1;
    touchPosition.y = -(locationY / height) * 2 + 1;
    raycaster.setFromCamera(touchPosition, cameraRef.current);
    const intersects = raycaster.intersectObjects(scene.children, true);

    console.log('🎯 Aantal raakpunten:', intersects.length);

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && !obj.userData?.id && obj.parent) {
        obj = obj.parent;
      }

      const data = obj.userData;
      if (data?.id) {
        console.log('🟢 Geklikt op ster met ID:', data.id);
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
      camera.position.set(
        cameraPosition.current.x,
        cameraPosition.current.y,
        cameraPosition.current.z
      );
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
        {...panResponder.panHandlers}
      />
      <View style={styles.crosshairContainer}>
        <Text style={styles.crosshair}>+</Text>
      </View>
      <JoystickHandler cameraPosition={cameraPosition} cameraRotation={cameraRotation} />
      {scene && <StarsManager scene={scene} />}
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
});