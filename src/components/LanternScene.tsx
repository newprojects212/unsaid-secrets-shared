import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const positions: [number, number, number, number][] = [
  [-3.8, .4, -1.5, .42], [-2.2, 1.7, -2, .22], [-.6, -.8, -1, .34], [1.1, 1.2, -2, .27], [3, -.4, -1, .46], [4.2, 1.8, -3, .18], [-4.7,-1.7,-2,.16], [2.3, -1.8, -2,.17], [.3,2.3,-3,.13], [-1.4,2.7,-3,.12], [4,-2.4,-3,.1]
];
function Lanterns() {
  const group = useRef<THREE.Group>(null);
  useFrame(({clock, pointer}) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * .12, .025);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * .07, .025);
    group.current.children.forEach((child,i) => {const position=positions[i]; if(position) child.position.y = position[1] + Math.sin(clock.elapsedTime * .36 + i * 1.7) * .13;});
  });
  return <group ref={group}>{positions.map(([x,y,z,size],i)=><mesh key={i} position={[x,y,z]}><sphereGeometry args={[size,16,12]}/><meshBasicMaterial color={i%3===0?'#e8bc78':'#88b7b4'} transparent opacity={i%3===0?.65:.32}/></mesh>)}</group>;
}
export default function LanternScene(){return <Canvas dpr={[1,1.3]} camera={{position:[0,0,8],fov:45}} gl={{alpha:true,antialias:false,powerPreference:'low-power'}} aria-hidden="true"><Lanterns /></Canvas>}
