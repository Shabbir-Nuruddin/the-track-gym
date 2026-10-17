import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { CamScroll, Embers, Stage, smooth, type SceneProps } from "./kit";
import { ACCENT, FOG, Kettlebell } from "./gym";

/** A kettlebell swings from a hang up to chest height, driven by scroll; two lighter bells wait on the floor. */
function Swing({ progress }: { progress: SceneProps["progress"] }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.elapsedTime;
    const p = smooth(0.02, 0.75, progress.get());
    // hinge at the hands: from hanging between the legs to a horizontal float
    g.current.rotation.x = -0.25 + Math.sin(t * 1.4) * 0.1 * (1 - p) - p * 1.45;
    g.current.rotation.y = Math.sin(t * 0.4) * 0.25 + p * 0.4;
  });
  return (
    <group position={[0, 1.15, 0]}>
      <group ref={g}>
        <Kettlebell size={1.15} />
      </group>
    </group>
  );
}

export default function KettlebellScene(props: SceneProps) {
  return (
    <Stage {...props} fog={FOG} env="#161616" warm="#fff1e0" camera={[0, 0.4, 8]} scale={0.95}>
      <CamScroll progress={props.progress} from={[0, 0.4, 8]} to={[-0.8, 0.9, 6.8]} look={[0, -0.2, 0]} />
      <spotLight position={[0, 6, 3]} angle={0.5} penumbra={0.9} intensity={70} />
      <pointLight position={[-3, 0, -2]} intensity={18} distance={10} color={ACCENT} />
      <pointLight position={[3, 1, 3]} intensity={6} distance={8} />
      <Swing progress={props.progress} />
      <group position={[1.5, -1.0, -0.6]} rotation={[0, -0.6, 0]}>
        <Kettlebell size={0.55} color="#1d1d1d" />
      </group>
      <group position={[-1.6, -1.3, 0.2]} rotation={[0, 0.5, 0]}>
        <Kettlebell size={0.42} />
      </group>
      <Embers count={props.lite ? 30 : 80} origin={[0, -2, 0]} area={[5, 1, 3]} rise={4} color="#ffffff" size={0.04} speed={0.05} />
    </Stage>
  );
}
