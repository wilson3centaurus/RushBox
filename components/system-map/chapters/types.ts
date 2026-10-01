import type * as THREE from "three";
import type { Kit } from "../kit";
import type { FlowKind } from "../content";
import type { PricingSettings } from "@/lib/pricing";

/**
 * What the camera must keep in frame — the scene's footprint on the ground,
 * labels included — and the direction it looks from. The engine works out
 * the distance for whatever screen it is on.
 */
export type Shot = {
  x: [number, number];
  z: [number, number];
  /** Height of the tallest thing, labels included. */
  top: number;
  /** Direction from the scene towards the camera. */
  dir: [number, number, number];
  /** A steeper angle for tall phone screens, where width is scarce. */
  portraitDir?: [number, number, number];
};

export type Chapter = {
  group: THREE.Group;
  shot: Shot;
  /** Called every frame while the chapter is on screen. */
  update(dt: number, t: number): void;
  /** Called each time the chapter is shown, to restart its entrance. */
  enter?(): void;
  setStep?(i: number): void;
  setSelected?(id: string | null): void;
  setFilter?(f: Record<FlowKind, boolean>): void;
};

export type ChapterContext = { kit: Kit; pricing: PricingSettings };
