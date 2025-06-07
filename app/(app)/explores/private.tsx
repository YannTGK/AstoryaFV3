import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { ViewStyle, Animated } from "react-native"; // Animated toegevoegd
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { GLView } from "expo-gl";
import { Renderer } from "expo-three";
import * as THREE from "three";
import { Raycaster, Vector2 } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { useRouter } from "expo-router";

import JoystickHandler from "@/components/joystick/JoystickHandler";
import { setupControls } from "@/components/three/setupControls";
import StarsManager from "@/components/stars/StarManager";
import api from "@/services/api";
import { useFilterStore } from "@/lib/store/filterStore";

import PhotosIcon from "@/assets/images/svg-icons/photos.svg";
import VideosIcon from "@/assets/images/svg-icons/videos.svg";
import AudiosIcon from "@/assets/images/svg-icons/audios.svg";
import MessagesIcon from "@/assets/images/svg-icons/messages.svg";
import DocumentsIcon from "@/assets/images/svg-icons/documents.svg";
import VRSpaceIcon from "@/assets/images/svg-icons/3D-VR-space.svg";

const { width, height } = Dimensions.get("window");
const CLUSTER_FACTOR = 0.15;

// Pas dit aan voor jouw gewenste font-family
const PUBLIC_NAME_FONT_FAMILY = "Alice-Regular"; // Zorg dat dit font is geladen in je app


const getAvailableIcons = (rights: any) => {
  const allIcons = [
    {
      key: "canViewPhotos",
      label: "Photo's",
      route: "/(app)/explores/private-files/photos/photo-album",
      icon: <PhotosIcon width={60} height={60} />,
    },
    {
      key: "canViewVideos",
      label: "Video’s",
      route: "/(app)/explores/private-files/videos/video-album",
      icon: <VideosIcon width={60} height={60} />,
    },
    {
      key: "canViewAudios",
      label: "Audio’s",
      route: "/(app)/explores/private-files/audios/audios",
      icon: <AudiosIcon width={60} height={60} />,
    },
    {
      key: "canViewMessages",
      label: "Messages",
      route: "/(app)/explores/private-files/messages/add-message",
      icon: <MessagesIcon width={60} height={60} />,
    },
    {
      key: "canViewDocuments",
      label: "Documents",
      route: "/(app)/explores/private-files/documents/documents",
      icon: <DocumentsIcon width={60} height={60} />,
    },
  ];

  return allIcons.filter(icon => rights?.[icon.key]);
};

