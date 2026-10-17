import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { CamScroll, Stage, smooth, type SceneProps } from "./kit";
import { ACCENT, Barbell, FOG } from "./gym";

/** Hexagon neon ceiling, like the gym's own; a few cells burn in the accent colour. */
function Hexes({ lite }: { lite: boolean }) {
  const cells = useMemo(() => {
    const out: { x: number; z: number; hot: boolean }[] = [];
    const R = 0.5;
    const n = lite ? 3 : 4;
    for (let q = -n; q <= n; q++)
      for (let r = -n; r <= n; r++) {
        if (Math.abs(q + r) > n) continue;
        out.push({ x: R * 1.5 * q * 1.06, z: R * Math.sqrt(3) * (r + q / 2) * 1.06, hot: (((q * 7 + r * 3) % 5) + 5) % 5 === 0 });
      }
    return out;
  }, [lite]);
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.elapsedTime * 0.03;
  });
  return (
    <group ref={g} position={[0, 2.1, -0.5]}>
      {cells.map((c, i) => (
        <group key={i} position={[c.x, 0, c.z]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <torusGeometry args={[0.5, 0.022, 6, 6]} />
            <meshBasicMaterial color={c.hot ? ACCENT : "#f4f7ff"} toneMapped={false} />
          </mesh>
          <mesh>
            <torusGeometry args={[0.5, 0.08, 6, 6]} />
            <meshBasicMaterial color={c.hot ? ACCENT : "#bcd0ff"} transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A chrome bar resting under the lights turns to face you as the camera walks in. */
function Bar({ progress }: { progress: SceneProps["progress"] }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const p = smooth(0.05, 0.8, progress.get());
    g.current.rotation.y = -0.5 + p * 0.9 + Math.sin(clock.elapsedTime * 0.3) * 0.05;
    g.current.position.y = -1.15 + p * 0.5;
  });
  return (
    <group ref={g} scale={0.8}>
      <Barbell load={[{ R: 0.9, w: 0.11 }, { R: 0.68, w: 0.08, color: ACCENT }, { R: 0.42, w: 0.04, color: "#c9ced4" }]} />
    </group>
  );
}

export default function NeonScene(props: SceneProps) {
  return (
    <Stage {...props} fog={FOG} env="#0d0f16" warm="#e8eeff" camera={[0, -0.4, 8]} envIntensity={0.8}>
      <CamScroll progress={props.progress} from={[0, -0.4, 8]} to={[0, -0.6, 4.6]} look={[0, 0.3, 0]} lookTo={[0, 1.2, -1]} />
      <pointLight position={[0, 1.6, 0]} intensity={30} distance={8} color="#dfe7ff" />
      <pointLight position={[-2, 1.4, 1]} intensity={14} distance={7} color={ACCENT} />
      <Hexes lite={props.lite} />
      <Bar progress={props.progress} />
    </Stage>
  );
}
