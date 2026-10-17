import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { CamScroll, Embers, Stage, rng, smooth, type SceneProps } from "./kit";
import { ACCENT, Dumbbell, FOG } from "./gym";

/** A crossed pair of hex dumbbells pulls apart as you scroll while a ring of lighter ones orbits them. */
function Pair({ progress }: { progress: SceneProps["progress"] }) {
  const a = useRef<THREE.Group>(null);
  const b = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const orbit = useMemo(() => {
    const r = rng(12);
    return Array.from({ length: 7 }, (_, i) => ({ a: (i / 7) * Math.PI * 2, y: (r() - 0.5) * 0.6, s: 0.38 + r() * 0.12, spin: r() * 6 }));
  }, []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = smooth(0.03, 0.8, progress.get());
    if (a.current) {
      a.current.position.set(-0.15 - p * 0.9, 0.35 + p * 0.7 + Math.sin(t * 0.9) * 0.05, p * 0.6);
      a.current.rotation.set(0.25, 0.5 + t * 0.15, 0.6 - p * 0.9);
    }
    if (b.current) {
      b.current.position.set(0.15 + p * 0.8, -0.35 - p * 0.5 + Math.sin(t * 0.9 + 1.5) * 0.05, -p * 0.4);
      b.current.rotation.set(-0.2, -0.4 - t * 0.12, -0.55 + p * 1.1);
    }
    if (ring.current) {
      ring.current.rotation.y = t * 0.12 + p * 1.5;
      ring.current.position.y = -0.2 + p * 0.4;
      ring.current.scale.setScalar(0.85 + p * 0.35);
    }
  });
  return (
    <group>
      <group ref={a}>
        <Dumbbell size={1.25} />
      </group>
      <group ref={b}>
        <Dumbbell size={1.25} />
      </group>
      <group ref={ring} rotation={[0.28, 0, 0.08]}>
        {orbit.map((o, i) => (
          <group key={i} position={[Math.cos(o.a) * 2.4, o.y, Math.sin(o.a) * 2.4]} rotation={[o.spin, -o.a, 0.4]}>
            <Dumbbell size={o.s} color={i % 2 ? ACCENT : "#bfc4ca"} />
          </group>
        ))}
      </group>
    </group>
  );
}

export default function DumbbellsScene(props: SceneProps) {
  return (
    <Stage {...props} fog={FOG} env="#171717" warm="#fff0de" camera={[0, 0.6, 8]} scale={0.9}>
      <CamScroll progress={props.progress} from={[0, 0.6, 8]} to={[0.3, 0.2, 6.6]} />
      <spotLight position={[0, 6, 4]} angle={0.55} penumbra={0.9} intensity={60} />
      <pointLight position={[-2.5, 1.5, -2]} intensity={18} distance={9} color={ACCENT} />
      <pointLight position={[2.5, -1.2, 2]} intensity={7} distance={8} color="#ffffff" />
      <Pair progress={props.progress} />
      <Embers count={props.lite ? 30 : 80} origin={[0, -2, 0]} area={[5, 1, 3]} rise={4} color={ACCENT} size={0.04} speed={0.05} />
    </Stage>
  );
}
