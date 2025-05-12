import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, StyleSheet, Dimensions, ActivityIndicator, Text } from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { Raycaster, Vector2 } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import JoystickHandler from "@/components/joystick/JoystickHandler";
import { setupControls } from "@/components/three/setupControls";
import StarsManager from "@/components/stars/StarManager";
import api from "@/services/api";
import { useFilterStore } from "@/lib/store/filterStore";
import { useLayoutStore } from "@/lib/store/layoutStore";

const { width, height } = Dimensions.get("window");
const CLUSTER_FACTOR = 0.15;
const isNear = (v: number, t: number, m = 2) => Math.abs(v - t) <= m;

export default function PrivateScreen() {
  const setIsSearching = useLayoutStore(s => s.setIsSearching);

  // camera refs
  const camPos = useRef({ x: 0, y: 0, z: 10 });
  const camRot = useRef({ x: 0, y: 0 });
  const camRef = useRef<THREE.PerspectiveCamera | null>(null);

  const [rawStars, setRawStars] = useState<any[]>([]);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [loading, setLoading] = useState(true);

  // filters uit store
  const { dob, dod, country, coordX, coordY, coordZ } = useFilterStore();

  // 1️⃣ fetch private sterren
  useEffect(() => {
    (async () => {
      try {
        const { stars } = (await api.get("/stars/private")).data;
        setRawStars(stars);
      } catch (e) {
        console.error("★ private fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2️⃣ clusteren + filteren
  const stars = useMemo(() => {
    let f = rawStars.map(s => ({
      ...s,
      x: s.x * CLUSTER_FACTOR,
      y: s.y * CLUSTER_FACTOR,
      z: s.z * CLUSTER_FACTOR,
    }));
    if (dob) {
      const d = new Date(dob.split("/").reverse().join("-"))
        .toISOString().slice(0,10);
      f = f.filter(s => s.user?.dob?.slice(0,10) === d);
    }
    if (dod) {
      const D = new Date(dod.split("/").reverse().join("-"))
        .toISOString().slice(0,10);
      f = f.filter(s => s.user?.dod?.slice(0,10) === D);
    }
    if (country) {
      f = f.filter(s => s.user?.country === country);
    }
    if (coordX) {
      const x = parseFloat(coordX.replace(",","."));
      if (!isNaN(x)) f = f.filter(s => isNear(s.x,x));
    }
    if (coordY) {
      const y = parseFloat(coordY.replace(",","."));
      if (!isNaN(y)) f = f.filter(s => isNear(s.y,y));
    }
    if (coordZ) {
      const z = parseFloat(coordZ.replace(",","."));
      if (!isNaN(z)) f = f.filter(s => isNear(s.z,z));
    }
    return f;
  }, [rawStars, dob, dod, country, coordX, coordY, coordZ]);

  //  ➡️ log de gefilterde sterren
  useEffect(() => {
    console.log("🔍 Gefilterde private sterren:", stars);
  }, [stars]);

  // 3️⃣ centreer camera op cluster
  useEffect(() => {
    if (!camRef.current || stars.length === 0) return;
    const c = stars.reduce((acc,s) => ({
      x: acc.x + s.x,
      y: acc.y + s.y,
      z: acc.z + s.z
    }), { x:0,y:0,z:0 });
    c.x /= stars.length; c.y /= stars.length; c.z /= stars.length;
    const maxD = Math.max(...stars.map(s =>
      Math.hypot(s.x - c.x, s.y - c.y, s.z - c.z)
    ));
    const dist = maxD*1.5 + 20;
    camPos.current = { x:c.x, y:c.y, z:c.z+dist };
    camRef.current!.position.set(c.x,c.y,c.z+dist);
    camRef.current!.lookAt(new THREE.Vector3(c.x,c.y,c.z));
  }, [stars]);

  // Three.js init
  const createScene = async (gl:any) => {
    const renderer = new Renderer({ gl, preserveDrawingBuffer:true });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const sc = new THREE.Scene();
    setScene(sc);

    const cam = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth/gl.drawingBufferHeight,
      0.1,10000
    );
    cam.position.z = camPos.current.z;
    camRef.current = cam;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(sc, cam));
    composer.addPass(new UnrealBloomPass(
      new THREE.Vector2(gl.drawingBufferWidth,gl.drawingBufferHeight),
      3,1,0
    ));

    const loop = () => {
      requestAnimationFrame(loop);
      cam.position.set(camPos.current.x, camPos.current.y, camPos.current.z);
      cam.rotation.x = camRot.current.x;
      cam.rotation.y = camRot.current.y;
      composer.render();
      gl.endFrameEXP();
    };
    loop();
  };

  // interactie (zonder overlay)
  const ray = new Raycaster();
  const touch = new Vector2();
  const pan = useRef(setupControls({ cameraPosition:camPos, cameraRotation:camRot })).current;

  const handleTouch = (e:any) => {
    if (!scene || !camRef.current) return;
    touch.x = (e.locationX/width)*2 - 1;
    touch.y = -(e.locationY/height)*2 + 1;
    ray.setFromCamera(touch, camRef.current);
    const hit = ray.intersectObjects(scene.children, true)[0];
    if (!hit) return;
    let o:any = hit.object;
    while(o && !o.userData?.id && o.parent) o = o.parent;
    if (o.userData?.id) console.log("🟢 click star:", o.userData.id);
  };

  return (
    <View style={styles.container}>
      <GLView
        style={styles.gl}
        onContextCreate={createScene}
        onTouchEnd={e => handleTouch(e.nativeEvent)}
        {...pan.panHandlers}
      />

      <View style={styles.cross}>
        <Text style={styles.plus}>+</Text>
      </View>

      <JoystickHandler cameraPosition={camPos} cameraRotation={camRot} />

      {loading && <ActivityIndicator style={styles.spinner} size="large" color="#fff" />}

      {scene && stars.length > 0 && <StarsManager scene={scene} stars={stars} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:"#000" },
  gl: { position:"absolute", width, height, top:0,left:0 },
  cross: { position:"absolute", top:"50%", left:"50%", transform:[{translateX:-10},{translateY:-10}], zIndex:10 },
  plus: { fontSize:24, color:"#fff" },
  spinner: { position:"absolute", top:"50%", left:"50%", marginLeft:-15, marginTop:-15 },
});