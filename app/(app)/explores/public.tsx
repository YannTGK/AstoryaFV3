import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Raycaster, Vector2 } from 'three';
import { Video } from 'expo-av';

// Post-processing imports
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import JoystickHandler from '@/components/joystick/JoystickHandler';
import { setupControls } from '@/components/three/setupControls';
import StarsManager from '@/components/stars/StarManager';

const { width, height } = Dimensions.get('window');

// Array met media (afbeeldingen en video)
const previewMedia = [
  { type: 'image', source: require('@/assets/images/oudeDame.jpg') },
  { type: 'image', source: require('@/assets/images/Familie1.jpg') },
  { type: 'video', source: require('@/assets/Videos/Video2.mp4') },
  { type: 'image', source: require('@/assets/images/Familie2.jpg') },
  { type: 'video', source: require('@/assets/Videos/Video1.mp4') },
  { type: 'image', source: require('@/assets/images/oudeDame.jpg') },
];

export default function PublicScreen() {
  const cameraRotation = useRef({ x: 0, y: 0 });
  const cameraPosition = useRef({ x: 0, y: 0, z: 10 });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<any>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  // Bloom settings inclusief exposure – exposure kan je via bijvoorbeeld een slider aanpassen
  const [bloomSettings, setBloomSettings] = useState({
    threshold: 0,
    strength: 3,
    radius: 1,
    exposure: 1, // Exposure standaardwaarde
  });
  // Overige state voor overlay etc.
  const [selectedContent, setSelectedContent] = useState<boolean>(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(0);

  const raycaster = new Raycaster();
  const touchPosition = new Vector2();
  const panResponder = useRef(setupControls({ cameraPosition, cameraRotation })).current;

  const isCameraLocked = useRef(false);
  const defaultCameraPosition = useRef(new THREE.Vector3(0, 0, 10));
  const targetCameraPosition = useRef(new THREE.Vector3(0, 0, 10));

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
      while (obj && !obj.userData?.content && obj.parent) {
        obj = obj.parent;
      }
      const data = obj.userData;
      console.log('🟢 Geraakte ster:', data?.id);
      if (data?.content) {
        setSelectedContent(true);
        setSelectedMediaIndex(0);
        const worldPos = obj.getWorldPosition(new THREE.Vector3());
        const offset = new THREE.Vector3(0, 0, 10);
        targetCameraPosition.current.copy(worldPos.clone().add(offset));
        isCameraLocked.current = true;
      }
    }
  };

  const createScene = async (gl: any) => {
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x000000);
    // Stel tone mapping en exposure in
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = bloomSettings.exposure;
    rendererRef.current = renderer;

    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color('black');
    setScene(newScene);

    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      10000
    );
    camera.position.z = cameraPosition.current.z;
    cameraRef.current = camera;

    // Setup EffectComposer voor bloom
    const composer = new EffectComposer(renderer);
    composer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    const renderPass = new RenderPass(newScene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(gl.drawingBufferWidth, gl.drawingBufferHeight),
      bloomSettings.strength,  // strength
      bloomSettings.radius,    // radius
      bloomSettings.threshold  // threshold
    );
    composer.addPass(bloomPass);

    const render = () => {
      requestAnimationFrame(render);
      
      // Update camera positie als deze vergrendeld is
      if (isCameraLocked.current) {
        camera.position.lerp(targetCameraPosition.current, 0.05);
      } else {
        camera.position.set(
          cameraPosition.current.x,
          cameraPosition.current.y,
          cameraPosition.current.z
        );
      }
      camera.rotation.x = cameraRotation.current.x;
      camera.rotation.y = cameraRotation.current.y;

      // Update bloom pass waarden
      bloomPass.threshold = bloomSettings.threshold;
      bloomPass.strength = bloomSettings.strength;
      bloomPass.radius = bloomSettings.radius;
      
      // Update de exposure via de renderer
      renderer.toneMappingExposure = bloomSettings.exposure;

      composer.render();
      gl.endFrameEXP();
    };

    render();
  };

  const handleBack = () => {
    targetCameraPosition.current.copy(new THREE.Vector3(0, 0, 10));
    isCameraLocked.current = false;
    setSelectedContent(false);
    setSelectedMediaIndex(0);
  };

  const handlePrevMedia = () => {
    setSelectedMediaIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextMedia = () => {
    setSelectedMediaIndex((prev) =>
      prev < previewMedia.length - 1 ? prev + 1 : prev
    );
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
      {selectedContent && (
        <SafeAreaView style={styles.overlayHolder}>
          <View style={styles.section1}>
            <Text style={styles.overlayTitle}>🌟Maria Parker</Text>
            <TouchableOpacity onPress={handleBack}>
              <Image
                source={require('@/assets/images/icons/close.png')}
                style={styles.closeButton}
              />
            </TouchableOpacity>
          </View>

          {/* Slider voor exposure aanpassing */}
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Exposure</Text>
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={0}
              maximumValue={2}
              step={0.01}
              value={bloomSettings.exposure}
              onValueChange={(value) =>
                setBloomSettings((prev) => ({ ...prev, exposure: value }))
              }
            />
          </View>

          <View style={styles.mainMediaContainer}>
            {previewMedia[selectedMediaIndex].type === 'image' ? (
              <Image
                style={styles.mainMedia}
                source={previewMedia[selectedMediaIndex].source}
              />
            ) : (
              <Video
                style={styles.mainMedia}
                source={previewMedia[selectedMediaIndex].source}
                useNativeControls
                resizeMode="contain"
                isLooping
                shouldPlay
              />
            )}
          </View>
          <View style={styles.arrowHolder}>
            <TouchableOpacity onPress={handlePrevMedia}>
              <Image source={require('@/assets/images/icons/arrow-left.png')} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNextMedia}>
              <Image source={require('@/assets/images/icons/arrow-right.png')} />
            </TouchableOpacity>
          </View>
          <View style={styles.section3}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.previewContent}
            >
              {previewMedia.map((media, index) => (
                <TouchableOpacity key={index} onPress={() => setSelectedMediaIndex(index)}>
                  {media.type === 'image' ? (
                    <Image style={styles.preview} source={media.source} />
                  ) : (
                    <Video
                      style={styles.preview}
                      source={media.source}
                      resizeMode="cover"
                      isLooping
                      shouldPlay={false}
                      useNativeControls={false}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
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
  overlayHolder: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 140,
    width: '100%',
  },
  section1: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  closeButton: { width: 24, height: 24 },
  mainMediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  mainMedia: {
    width: width * 0.8,
    height: height * 0.5,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  arrowHolder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginVertical: 16,
  },
  section3: { width: '100%' },
  overlayTitle: {
    color: '#fff',
    fontFamily: 'Alice-Regular',
    fontSize: 24,
    textAlign: 'center',
  },
  previewContent: {
    paddingHorizontal: 10,
    gap: 8,
    backgroundColor: '#fff',
    height: 120,
    alignItems: 'center',
    borderRadius: 8,
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  sliderContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  sliderLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
});