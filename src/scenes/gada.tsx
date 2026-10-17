import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { CamScroll, Embers, Stage, lathe, smooth, type SceneProps } from "./kit";
import { ACCENT, FOG } from "./gym";

const GOLD = "#d8a640";

function Gold({ rough = 0.28 }: { rough?: number }) {
  return <meshStandardMaterial color={GOLD} metalness={1} roughness={rough} envMapIntensity={1.4} />;
}

/** Fluted mace head: a sphere pushed out in eight ribs, slightly taller than wide. */
function headGeo() {
  const g = new THREE.SphereGeometry(0.72, 96, 64);
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.z, v.x);
    const lat = Math.abs(v.y) / 0.72;
    const k = 1 + 0.07 * Math.pow(Math.abs(Math.cos(a * 4)), 3) * (1 - lat * lat);
    p.setXYZ(i, v.x * k, v.y * 1.12, v.z * k);
  }
  g.computeVertexNormals();
  return g;
}

/** The gada, Hanuman's mace and the akhada's oldest training tool, swings from upright onto the shoulder. */
export function Gada({ progress }: { progress: SceneProps["progress"] }) {
  const head = useMemo(headGeo, []);
  const collar = useMemo(() => lathe([[0.07, 0], [0.2, 0.04], [0.26, 0.12], [0.18, 0.2], [0.1, 0.26], [0.07, 0.3]], 48), []);
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.elapsedTime;
    const p = smooth(0.02, 0.8, progress.get());
    g.current.rotation.z = 0.28 - p * 1.25 + Math.sin(t * 0.7) * 0.03;
    g.current.rotation.y = t * 0.25;
    g.current.position.y = -0.2 + p * 0.5;
  });
  return (
    <group ref={g}>
      <mesh geometry={head} position={[0, 1.15, 0]}>
        <Gold />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <coneGeometry args={[0.1, 0.36, 24]} />
        <Gold rough={0.2} />
      </mesh>
      <mesh position={[0, 1.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.035, 12, 32]} />
        <Gold rough={0.2} />
      </mesh>
      <mesh geometry={collar} position={[0, 0.12, 0]}>
        <Gold />
      </mesh>
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.07, 0.075, 2.5, 24]} />
        <meshStandardMaterial color="#6b3412" roughness={0.55} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0, -1.15 - i * 0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.078, 0.018, 8, 24]} />
          <meshStandardMaterial color={ACCENT} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, -2.4, 0]}>
        <sphereGeometry args={[0.12, 24, 16]} />
        <Gold />
      </mesh>
    </group>
  );
}

export default function GadaScene(props: SceneProps) {
  return (
    <Stage {...props} fog={FOG} env="#1c120a" warm="#ffe2b8" camera={[0, 0.2, 8.4]} scale={0.95}>
      <CamScroll progress={props.progress} from={[0, 0.2, 8.4]} to={[0.4, 0.6, 7]} look={[0, 0, 0]} />
      <spotLight position={[1, 6, 3]} angle={0.5} penumbra={0.9} intensity={70} color="#fff1dc" />
      <pointLight position={[-2.5, 1.5, -1.5]} intensity={22} distance={9} color={ACCENT} />
      <pointLight position={[2.5, -1, 2]} intensity={8} distance={8} color="#ffd29a" />
      <Gada progress={props.progress} />
      <Embers count={props.lite ? 40 : 100} origin={[0, -2.2, 0]} area={[5, 1, 3]} rise={4.5} color="#ffb347" size={0.05} speed={0.07} />
    </Stage>
  );
}
