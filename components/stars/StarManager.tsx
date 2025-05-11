import { useEffect, useRef } from "react";
import { THREE } from "expo-three";
import ThreeGLTFLoader from "@/Loaders/GLTFLoaderWrapper";

/* Star class -------------------------------------------------- */
type StarProps = {
  position:[number,number,number];
  size:[number,number,number];
  id:string;
  color:THREE.Color;
  emissive:THREE.Color;
  highlight:boolean;
};

class Star extends THREE.Object3D {
  constructor({ position,size,id,color,emissive,highlight }:StarProps){
    super();
    this.position.set(...position);
    this.rotation.x=-Math.PI/2;
    this.userData={id,color,emissive,rotationSpeed:0.008,content:true};
    this.loadModel(size,highlight).catch(console.error);
  }
  private async loadModel(size:[number,number,number],highlight:boolean){
    const loader=new ThreeGLTFLoader();
    loader.load("https://cdn.jsdelivr.net/gh/YannTGK/GlbFIle@main/star.glb",
      g=>{
        g.scene.scale.set(...size);
        g.scene.traverse(child=>{
          const mesh=child as THREE.Mesh;
          if(mesh.isMesh&&mesh.material){
            const apply=(m:THREE.MeshStandardMaterial)=>{
              m.color.copy(this.userData.color);
              m.emissive.copy(this.userData.emissive);
              m.emissiveIntensity=highlight? 0.3 :0.3;
              return m;
            };
            mesh.material=Array.isArray(mesh.material)
              ? mesh.material.map(mat=>apply(mat.clone()))
              : apply(mesh.material.clone());
          }
          child.userData={...child.userData,...this.userData};
        });
        this.add(g.scene);
      });
  }
}

/* StarsManager ------------------------------------------------ */
type D = { _id:string;x:number;y:number;z:number;color:string;publicName?:string };
type Props={ scene:THREE.Scene; stars:D[]; highlightIds?:string[] };

export default function StarsManager({ scene,stars,highlightIds=[] }:Props){
  const ref=useRef<Star[]>([]);
  useEffect(()=>{
    stars.forEach(s=>{
      const st=new Star({
        position:[s.x,s.y,s.z], size:[3,3,3],
        id:s._id, color:new THREE.Color(s.color),
        emissive:new THREE.Color(s.color),
        highlight:highlightIds.includes(s._id),
      });
      scene.add(st); ref.current.push(st);
    });
    let f=0; const spin=()=>{ ref.current.forEach(st=>st.rotation.z+=st.userData.rotationSpeed); f=requestAnimationFrame(spin); }; spin();
    return()=>{ cancelAnimationFrame(f); ref.current.forEach(st=>scene.remove(st)); ref.current=[]; };
  },[scene,stars,highlightIds]);
  return null;
}