import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { CamScroll, Embers, Stage, smooth, type SceneProps } from "./kit";
import { ACCENT, Barbell, FOG } from "./gym";

/** A loaded bar comes off the floor and locks out overhead as the page scrolls; chalk hangs in the light. */
function Lift({ progress }: { progress: SceneProps["progress"] }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.elapsedTime;
    const p = progress.get();
    const pull = smooth(0.02, 0.45, p);
    const press = smooth(0.45, 0.85, p);
    g.current.position.y = -1.1 + pull * 1.2 + press * 0.9 + Math.sin(t * 1.2) * 0.04;
    g.current.rotation.y = -0.62 + press * 0.5 + Math.sin(t * 0.35) * 0.05;
    g.current.rotation.z = Math.sin(t * 0.9) * 0.025 * (1 - press);
    g.current.rotation.x = 0.18 - pull * 0.12;
  });
  return (
    <group ref={g}>
      <Barbell />
    </group>
  );
}

export default function BarbellScene(props: SceneProps) {
  return (
    <Stage {...props} fog={FOG} env="#161616" warm="#fff2e2" camera={[0, 0.5, 8]} scale={0.82}>
      <CamScroll progress={props.progress} from={[0, 0.5, 8]} to={[0, 1, 7]} look={[0, 0, 0]} lookTo={[0, 0.6, 0]} />
      <spotLight position={[0, 6, 3]} angle={0.55} penumbra={0.9} intensity={70} color="#ffffff" />
      <pointLight position={[-3, 0.5, -2]} intensity={16} distance={10} color={ACCENT} />
      <pointLight position={[3, -1, 2]} intensity={6} distance={8} color="#ffffff" />
      <Lift progress={props.progress} />
      <Embers count={props.lite ? 40 : 110} origin={[0, -2, 0]} area={[6, 1, 3]} rise={4.5} color="#ffffff" size={0.045} speed={0.05} />
    </Stage>
  );
}
