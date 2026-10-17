import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { CamScroll, Embers, Stage, smooth, type SceneProps } from "./kit";
import { ACCENT, FOG } from "./gym";

/** A cupped petal: a flattened sphere stretched forward from its base, tapering to a lifted tip. */
function petalGeo() {
  const g = new THREE.SphereGeometry(1, 28, 18);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) * 0.36;
    const z = (p.getZ(i) + 1) * 0.55;
    const y = p.getY(i) * 0.05 + z * z * 0.18 + Math.abs(x) * 0.25;
    const w = (1 - Math.pow(z / 1.1 - 0.4, 2) * 0.6) * (1 - Math.pow(z / 1.1, 6) * 0.9);
    p.setXYZ(i, x * w, y, z);
  }
  g.computeVertexNormals();
  return g;
}

const RINGS = [
  { n: 7, from: 1.35, to: 0.95, s: 0.62, off: 0, tint: 0.55 },
  { n: 9, from: 1.15, to: 0.55, s: 0.85, off: 0.35, tint: 0.3 },
  { n: 11, from: 0.95, to: 0.18, s: 1.05, off: 0.1, tint: 0 },
];

/** The lotus opens as you scroll: each ring of petals leans out further than the one inside it. */
function Lotus({ progress }: { progress: SceneProps["progress"] }) {
  const geo = useMemo(petalGeo, []);
  const colors = useMemo(() => RINGS.map((r) => new THREE.Color(ACCENT).lerp(new THREE.Color("#fff6ee"), r.tint)), []);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const spin = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = smooth(0, 0.75, progress.get());
    if (spin.current) spin.current.rotation.y = t * 0.08;
    let k = 0;
    RINGS.forEach((r) => {
      for (let i = 0; i < r.n; i++) {
        const m = refs.current[k++];
        if (m) m.rotation.x = -(r.from + (r.to - r.from) * p) - Math.sin(t * 0.8 + i) * 0.02;
      }
    });
  });
  let k = 0;
  return (
    <group position={[0, -0.6, 0]} rotation={[0.45, 0, 0]}>
      <group ref={spin}>
        {RINGS.map((r, ri) =>
          Array.from({ length: r.n }, (_, i) => {
            const idx = k++;
            return (
              <group key={`${ri}-${i}`} rotation={[0, (i / r.n) * Math.PI * 2 + r.off, 0]}>
                <mesh ref={(n) => void (refs.current[idx] = n)} geometry={geo} scale={r.s}>
                  <meshPhysicalMaterial color={colors[ri]} roughness={0.5} sheen={1} sheenColor="#ffffff" sheenRoughness={0.4} side={THREE.DoubleSide} />
                </mesh>
              </group>
            );
          }),
        )}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.2, 0.16, 0.16, 32]} />
          <meshStandardMaterial color="#e9b949" roughness={0.5} emissive="#6b4a00" emissiveIntensity={0.4} />
        </mesh>
      </group>
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.4, 64]} />
        <meshStandardMaterial color={FOG} metalness={0.9} roughness={0.18} />
      </mesh>
    </group>
  );
}

export default function LotusScene(props: SceneProps) {
  return (
    <Stage {...props} fog={FOG} env="#151a14" warm="#fff3dc" camera={[0, 1.2, 7.5]}>
      <CamScroll progress={props.progress} from={[0, 1.2, 7.5]} to={[0, 2.4, 6]} look={[0, -0.3, 0]} />
      <spotLight position={[0, 6, 2]} angle={0.6} penumbra={1} intensity={50} color="#fff5e6" />
      <pointLight position={[0, 0.4, 0]} intensity={6} distance={4} color="#ffd38a" />
      <pointLight position={[-3, 1, -2]} intensity={12} distance={9} color={ACCENT} />
      <Lotus progress={props.progress} />
      <Embers count={props.lite ? 30 : 70} origin={[0, -1.4, 0]} area={[4, 1, 3]} rise={4} color="#ffd38a" size={0.05} speed={0.04} />
    </Stage>
  );
}