export default function PrivateScreen() {
  const router = useRouter();

  // Camera & scene refs
  const camPos = useRef({ x: 0, y: 0, z: 10 });
  const camRot = useRef({ x: 0, y: 0 });
  const camRef = useRef<THREE.PerspectiveCamera | null>(null);

  const prevCamPos = useRef({ x: 0, y: 0, z: 0 });
  const prevCamRot = useRef({ x: 0, y: 0 });

  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [rawStars, setRawStars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStarSelected, setIsStarSelected] = useState(false);
  const [overlayIcons, setOverlayIcons] = useState<typeof icons>([]);

  const {
    dob,
    dod,
    country,
    coordX,
    coordY,
    coordZ,
    searchQuery,
    selectedStarId,
  } = useFilterStore();

  // Fade animatie
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isStarSelected ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isStarSelected]);

  // Data ophalen
  useEffect(() => {
    (async () => {
      try {
        const { stars } = (await api.get("/stars/private-access")).data;
        setRawStars(stars);
      } catch (e) {
        console.error("★ private fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filteren & zoeken
  const stars = useMemo(() => {
    let f = rawStars.map((s) => ({
      ...s,
      x: s.x * CLUSTER_FACTOR,
      y: s.y * CLUSTER_FACTOR,
      z: s.z * CLUSTER_FACTOR,
    }));
    // ... huidige filters ...
    return f;
  }, [rawStars, dob, dod, country, coordX, coordY, coordZ, searchQuery]);

  // Camera centeren op cluster
  useEffect(() => {
    if (!camRef.current || stars.length === 0) return;
    const c = stars.reduce(
      (a, s) => ({ x: a.x + s.x, y: a.y + s.y, z: a.z + s.z }),
      { x: 0, y: 0, z: 0 }
    );
    c.x /= stars.length;
    c.y /= stars.length;
    c.z /= stars.length;
    const maxD = Math.max(
      ...stars.map((s) => Math.hypot(s.x - c.x, s.y - c.y, s.z - c.z))
    );
    const dist = maxD * 1.5 + 20;
    camPos.current = { x: c.x, y: c.y, z: c.z + dist };
    camRef.current.position.set(c.x, c.y, c.z + dist);
    camRef.current.lookAt(new THREE.Vector3(c.x, c.y, c.z));
  }, [stars]);

  // Jump to searched star
  useEffect(() => {
    if (!camRef.current || !scene || stars.length === 0 || !selectedStarId) return;
    const tgt = stars.find((s) => s._id === selectedStarId);
    if (!tgt) return;
    const offset = 20;
    camRef.current.position.set(tgt.x, tgt.y, tgt.z + offset);
    camRef.current.lookAt(new THREE.Vector3(tgt.x, tgt.y, tgt.z));
    camPos.current = { x: tgt.x, y: tgt.y, z: tgt.z + offset };
    useFilterStore.getState().setFilters({ selectedStarId: "" });
  }, [selectedStarId, stars, scene]);

  // Three.js setup
const createScene = async (gl: any) => {
  // renderer
  const renderer = new Renderer({ gl, preserveDrawingBuffer: true });
  renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

  // scene en camera
  const sc = new THREE.Scene();
// Gradient plane maken achter de sterren
const geometry = new THREE.PlaneGeometry(5000, 5000);
const material = new THREE.ShaderMaterial({
  uniforms: {
    colorTop:    { value: new THREE.Color('#05050f') }, // bijna zwart
    colorMiddle: { value: new THREE.Color('#0b0e1c') }, // donkerblauw
    colorBottom: { value: new THREE.Color('#000000') }, // echt zwart
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 colorTop;
    uniform vec3 colorMiddle;
    uniform vec3 colorBottom;
    varying vec2 vUv;

    void main() {
      vec3 color;
      if (vUv.y < 0.5) {
        color = mix(colorBottom, colorMiddle, vUv.y * 2.0);
      } else {
        color = mix(colorMiddle, colorTop, (vUv.y - 0.5) * 2.0);
      }
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  side: THREE.DoubleSide,
  depthWrite: false,
});
const plane = new THREE.Mesh(geometry, material);
plane.position.set(0, 0, -1000); // ver achter sterren
sc.add(plane);

  sc.fog = new THREE.Fog(0x000000, 200, 1200);

  const cam = new THREE.PerspectiveCamera(
    75,
    gl.drawingBufferWidth / gl.drawingBufferHeight,
    0.1,
    10000
  );
  cam.position.set(camPos.current.x, camPos.current.y, camPos.current.z);
  camRef.current = cam;

  // bloom post-processing
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(sc, cam));
  composer.addPass(
    new UnrealBloomPass(
      new THREE.Vector2(gl.drawingBufferWidth, gl.drawingBufferHeight),
      3, // strength
      1, // radius
      0  // threshold
    )
  );

  // maak én verzamel je sterren
  const starsArray: THREE.Mesh[] = [];
  const starCount = 1000;
  for (let i = 0; i < starCount; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 1500;
    const radius = 0.2 + Math.random() * 0.7;

    const geometry = new THREE.SphereGeometry(radius, 12, 12);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.9,
    });

    const star = new THREE.Mesh(geometry, material);
    star.position.set(x, y, z);
    sc.add(star);
    starsArray.push(star);
  }

  setScene(sc); // bewaar zodat je StarsManager e.d. het kan gebruiken

  // voeg vast een lichtbron toe zodat emissive zichtbaar wordt
  const ambient = new THREE.AmbientLight(0xffffff, 1);
  sc.add(ambient);

  // klok voor de animatie
  const clock = new THREE.Clock();

  // de render + shimmer loop
const loop = () => {
  
  requestAnimationFrame(loop);

  // bereken hoeveelheid tijd sinds start
  const t = clock.getElapsedTime();

for (let i = 0; i < starsArray.length; i++) {
  const star = starsArray[i];
  const base = 0.6;
  const amp = 0.4;
  const freq = 2;
  const phase = (i / starsArray.length) * Math.PI * 2;

  // Bereken shimmer (lichtintensiteit)
  const shimmer = base + amp * Math.sin(freq * t + phase);
  (star.material as THREE.MeshStandardMaterial).emissiveIntensity = shimmer;

  // Bereken schaalpulsatie
  const scale = 1 + 0.2 * Math.sin(freq * t + phase); // 0.2 = max puls
  star.scale.setScalar(scale);
}

  // renderen
  cam.position.set(camPos.current.x, camPos.current.y, camPos.current.z);
  cam.rotation.x = camRot.current.x;
  cam.rotation.y = camRot.current.y;
  composer.render();
  gl.endFrameEXP();
};

loop();
};

  // Overlay state
  const lastHighlight = useRef<{ obj: THREE.Object3D | null; scale: THREE.Vector3 | null }>({
    obj: null,
    scale: null,
  });
  const [overlayPos, setOverlayPos] = useState<{ x: number; y: number }[]>([]);
  const [overlayStar, setOverlayStar] = useState<{ id: string; publicName: string } | null>(null);

  const ray = new Raycaster();
  const touchPt = new Vector2();
  const pan = useRef(
    setupControls({ cameraPosition: camPos, cameraRotation: camRot })
  ).current;
  const focusDistance = 19;

  const handleTouch = (e: any) => {
    if (!scene || !camRef.current) return;
    const { locationX, locationY } = e;
    touchPt.set((locationX / width) * 2 - 1, -(locationY / height) * 2 + 1);
    ray.setFromCamera(touchPt, camRef.current);
    const hit = ray.intersectObjects(scene.children, true)[0];
    if (!hit) return;

    let obj: THREE.Object3D | null = hit.object;
    while (obj && !obj.userData?.id && obj.parent) obj = obj.parent;
    const id = obj?.userData?.id as string | undefined;
    if (!id || !obj) return;

    // Sluit overlay
    if (overlayStar?.id === id) {
      setOverlayIcons([]);
      setOverlayStar(null);
      setIsStarSelected(false);
      setOverlayPos([]);
      camPos.current = { ...prevCamPos.current };
      camRot.current = { ...prevCamRot.current };
      if (camRef.current) {
        camRef.current.position.set(
          prevCamPos.current.x,
          prevCamPos.current.y,
          prevCamPos.current.z
        );
        camRef.current.rotation.x = prevCamRot.current.x;
        camRef.current.rotation.y = prevCamRot.current.y;
      }
      if (lastHighlight.current.obj && lastHighlight.current.scale) {
        lastHighlight.current.obj.scale.copy(lastHighlight.current.scale);
        lastHighlight.current = { obj: null, scale: null };
      }
      return;
    }

    // Open overlay
    prevCamPos.current = { ...camPos.current };
    prevCamRot.current = { ...camRot.current };
    if (lastHighlight.current.obj && lastHighlight.current.scale) {
      lastHighlight.current.obj.scale.copy(lastHighlight.current.scale);
    }
    lastHighlight.current = { obj, scale: obj.scale.clone() };
    obj.scale.setScalar(1.8);

    const worldPos = new THREE.Vector3();
    obj.getWorldPosition(worldPos);

    // Zet camera exact op y van ster
    camPos.current = {
      x: worldPos.x,
      y: worldPos.y,
      z: worldPos.z + focusDistance,
    };
    camRef.current.position.set(worldPos.x, worldPos.y, worldPos.z + focusDistance);
    camRef.current.lookAt(new THREE.Vector3(worldPos.x, worldPos.y, worldPos.z));
    // Public name uit data
    const starData = stars.find((s) => s._id === id);

    // Iconen en badge altijd rond scherm-middelpunt
    const center = { x: width / 2, y: height / 2 };
    const radius = 120;
    const availableIcons = getAvailableIcons(starData?.rights);
    setOverlayIcons(availableIcons);

    const angleStep = (2 * Math.PI) / availableIcons.length;
    const startAngle = -Math.PI / 2;
    const positions = availableIcons.map((_, i) => ({
      x: center.x + radius * Math.cos(startAngle + i * angleStep) - 30,
      y: center.y + radius * Math.sin(startAngle + i * angleStep) - 30,
    }));

    
    setOverlayStar({ id, publicName: starData?.publicName || "Unknown" });
    setOverlayIcons(getAvailableIcons(starData?.rights));
    setOverlayPos(positions);
    setIsStarSelected(true);
  };

  const handleIconPress = (route: string, id: string) => {
    router.push({ pathname: route, params: { id } });
  };

  return (
    <View style={styles.container}>
      <GLView
        style={styles.gl}
        onContextCreate={createScene}
        onTouchEnd={(e) => handleTouch(e.nativeEvent)}
        {...(!isStarSelected ? pan.panHandlers : {})}
      />

      <View style={styles.cross}>
        <Text style={styles.plus}>+</Text>
      </View>

      {!overlayStar && <JoystickHandler key={0} cameraPosition={camPos} cameraRotation={camRot} />}


      {/* Lader alleen zolang data wordt opgehaald */}
{loading && <ActivityIndicator style={styles.spinner} size="large" color="#fff" />}

{/* Alleen tonen als de scene klaar is */}
{scene && stars.length > 0 && <StarsManager scene={scene} stars={stars} />}

      {overlayStar && (
        <>
          {/* Badge exact boven midden */}
          <Animated.View
            style={{
              position: "absolute",
              left: width / 2 - 100,
              bottom: height / 2 - 120,
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: "rgba(0,0,0,0.75)",
              borderRadius: 6,
              zIndex: 20,
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "600",
                textAlign: "center",
                fontSize: 20,
                fontFamily: PUBLIC_NAME_FONT_FAMILY,
                width: 200,
              }}
            >
              {overlayStar.publicName}
            </Text>
          </Animated.View>

          {overlayPos.map((p, i) => (
            <TouchableOpacity
              key={overlayIcons[i].label}
              style={{ position: "absolute", left: p.x, top: p.y, zIndex: 20 }}
              onPress={() => handleIconPress(overlayIcons[i].route, overlayStar.id)}
            >
              {overlayIcons[i].icon}
            </TouchableOpacity>
          ))}
        </>
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
