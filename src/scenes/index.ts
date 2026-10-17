import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { SceneKey } from "../lib";
import type { SceneProps } from "./kit";

/** Every gym gets the iron storm; the scene key picks the hero lift at its centre. */
const iron = lazy(() => import("./iron"));
export const SCENES: Record<SceneKey, LazyExoticComponent<ComponentType<SceneProps>>> = {
  barbell: iron,
  plates: iron,
  dumbbells: iron,
  kettlebell: iron,
  neon: iron,
  lotus: iron,
  gada: iron,
};
