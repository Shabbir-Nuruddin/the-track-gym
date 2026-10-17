import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { CamScroll, Embers, Stage, clamp01, type SceneProps } from "./kit";
import { ACCENT, FOG, Plate, Steel } from "./gym";

const STACK = [
  { R: 1.05, w: 0.12, color: ACCENT },
  { R: 1.05, w: 0.12 },
  { R: 0.9, w: 0.1, color: ACCENT },
  { R: 0.75, w: 0.08 },
  { R: 0.6, w: 0.06, color: ACCENT },
  { R: 0.45, w: 0.04, color: "#c9ced4" },
];
const BASE = -1.7;
/** Resting centre of each plate on the pin. */
const REST = STACK.reduce<number[]>((acc, p, i) => [...acc, i ? acc[i - 1] + STACK[i - 1].w + p.w + 0.01 : BASE + p.w], []);

const bounce = (x: number) => {
  const n = 7.5625;
  const d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
};

/** Plates drop onto a loading pin one by one as you scroll: the bar gets heavier with every section. */
function Loading({ progress }: { progress: SceneProps["progress"] }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const spin = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const p = progress.get();
    if (spin.current) spin.current.rotation.y = clock.elapsedTime * 0.18;
    STACK.forEach((_, i) => {
      const m = refs.current[i];
      if (!m) return;
      const k = i < 2 ? 1 : bounce(clamp01((p - 0.03 - (i - 2) * 0.14) / 0.13));
      m.position.y = REST[i] + (1 - k) * (5 + i * 0.4);
      m.rotation.z = (1 - k) * 0.5 * (i % 2 ? 1 : -1);
      m.visible = i < 2 || k > 0.001;
    });
  });
  return (
    <group rotation={[0.42, 0, 0]} position={[0, -0.2, 0]}>
      <group ref={spin}>
        <mesh position={[0, BASE - 0.06, 0]}>
          <cylinderGeometry args={[1.3, 1.4, 0.1, 64]} />
          <meshStandardMaterial color="#1b1b1b" roughness={0.7} />
        </mesh>
        <mesh position={[0, BASE + 1.3, 0]}>
          <cylinderGeometry args={[0.056, 0.056, 2.6, 32]} />
          <Steel rough={0.15} />
        </mesh>
        {STACK.map((pl, i) => (
          <group key={i} ref={(n) => void (refs.current[i] = n)}>
            <Plate R={pl.R} w={pl.w} color={pl.color} />
          </group>
        ))}
      </group>
    </group>
  );
}

export default function PlatesScene(props: SceneProps) {
  return (
    <Stage {...props} fog={FOG} env="#151515" warm="#fff0de" camera={[0, 1.2, 8]} scale={0.95}>
      <CamScroll progress={props.progress} from={[0, 1.2, 8]} to={[0, 2.2, 7]} look={[0, -0.4, 0]} />
      <spotLight position={[1, 6, 3]} angle={0.5} penumbra={0.9} intensity={70} />
      <pointLight position={[-3, 1, -2]} intensity={18} distance={10} color={ACCENT} />
      <Loading progress={props.progress} />
      <Embers count={props.lite ? 30 : 80} origin={[0, -2.2, 0]} area={[5, 1, 3]} rise={4} color="#ffffff" size={0.04} speed={0.05} />
    </Stage>
  );
}
