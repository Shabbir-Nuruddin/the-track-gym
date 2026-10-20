import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SITE } from "../content";
import { clamp01, smooth, type SceneProps } from "./kit";
import { ACCENT, Barbell, Dumbbell, Kettlebell } from "./gym";
import { Gada } from "./gada";

/*
 * One hero lift, picked by the scene key, sized to fit the screen. It rises in on load,
 * floats gently, and turns and lifts as you scroll. Nothing else in the scene, so it
 * stays smooth on phones; rendering stops once the hero has scrolled away.
 */

const k = SITE.scene;
// footprint of each lift at scale 1: [width, height]
const SIZE: [number, number] = k === "kettlebell" ? [1.6, 2.3] : k === "dumbbells" ? [2.6, 0.8] : k === "gada" ? [2.6, 4.8] : [4.7, 1.9];

function Lift() {
  if (k === "kettlebell")
    return (
      <group position={[0, 1.2, 0]}>
        <Kettlebell size={1.1} />
      </group>
    );
  if (k === "dumbbells") return <Dumbbell size={1.75} />;
  if (k === "gada") return null;
  return <Barbell />;
}

function Hero({ progress, side, still, interactive }: SceneProps) {
  const g = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const { viewport, size, pointer } = useThree();
  const narrow = size.width < 768;
  const fit = Math.min((viewport.width * (narrow ? 0.86 : 0.4)) / SIZE[0], (viewport.height * (narrow ? 0.4 : 0.6)) / SIZE[1]);
  const x = narrow ? 0 : (side === "left" ? 1 : -1) * viewport.width * 0.24;
  const y = narrow ? viewport.height * 0.17 : 0;

  useFrame(({ clock }, dt) => {
    if (!g.current || !spin.current) return;
    const t = still ? 99 : clock.elapsedTime;
    const p = smooth(0, 0.9, progress.get());
    const intro = 1 - Math.pow(1 - clamp01(t / 1.4), 3);
    g.current.position.set(x, y - (1 - intro) * 1.2 + Math.sin(t * 0.9) * 0.06 + p * 0.35, 0);
    g.current.scale.setScalar(fit * (0.85 + intro * 0.15) * (1 + p * 0.12));
    const e = 1 - Math.pow(0.001, dt);
    const px = interactive ? pointer.x : 0;
    const py = interactive ? pointer.y : 0;
    spin.current.rotation.y = THREE.MathUtils.lerp(spin.current.rotation.y, -0.55 + Math.sin(t * 0.35) * 0.12 + p * Math.PI * 1.1 + px * 0.3, e);
    spin.current.rotation.x = THREE.MathUtils.lerp(spin.current.rotation.x, 0.22 + p * 0.25 - py * 0.12, e);
  });

  return (
    <group ref={g}>
      <group ref={spin}>{k === "gada" ? <Gada progress={progress} /> : <Lift />}</group>
    </group>
  );
}

export default function IronScene(props: SceneProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setOnScreen(en.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="h-full w-full">
      <Canvas
        frameloop={props.still ? "demand" : onScreen ? "always" : "never"}
        dpr={props.lite ? 1 : [1, 1.5]}
        camera={{ position: [0, 0.4, 8], fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ touchAction: "pan-y" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 5, 6]} intensity={2.4} color="#fff3e4" />
        <directionalLight position={[-5, 2, 3]} intensity={0.9} />
        <pointLight position={[0, 0.5, -3]} intensity={30} distance={10} color={ACCENT} />
        <Environment resolution={128} frames={1}>
          <color attach="background" args={["#2a2a2a"]} />
          <Lightformer form="rect" intensity={4} color="#fff0de" position={[0, 6, 3]} scale={[12, 3, 1]} rotation={[Math.PI / 2, 0, 0]} />
          <Lightformer form="rect" intensity={2.5} position={[-6, 1, 2]} scale={[3, 10, 1]} rotation={[0, Math.PI / 2, 0]} />
          <Lightformer form="rect" intensity={2} position={[6, 0, 2]} scale={[3, 10, 1]} rotation={[0, -Math.PI / 2, 0]} />
          <Lightformer form="rect" intensity={1.5} position={[0, 0, 8]} scale={[10, 4, 1]} />
        </Environment>
        <Hero {...props} />
      </Canvas>
    </div>
  );
}
