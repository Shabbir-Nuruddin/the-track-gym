import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { SITE } from "../content";
import { CamScroll, Embers, Stage, clamp01, glowTexture, rng, smooth, type SceneProps } from "./kit";
import { ACCENT, Barbell, Dumbbell, FOG, Kettlebell, Plate } from "./gym";
import { Gada } from "./gada";

/*
 * Iron storm: the gym's hero lift drops out of the sky and slams down, the floor
 * shakes, chalk bursts, and a ring of dumbbells, plates and kettlebells crashes in
 * around it. Scrolling spins the storm up and presses the lift overhead; at the end
 * the whole ring blows out past the camera.
 */

const DROP = 0.35;
const LAND = 1.0;
const FLOOR = -0.78;

const backOut = (x: number) => {
  const c = 1.9;
  const t = x - 1;
  return 1 + (c + 1) * t * t * t + c * t * t;
};

function Core({ progress, still }: { progress: SceneProps["progress"]; still: boolean }) {
  const g = useRef<THREE.Group>(null);
  const k = SITE.scene;
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = still ? 99 : clock.elapsedTime;
    const fall = clamp01((t - DROP) / (LAND - DROP));
    const drop = (1 - fall * fall) * 7;
    const e = t - LAND;
    const bounce = e > 0 ? Math.exp(-e * 7) * Math.abs(Math.sin(e * 16)) * 0.22 : 0;
    const p = smooth(0.03, 0.85, progress.get());
    g.current.position.y = drop + bounce + p * 0.6 + (e > 0 ? Math.sin(t * 1.1) * 0.04 : 0);
    g.current.rotation.set(0.14 + p * 0.5, -0.45 + (e > 0 ? e * 0.12 : 0) + p * 2.4, Math.sin(t * 0.6) * 0.05);
    g.current.scale.setScalar(1 + p * 0.14);
  });
  let body;
  if (k === "kettlebell")
    body = (
      <group position={[0, 1.15, 0]}>
        <Kettlebell size={1.1} />
      </group>
    );
  else if (k === "dumbbells") body = <Dumbbell size={1.75} />;
  else if (k === "gada")
    body = (
      <group scale={0.9}>
        <Gada progress={progress} />
      </group>
    );
  else
    body = (
      <group scale={0.8}>
        <Barbell />
      </group>
    );
  return <group ref={g}>{body}</group>;
}

