import { useMemo } from "react";
import * as THREE from "three";
import { SITE } from "../content";
import { lathe } from "./kit";

/* Shared gym hardware: every piece is procedural, tinted by the site's accent. */

export const ACCENT = SITE.theme.accent;
export const FOG = SITE.theme.bg;

export function Steel({ rough = 0.22 }: { rough?: number }) {
  return <meshStandardMaterial color="#d9dde2" metalness={1} roughness={rough} envMapIntensity={1.2} />;
}
export function Rubber({ color = "#151515" }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.78} metalness={0.05} side={THREE.DoubleSide} />;
}
export function Paint({ color = ACCENT }: { color?: string }) {
  return <meshPhysicalMaterial color={color} roughness={0.45} metalness={0.1} clearcoat={0.6} clearcoatRoughness={0.3} side={THREE.DoubleSide} />;
}

/** Bumper plate lying flat (axis = Y): raised rim, recessed face, steel hub. */
export function usePlateGeo(R: number, w: number) {
  return useMemo(
    () =>
      lathe(
        [
          [0.06, -w * 0.5],
          [R * 0.3, -w * 0.55],
          [R * 0.33, -w * 0.82],
          [R * 0.9, -w * 0.82],
          [R * 0.96, -w],
          [R, -w * 0.75],
          [R, w * 0.75],
          [R * 0.96, w],
          [R * 0.9, w * 0.82],
          [R * 0.33, w * 0.82],
          [R * 0.3, w * 0.55],
          [0.06, w * 0.5],
          [0.06, -w * 0.5],
        ],
        72,
      ),
    [R, w],
  );
}

export function Plate({ R, w, color, position, rotation }: { R: number; w: number; color?: string; position?: [number, number, number]; rotation?: [number, number, number] }) {
  const geo = usePlateGeo(R, w);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo}>{color ? <Paint color={color} /> : <Rubber />}</mesh>
      <mesh>
        <cylinderGeometry args={[R * 0.3, R * 0.3, w * 1.12, 40, 1, true]} />
        <Steel />
      </mesh>
    </group>
  );
}

/** Olympic barbell along X, loaded with a plate stack each side. */
export function Barbell({ load = [{ R: 0.9, w: 0.11, color: ACCENT }, { R: 0.68, w: 0.08 }, { R: 0.42, w: 0.04, color: "#c9ced4" }] }: { load?: { R: number; w: number; color?: string }[] }) {
  const Z: [number, number, number] = [0, 0, Math.PI / 2];
  return (
    <group>
      <mesh rotation={Z}>
        <cylinderGeometry args={[0.032, 0.032, 3.2, 24]} />
        <Steel rough={0.4} />
      </mesh>
      {[-1, 1].map((s) => {
        let x = 1.68;
        return (
          <group key={s} scale={[s, 1, 1]}>
            <mesh rotation={Z} position={[1.62, 0, 0]}>
              <cylinderGeometry args={[0.085, 0.085, 0.07, 32]} />
              <Steel />
            </mesh>
            <mesh rotation={Z} position={[1.98, 0, 0]}>
              <cylinderGeometry args={[0.056, 0.056, 0.66, 32]} />
              <Steel rough={0.15} />
            </mesh>
            {load.map((p, i) => {
              const at = x + p.w;
              x += p.w * 2 + 0.01;
              return <Plate key={i} R={p.R} w={p.w} color={p.color} position={[at, 0, 0]} rotation={Z} />;
            })}
          </group>
        );
      })}
    </group>
  );
}

/** Hex dumbbell along X: rubber hex heads with a painted face ring, knurled chrome handle. */
export function Dumbbell({ size = 1, color = ACCENT }: { size?: number; color?: string }) {
  const Z: [number, number, number] = [0, 0, Math.PI / 2];
  const r = 0.34 * size;
  const len = 0.42 * size;
  const gap = 0.3 * size;
  return (
    <group>
      <mesh rotation={Z}>
        <cylinderGeometry args={[0.055 * size, 0.055 * size, gap * 2 + 0.1, 24]} />
        <Steel rough={0.35} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} scale={[s, 1, 1]}>
          <mesh rotation={Z} position={[gap + len / 2, 0, 0]}>
            <cylinderGeometry args={[r, r, len, 6]} />
            <Rubber />
          </mesh>
          <mesh rotation={Z} position={[gap + len + 0.004, 0, 0]}>
            <cylinderGeometry args={[r * 0.55, r * 0.55, 0.012, 6]} />
            <Paint color={color} />
          </mesh>
          <mesh rotation={Z} position={[gap - 0.02, 0, 0]}>
            <cylinderGeometry args={[0.09 * size, 0.09 * size, 0.05, 24]} />
            <Steel />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Competition kettlebell: lathe bell, arched handle. Origin at the top of the handle. */
export function Kettlebell({ size = 1, color = ACCENT }: { size?: number; color?: string }) {
  const body = useMemo(
    () =>
      lathe(
        [
          [0, -0.72],
          [0.42, -0.7],
          [0.6, -0.55],
          [0.7, -0.22],
          [0.68, 0.12],
          [0.56, 0.4],
          [0.36, 0.55],
          [0, 0.58],
        ],
        64,
      ),
    [],
  );
  return (
    <group scale={size}>
      <group position={[0, -1.22, 0]}>
        <mesh geometry={body}>
          <Paint color={color} />
        </mesh>
        <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7, 0.012, 8, 64]} />
          <meshStandardMaterial color="#111" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.78, 0]}>
          <torusGeometry args={[0.36, 0.075, 20, 48, Math.PI]} />
          <Steel rough={0.3} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0.36 * s, 0.62, 0]}>
            <cylinderGeometry args={[0.075, 0.09, 0.34, 20]} />
            <Steel rough={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
