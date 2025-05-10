import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
} from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { Raycaster, Vector2 } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import JoystickHandler   from "@/components/joystick/JoystickHandler";
import { setupControls } from "@/components/three/setupControls";
import StarsManager      from "@/components/stars/StarManager";
import api               from "@/services/api";

const { width, height } = Dimensions.get("window");

export default function PublicScreen() {
  /* ─── camera / renderer refs ─────────────────────────── */
  const cameraRotation = useRef({ x: 0, y: 0 });
  const cameraPosition = useRef({ x: 0, y: 0, z: 10 });
  const cameraRef      = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef    = useRef<any>(null);

  /* ─── Three scene & data ─────────────────────────────── */
  const [scene,  setScene]  = useState<THREE.Scene | null>(null);
  const [stars,  setStars]  = useState<any[]>([]);
  const [loading,setLoading]= useState(true);

  /* ─── fetch publieke sterren één keer bij mount ──── */
  useEffect(() => {
    (async () => {
      try {
        const { stars } = (await api.get("/stars/public")).data;
        setStars(stars);           // => [{ _id,x,y,z,color,publicName }]
      } catch (e) {
        console.error("public stars:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

/* ─── ✨ spawn direct voor een ster (random) ✨ ─────────── */
useEffect(() => {
  if (!cameraRef.current || stars.length === 0) return;

  /* 1️⃣ kies een willekeurige ster */
  const randIndex    = Math.floor(Math.random() * stars.length);
  const { x, y, z }  = stars[randIndex];

  /* 2️⃣ camera 20 units vóór de gekozen ster */
  cameraPosition.current.x = x;
  cameraPosition.current.y = y;
  cameraPosition.current.z = z + 20;

  const cam = cameraRef.current;
  cam.position.set(
    cameraPosition.current.x,
    cameraPosition.current.y,
    cameraPosition.current.z
  );
  cam.lookAt(new THREE.Vector3(x, y, z));     // blijf naar de ster kijken
}, [stars]);

  /* ─── input / ray‑casting ────────────────────────────── */
  const raycaster = new Raycaster();
  const touchPos  = new Vector2();
  const panResponder = useRef(
    setupControls({ cameraPosition, cameraRotation })
  ).current;

  const handleTouch = (event: any) => {
    if (!scene || !cameraRef.current) return;
    const { locationX, locationY } = event;
    touchPos.x = (locationX / width) * 2 - 1;
    touchPos.y = -(locationY / height) * 2 + 1;
    raycaster.setFromCamera(touchPos, cameraRef.current);
    const hits = raycaster.intersectObjects(scene.children, true);

    if (hits.length > 0) {
      let obj = hits[0].object;
      while (obj && !obj.userData?.id && obj.parent) obj = obj.parent;
      obj?.userData?.id && console.log("🟢 click star:", obj.userData.id);
    }
  };

  /* ─── GLView initialiser ─────────────────────────────── */
  const createScene = async (gl: any) => {
    const renderer = new Renderer({ gl, preserveDrawingBuffer: true });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    rendererRef.current = renderer;

    const newScene = new THREE.Scene();
    setScene(newScene);

    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      10000
    );
    camera.position.z = cameraPosition.current.z;
    cameraRef.current = camera;

    /* bloom */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(newScene, camera));
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(gl.drawingBufferWidth, gl.drawingBufferHeight),
        3, 1, 0
      )
    );

    const loop = () => {
      requestAnimationFrame(loop);
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
    loop();
  };

  /* ─── UI ─────────────────────────────────────────────── */
  return (
    <View style={styles.container}>
      <GLView
        style={styles.gl}
        onContextCreate={createScene}
        onTouchEnd={(e) => handleTouch(e.nativeEvent)}
        {...panResponder.panHandlers}
      />

      {/* richt‑kruis */}
      <View style={styles.crosshairWrap}>
        <Text style={styles.crosshair}>+</Text>
      </View>

      <JoystickHandler
        cameraPosition={cameraPosition}
        cameraRotation={cameraRotation}
      />

      {/* laadindicator tot scene+stars klaar zijn */}
      {(loading || !scene) && (
        <ActivityIndicator
          style={styles.spinner}
          size="large"
          color="#fff"
        />
      )}

      {/* zodra scene en sterren klaar zijn ⇒ tonen */}
      {scene && stars.length > 0 && (
        <StarsManager scene={scene} stars={stars} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  gl:        { position: "absolute", width, height, top: 0, left: 0 },
  crosshairWrap:{
    position:"absolute", top:"50%", left:"50%",
    transform:[{translateX:-10},{translateY:-10}], zIndex:10
  },
  crosshair:{ fontSize:24, color:"#fff" },
  spinner:  { position:"absolute", top:"50%", left:"50%", marginLeft:-15, marginTop:-15 },
});