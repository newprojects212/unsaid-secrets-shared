import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const positions: [number, number, number, number][] = [
  [-3.8, .4, -1.5, .42], [-2.2, 1.7, -2, .22], [-.6, -.8, -1, .34], [1.1, 1.2, -2, .27], [3, -.4, -1, .46], [4.2, 1.8, -3, .18], [-4.7,-1.7,-2,.16], [2.3, -1.8, -2,.17], [.3,2.3,-3,.13], [-1.4,2.7,-3,.12], [4,-2.4,-3,.1]
];
function Lanterns({amber,teal,frame}:{amber:string;teal:string;frame:string}) {
  const group = useRef<THREE.Group>(null);
  useFrame(({clock, pointer}) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * .12, .025);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * .07, .025);
    group.current.children.forEach((child,i) => {const position=positions[i]; if(position) child.position.y = position[1] + Math.sin(clock.elapsedTime * .36 + i * 1.7) * .13;});
  });
  return <group ref={group}>{positions.map(([x,y,z,size],i)=><group key={i} position={[x+1.7,y,z]} rotation={[0,0,(i%3-1)*.08]}><mesh><cylinderGeometry args={[size*.65,size*.5,size*1.6,12,1,true]}/><meshBasicMaterial color={i%3===0?teal:amber} transparent opacity={.48} side={THREE.DoubleSide}/></mesh><mesh position={[0,size*.8,0]}><torusGeometry args={[size*.65,size*.04,4,12]}/><meshBasicMaterial color={frame}/></mesh><mesh position={[0,-size*.8,0]}><torusGeometry args={[size*.5,size*.04,4,12]}/><meshBasicMaterial color={frame}/></mesh><mesh position={[0,-size*.5,0]}><sphereGeometry args={[size*.16,8,8]}/><meshBasicMaterial color={amber}/></mesh></group>)}</group>;
}
export default function LanternScene(){
  const [colors,setColors]=useState<{amber:string;teal:string;frame:string}|null>(null);
  useEffect(()=>{const css=getComputedStyle(document.documentElement);setColors({amber:css.getPropertyValue('--scene-amber').trim(),teal:css.getPropertyValue('--scene-teal').trim(),frame:css.getPropertyValue('--scene-frame').trim()})},[]);
  if(!colors)return null;
  return <Canvas eventSource={document.body} eventPrefix="client" dpr={[1,1.3]} camera={{position:[0,0,8],fov:45}} gl={{alpha:true,antialias:false,powerPreference:'low-power'}} aria-hidden="true"><Lanterns {...colors}/></Canvas>
}