/** Landing shockwave, chalk cloud and a short camera shake. */
function Impact({ still }: { still: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const puffs = useRef<(THREE.Sprite | null)[]>([]);
  const dirs = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 26 }, () => {
      const a = r() * Math.PI * 2;
      return [Math.cos(a), r(), Math.sin(a), 0.5 + r() * 0.9] as const;
    });
  }, []);
  const tex = glowTexture();
  const { camera } = useThree();
  useFrame(({ clock }) => {
    const e = (still ? 99 : clock.elapsedTime) - LAND;
    const on = e > 0 && e < 1.8;
    [ring.current, ring2.current].forEach((m, j) => {
      if (!m) return;
      const k = clamp01((e - j * 0.12) / (0.8 + j * 0.3));
      m.visible = on && k > 0;
      m.scale.setScalar(0.4 + k * (5 + j * 2));
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - k) * (j ? 0.5 : 0.95);
    });
    dirs.forEach(([x, y, z, s], i) => {
      const sp = puffs.current[i];
      if (!sp) return;
      const k = clamp01(e / 1.7);
      sp.visible = on;
      const d = (1 - Math.pow(1 - k, 3)) * 2.8 * s;
      sp.position.set(x * d, FLOOR + y * d * 0.5, z * d);
      const sc = 0.5 + k * 2;
      sp.scale.set(sc, sc, 1);
      (sp.material as THREE.SpriteMaterial).opacity = (1 - k) * 0.4;
    });
    if (e > 0 && e < 0.5) {
      const a = Math.exp(-e * 9) * 0.16;
      camera.position.x += (Math.random() - 0.5) * a;
      camera.position.y += (Math.random() - 0.5) * a;
    }
  });
  return (
    <group>
      {[ring, ring2].map((r, j) => (
        <mesh key={j} ref={r} position={[0, FLOOR, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <ringGeometry args={[0.9, 1, 96]} />
          <meshBasicMaterial color={j ? "#ffffff" : ACCENT} transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {dirs.map((_, i) => (
        <sprite key={i} ref={(n) => void (puffs.current[i] = n)} visible={false}>
          <spriteMaterial map={tex} color="#f2efe8" transparent depthWrite={false} opacity={0} />
        </sprite>
      ))}
    </group>
  );
}

type Item = { kind: number; r: number; a: number; y: number; s: number; spin: [number, number, number]; d: number; col: string; v: number };

function Piece({ it }: { it: Item }) {
  if (it.kind === 0) return <Dumbbell size={it.s * 1.15} color={it.col} />;
  if (it.kind === 1) return <Plate R={it.s * 1.25} w={it.s * 0.24} color={it.col === ACCENT ? ACCENT : undefined} />;
  return (
    <group position={[0, it.s * 0.9, 0]}>
      <Kettlebell size={it.s * 0.75} color={it.col} />
    </group>
  );
}

/** The ring of free weights: crash in on load, orbit, dodge the cursor, spin up and blow out on scroll. */
function Storm({ progress, lite, still, interactive, side }: Omit<SceneProps, "progress"> & { progress: SceneProps["progress"] }) {
  const items = useMemo<Item[]>(() => {
    const r = rng(21);
    const n = lite ? 12 : 24;
    return Array.from({ length: n }, (_, i) => ({
      kind: i % 3,
      r: 2.1 + r() * 1.5,
      a: (i / n) * Math.PI * 2 + r() * 0.3,
      y: (r() - 0.5) * 2.8,
      s: 0.32 + r() * 0.22,
      spin: [(r() - 0.5) * 1.8, (r() - 0.5) * 1.8, (r() - 0.5) * 1.8],
      d: LAND - 0.15 + r() * 0.8,
      col: r() > 0.45 ? ACCENT : "#c3c8ce",
      v: 0.12 + r() * 0.12,
    }));
  }, [lite]);
  const refs = useRef<(THREE.Group | null)[]>([]);
  const ang = useMemo(() => items.map((it) => it.a), [items]);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const { pointer, size } = useThree();
  const rigX = size.width < 768 ? 0 : side === "left" ? 1.9 : -1.9;
  useFrame(({ clock }, dt) => {
    const t = still ? 99 : clock.elapsedTime;
    const p = progress.get();
    const up = smooth(0.05, 0.7, p);
    const ex = smooth(0.74, 0.98, p);
    const step = Math.min(dt, 0.05);
    items.forEach((it, i) => {
      const g = refs.current[i];
      if (!g) return;
      if (!still) ang[i] += step * (it.v + up * 0.9);
      const k = clamp01((t - it.d) / 1.1);
      const far = 1 - backOut(k);
      const rad = it.r * (1 - 0.28 * up) * (1 + ex * 1.9);
      tmp.set(
        Math.cos(ang[i]) * rad * 0.82 + far * Math.cos(it.a) * 10,
        it.y * (1 - 0.35 * up) + Math.sin(t * 0.8 + i) * 0.12 + far * (it.y > 0 ? 8 : -8),
        Math.sin(ang[i]) * rad + ex * 4 - far * 12,
      );
      if (interactive) {
        const dx = tmp.x - (pointer.x * 4.1 - rigX);
        const dy = tmp.y - pointer.y * 2.3;
        const dist = Math.hypot(dx, dy) + 0.001;
        const push = Math.max(0, 1.5 - dist) * 1.1;
        tmp.x += (dx / dist) * push;
        tmp.y += (dy / dist) * push;
      }
      if (k < 1 || still) g.position.copy(tmp);
      else g.position.lerp(tmp, 0.18);
      if (still) g.rotation.set(it.spin[0] * 2, it.spin[1] * 2, it.spin[2] * 2);
      else {
        const sp = step * (1 + up * 3 + ex * 4);
        g.rotation.x += it.spin[0] * sp;
        g.rotation.y += it.spin[1] * sp;
        g.rotation.z += it.spin[2] * sp;
      }
    });
  });
  return (
    <group>
      {items.map((it, i) => (
        <group key={i} ref={(n) => void (refs.current[i] = n)} position={[0, 40, 0]}>
          <Piece it={it} />
        </group>
      ))}
    </group>
  );
}

export default function IronScene(props: SceneProps) {
  return (
    <Stage {...props} fog={FOG} env="#161616" warm="#fff0de" camera={[0, 0.7, 8.4]} scale={0.9}>
      <CamScroll progress={props.progress} from={[0, 0.7, 8.4]} to={[0.25, 0.1, 6.6]} />
      <spotLight position={[0, 7, 4]} angle={0.55} penumbra={0.9} intensity={70} />
      <pointLight position={[-2.8, 1.5, -2]} intensity={22} distance={10} color={ACCENT} />
      <pointLight position={[2.8, -1.2, 2.5]} intensity={9} distance={9} color="#ffffff" />
      <Core progress={props.progress} still={props.still} />
      <Impact still={props.still} />
      <Storm {...props} />
      <Embers count={props.lite ? 30 : 90} origin={[0, -2.2, 0]} area={[6, 1, 3]} rise={4.5} color={ACCENT} size={0.045} speed={0.06} />
    </Stage>
  );
}
