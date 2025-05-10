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
import { useLayoutStore }from "@/lib/store/layoutStore";

/* iconen */
import PhotosIcon    from "@/assets/images/svg-icons/photos.svg";
import VideosIcon    from "@/assets/images/svg-icons/videos.svg";
import AudiosIcon    from "@/assets/images/svg-icons/audios.svg";
import MessagesIcon  from "@/assets/images/svg-icons/messages.svg";
import DocumentsIcon from "@/assets/images/svg-icons/documents.svg";
import BookIcon      from "@/assets/images/svg-icons/book-of-life.svg";
import VRIcon        from "@/assets/images/svg-icons/3D-VR-space.svg";

const { width, height } = Dimensions.get("window");

/* ------------------------------------------------------- */
export default function PrivateScreen() {
  /* camera ------------------------------------------------ */
  const cameraRotation = useRef({ x: 0, y: 0 });
  const cameraPosition = useRef({ x: 0, y: 0, z: 10 });
  const cameraRef      = useRef<THREE.PerspectiveCamera|null>(null);

  /* scene & data ----------------------------------------- */
  const [scene, setScene]   = useState<THREE.Scene|null>(null);
  const [stars, setStars]   = useState<any[]>([]);
  const [loading,setLoading]= useState(true);

  /* overlay‑state ---------------------------------------- */
  const [selectedStarName, setSelectedStarName] = useState<string|null>(null);
  const [iconPos, setIconPos]  = useState<{x:number;y:number}[]>([]);
  const [isStarSelected,setIsStarSelected] = useState(false);
  const [joystickKey,setJoystickKey] = useState(0);
  const [activeId,setActiveId] = useState<string|null>(null);
  const [originalScale,setOriginalScale] = useState<THREE.Vector3|null>(null);

  const prevCamPos   = useRef(new THREE.Vector3());
  const targetPos    = useRef(new THREE.Vector3(0,0,10));
  const camLocked    = useRef(false);

  const setIsSearching = useLayoutStore(s=>s.setIsSearching);

  /* icons ------------------------------------------------- */
  const iconSize=65, iconOffset=iconSize/2;
  const icons=[
    <PhotosIcon    key="p" width={iconSize} height={iconSize}/>,
    <VideosIcon    key="v" width={iconSize} height={iconSize}/>,
    <AudiosIcon    key="a" width={iconSize} height={iconSize}/>,
    <MessagesIcon  key="m" width={iconSize} height={iconSize}/>,
    <DocumentsIcon key="d" width={iconSize} height={iconSize}/>,
    <BookIcon      key="b" width={iconSize} height={iconSize}/>,
    <VRIcon        key="vr"width={iconSize} height={iconSize}/>,
  ];

  /* fetch private stars ---------------------------------- */
  useEffect(()=>{(async()=>{
    try{
      const { stars } = (await api.get("/stars/private")).data;
      setStars(stars);                       // [{ _id,x,y,z,color,publicName }]
    }catch(e){console.error("private stars:",e);}
    finally{setLoading(false);}
  })();},[]);

/* ─── ✨ spawn direct voor een willekeurige ster ✨ ─────── */
useEffect(() => {
  if (!cameraRef.current || stars.length === 0) return;

  /* 1️⃣ kies willekeurige ster */
  const randIndex      = Math.floor(Math.random() * stars.length);
  const { x, y, z }    = stars[randIndex];

  /* 2️⃣ camera 20 units vóór de ster op de z‑as */
  cameraPosition.current.x = x;
  cameraPosition.current.y = y;
  cameraPosition.current.z = z + 20;

  /* 3️⃣ echte camera verplaatsen & laten kijken */
  const cam = cameraRef.current;
  cam.position.set(
    cameraPosition.current.x,
    cameraPosition.current.y,
    cameraPosition.current.z
  );
  cam.lookAt(new THREE.Vector3(x, y, z));
}, [stars]);               // ⇢ wordt één keer uitgevoerd als stars er zijn

  /* controls & raycast ----------------------------------- */
  const panResponder = useRef(
    setupControls({ cameraPosition,cameraRotation })
  ).current;

  const raycaster = new Raycaster();
  const touch     = new Vector2();

  const handleTouch = (e:any)=>{
    if(!scene||!cameraRef.current) return;
    const {locationX,locationY}=e;
    touch.x=(locationX/width)*2-1;
    touch.y=-(locationY/height)*2+1;
    raycaster.setFromCamera(touch,cameraRef.current);
    const hits=raycaster.intersectObjects(scene.children,true);
    if(!hits.length) return;

    let obj=hits[0].object;
    while(obj && !obj.userData?.id && obj.parent) obj=obj.parent;
    const id=obj.userData?.id;
    if(!id) return;

    /* — sluit overlay als je dezelfde ster opnieuw tikt — */
    if(id===activeId){
      originalScale && obj.scale.copy(originalScale);
      setSelectedStarName(null); setIconPos([]);
      setIsStarSelected(false);  setJoystickKey(k=>k+1);
      setActiveId(null);         setOriginalScale(null);
      camLocked.current=true;    targetPos.current.copy(prevCamPos.current);
      setIsSearching(false);
      return;
    }

    /* — open overlay — */
    const star=stars.find(s=>s._id===id);
    prevCamPos.current.copy(cameraRef.current.position);

    setSelectedStarName(star?.publicName ?? "Naam ontbreekt");
    setIsStarSelected(true);     setActiveId(id);
    setOriginalScale(obj.scale.clone()); setIsSearching(false);

    const worldPos=obj.getWorldPosition(new THREE.Vector3());
    targetPos.current.copy(worldPos.add(new THREE.Vector3(0,-1,10)));
    camLocked.current=true;
    obj.scale.setScalar(obj.scale.x*0.7);

    const yOff=-40, r=140;
    setIconPos(Array.from({length:7},(_,i)=>({
      x:width/2 + r*Math.cos((i/7)*2*Math.PI),
      y:height/2+yOff + r*Math.sin((i/7)*2*Math.PI)
    })));
  };

  /* Three init ------------------------------------------- */
  const createScene = async(gl:any)=>{
    const renderer = new Renderer({gl,preserveDrawingBuffer:true});
    renderer.setSize(gl.drawingBufferWidth,gl.drawingBufferHeight);

    const newScene = new THREE.Scene();
    newScene.background=null;    setScene(newScene);

    const camera = new THREE.PerspectiveCamera(
      75,gl.drawingBufferWidth/gl.drawingBufferHeight,0.1,10000);
    camera.position.z=cameraPosition.current.z;  cameraRef.current=camera;

    const composer=new EffectComposer(renderer);
    composer.addPass(new RenderPass(newScene,camera));
    composer.addPass(
      new UnrealBloomPass(new THREE.Vector2(gl.drawingBufferWidth,gl.drawingBufferHeight),3,1,0)
    );

    const loop=()=>{requestAnimationFrame(loop);
      if(camLocked.current){
        camera.position.lerp(targetPos.current,0.1);
        if(camera.position.distanceTo(targetPos.current)<0.01){
          camLocked.current=false;
          cameraPosition.current.x=camera.position.x;
          cameraPosition.current.y=camera.position.y;
          cameraPosition.current.z=camera.position.z;
        }
      }else{
        camera.position.set(cameraPosition.current.x,cameraPosition.current.y,cameraPosition.current.z);
      }
      camera.rotation.x=cameraRotation.current.x;
      camera.rotation.y=cameraRotation.current.y;
      composer.render(); gl.endFrameEXP();
    }; loop();
  };

  /* render ----------------------------------------------- */
  return(
    <View style={styles.c}>
      <GLView
        style={styles.gl}
        onContextCreate={createScene}
        onTouchEnd={e=>handleTouch(e.nativeEvent)}
        {...(!isStarSelected && panResponder.panHandlers)}
      />

      {/* richtkruis */}
      <View style={styles.cross}><Text style={styles.x}>+</Text></View>

      {!isStarSelected && (
        <JoystickHandler
          key={joystickKey}
          cameraPosition={cameraPosition}
          cameraRotation={cameraRotation}
        />
      )}

      {(loading||!scene) && (
        <ActivityIndicator style={styles.spin} size="large" color="#fff"/>
      )}

      {scene && stars.length>0 && (
        <StarsManager scene={scene} stars={stars}/>
      )}

      {selectedStarName && (
        <View style={styles.nameWrap}>
          <Text style={styles.name}>{selectedStarName}</Text>
        </View>
      )}

      {iconPos.map((p,i)=>(
        <View key={i} style={[styles.icon,{top:p.y-iconOffset,left:p.x-iconOffset}]}>
          {icons[i]}
        </View>
      ))}
    </View>
  );
}

/* --------------------------- styles -------------------- */
const styles = StyleSheet.create({
  c:{flex:1,backgroundColor:"#000"},
  gl:{position:"absolute",width,height,top:0,left:0},
  cross:{position:"absolute",top:"50%",left:"50%",
         transform:[{translateX:-10},{translateY:-10}],zIndex:10},
  x:{fontSize:24,color:"#fff"},
  spin:{position:"absolute",top:"50%",left:"50%",marginLeft:-15,marginTop:-15},
  nameWrap:{position:"absolute",top:height/2+135,left:width/2-100,
            width:200,alignItems:"center"},
  name:{color:"#fff",fontFamily:"Alice-Regular",fontSize:16},
  icon:{position:"absolute",zIndex:99},
});