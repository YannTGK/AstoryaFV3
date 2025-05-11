import React, { useEffect, useRef, useState, useMemo } from "react";
import { View, StyleSheet, Dimensions, Text, ActivityIndicator } from "react-native";
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
import { useLayoutStore } from "@/lib/store/layoutStore";
import { useFilterStore } from "@/lib/store/filterStore";

const { width, height } = Dimensions.get("window");
const CLUSTER_FACTOR = 0.15;

const isNear = (value: number, target: number, margin = 2) =>
  Math.abs(value - target) <= margin;

export default function PublicScreen() {
  const camPos = useRef({ x: 0, y: 0, z: 10 });
  const camRot = useRef({ x: 0, y: 0 });
  const camRef = useRef<THREE.PerspectiveCamera | null>(null);

  const [rawStars, setRawStars] = useState<any[]>([]);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [loading, setLoading] = useState(true);

  const showOnlyMine = useLayoutStore((s) => s.showOnlyMine);
  const { dob, dod, country, coordX, coordY, coordZ } = useFilterStore();

  useEffect(() => {
    (async () => {
      try {
        const { stars } = (await api.get("/stars/public")).data;
        setRawStars(stars);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stars = useMemo(() => {
    let filtered = [...rawStars];

    if (dob) {
      const formattedDob = new Date(dob.split("/").reverse().join("-"))
        .toISOString()
        .slice(0, 10);
      filtered = filtered.filter(
        (s) => s.user?.dob?.slice(0, 10) === formattedDob
      );
    }

    if (dod) {
      const formattedDod = new Date(dod.split("/").reverse().join("-"))
        .toISOString()
        .slice(0, 10);
      filtered = filtered.filter(
        (s) => s.user?.dod?.slice(0, 10) === formattedDod
      );
    }

    if (country) {
      filtered = filtered.filter((s) => s.user?.country === country);
    }

    if (coordX) {
      const xVal = parseFloat(coordX);
      if (!isNaN(xVal)) {
        filtered = filtered.filter((s) => isNear(s.x, xVal));
      }
    }

    if (coordY) {
      const yVal = parseFloat(coordY);
      if (!isNaN(yVal)) {
        filtered = filtered.filter((s) => isNear(s.y, yVal));
      }
    }

    if (coordZ) {
      const zVal = parseFloat(coordZ);
      if (!isNaN(zVal)) {
        filtered = filtered.filter((s) => isNear(s.z, zVal));
      }
    }

    if (showOnlyMine) {
      filtered = filtered
        .filter((s) => s.related)
        .map((s) => ({
          ...s,
          x: s.x * CLUSTER_FACTOR,
          y: s.y * CLUSTER_FACTOR,
          z: s.z * CLUSTER_FACTOR,
        }));
    }

    return filtered;
  }, [rawStars, showOnlyMine, dob, dod, country, coordX, coordY, coordZ]);

  const highlightIds = useMemo(
    () => (showOnlyMine ? stars.map((s) => s._id) : []),
    [stars, showOnlyMine]
  );

  useEffect(() => {
    if (!camRef.current || stars.length === 0) return;

    const center = stars.reduce(
      (acc, s) => {
        acc.x += s.x;
        acc.y += s.y;
        acc.z += s.z;
        return acc;
      },
      { x: 0, y: 0, z: 0 }
    );

    center.x /= stars.length;
    center.y /= stars.length;
    center.z /= stars.length;

    const maxDistance = Math.max(
      ...stars.map(
        (s) =>
          Math.sqrt(
            Math.pow(s.x - center.x, 2) +
              Math.pow(s.y - center.y, 2) +
              Math.pow(s.z - center.z, 2)
          )
      )
    );

    const safeDistance = maxDistance * 1.5 + 50;

    camPos.current = {
      x: center.x,
      y: center.y,
      z: center.z + safeDistance,
    };

    camRef.current.position.set(center.x, center.y, center.z + safeDistance);
    camRef.current.lookAt(new THREE.Vector3(center.x, center.y, center.z));
  }, [stars]);

  const createScene = async (gl: any) => {
    const renderer = new Renderer({ gl, preserveDrawingBuffer: true });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const sc = new THREE.Scene();
    setScene(sc);

    const camera = new THREE.PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      10000
    );
    camera.position.z = camPos.current.z;
    camRef.current = camera;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(sc, camera));
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(gl.drawingBufferWidth, gl.drawingBufferHeight),
        3,
        1,
        0
      )
    );

    const loop = () => {
      requestAnimationFrame(loop);
      camera.position.set(camPos.current.x, camPos.current.y, camPos.current.z);
      camera.rotation.x = camRot.current.x;
      camera.rotation.y = camRot.current.y;
      composer.render();
      gl.endFrameEXP();
    };
    loop();
  };

  const raycaster = new Raycaster();
  const touch = new Vector2();
  const panResp = useRef(setupControls({ cameraPosition: camPos, cameraRotation: camRot })).current;

  const handleTouch = (e: any) => {
    if (!scene || !camRef.current) return;
    touch.x = (e.locationX / width) * 2 - 1;
    touch.y = -(e.locationY / height) * 2 + 1;
    raycaster.setFromCamera(touch, camRef.current);
    const hit = raycaster.intersectObjects(scene.children, true)[0];
    if (!hit) return;
    let o = hit.object;
    while (o && !o.userData?.id && o.parent) o = o.parent;
    o?.userData?.id && console.log("🟢 click star:", o.userData.id);
  };

  return (
    <View style={styles.container}>
      <GLView
        style={styles.gl}
        onContextCreate={createScene}
        onTouchEnd={(e) => handleTouch(e.nativeEvent)}
        {...panResp.panHandlers}
      />
      <View style={styles.cross}>
        <Text style={styles.plus}>+</Text>
      </View>

      <JoystickHandler cameraPosition={camPos} cameraRotation={camRot} />

      {(loading || !scene) && (
        <ActivityIndicator style={styles.spinner} size="large" color="#fff" />
      )}

      {scene && (
        <StarsManager
          scene={scene}
          stars={stars}
          highlightIds={highlightIds}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  gl: { position: "absolute", width, height, top: 0, left: 0 },
  cross: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -10 }, { translateY: -10 }],
    zIndex: 10,
  },
  plus: { fontSize: 24, color: "#fff" },
  spinner: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -15,
  },
});