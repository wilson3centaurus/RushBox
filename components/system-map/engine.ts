import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { C, createKit } from "./kit";
import type { ChapterId, FlowKind } from "./content";
import type { Chapter, ChapterContext, Shot } from "./chapters/types";
import { players } from "./chapters/players";
import { grocery } from "./chapters/grocery";
import { move } from "./chapters/move";
import { money } from "./chapters/money";
import { apps } from "./chapters/apps";
import { cash } from "./chapters/cash";
import type { PricingSettings } from "@/lib/pricing";

const BUILDERS: Record<ChapterId, (ctx: ChapterContext) => Chapter> = {
  players,
  grocery,
  move,
  money,
  apps,
  cash,
};

/** Chapters that slowly turn until someone touches them. */
const IDLE_SPIN: ChapterId[] = ["players", "apps"];

export type Engine = {
  setChapter(id: ChapterId): void;
  setStep(i: number): void;
  select(id: string | null): void;
  setFilter(f: Record<FlowKind, boolean>): void;
  /** Pixels covered by overlays at the top and bottom, kept clear when framing. */
  setInsets(insets: { top: number; bottom: number }): void;
  resetView(): void;
  dispose(): void;
};

export type EngineOptions = {
  pricing: PricingSettings;
  onSelect: (id: string | null) => void;
  onInteract?: () => void;
  reducedMotion?: boolean;
};

/** Throws if the browser has no WebGL; the caller shows the text version instead. */
export function createEngine(container: HTMLElement, opts: EngineOptions): Engine {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0xf3f6fa, 1);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.touchAction = "none";
  container.appendChild(renderer.domElement);

  const labels = new CSS2DRenderer();
  Object.assign(labels.domElement.style, { position: "absolute", inset: "0", pointerEvents: "none" });
  container.appendChild(labels.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 400);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb6c2d2, 1.7));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(6, 12, 8);
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(9.6, 9.9, 0.3, 96),
    new THREE.MeshStandardMaterial({ color: C.ground, roughness: 1 }),
  );
  ground.position.y = -0.15;
  scene.add(ground);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = 1.38;
  controls.minPolarAngle = 0.15;
  controls.rotateSpeed = 0.7;
  controls.autoRotateSpeed = 0.5;

  const kit = createKit((id) => opts.onSelect(id));
  const context: ChapterContext = { kit, pricing: opts.pricing };
  const built = new Map<ChapterId, Chapter>();
  let active: Chapter | null = null;
  let activeId: ChapterId | null = null;
  let touched = false;

  // ------------------------------------------------------------- camera

  let insets = { top: 48, bottom: 12 };
  let tween: {
    fromPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toPos: THREE.Vector3;
    toTarget: THREE.Vector3;
    t: number;
  } | null = null;

  const probe = new THREE.PerspectiveCamera();
  const corner = new THREE.Vector3();

  /**
   * Find the closest camera position, looking from the shot's direction, at
   * which the whole footprint projects inside the free part of the screen.
   */
  function frame(shot: Shot) {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    const portrait = w / h < 0.9;
    const dir = new THREE.Vector3(...(portrait && shot.portraitDir ? shot.portraitDir : shot.dir)).normalize();
    const target = new THREE.Vector3((shot.x[0] + shot.x[1]) / 2, shot.top * 0.3, (shot.z[0] + shot.z[1]) / 2);
    const corners: THREE.Vector3[] = [];
    for (const x of shot.x) for (const z of shot.z) for (const y of [0, shot.top]) corners.push(new THREE.Vector3(x, y, z));

    probe.copy(camera);
    // Room for label overhang at the sides, and for the overlays top and bottom.
    const xr = 1 - (2 * 28) / w;
    const yr = 1 - (insets.top + insets.bottom) / h;
    // With the view offset applied, the free area is centred here in NDC.
    const cy = (insets.bottom - insets.top) / h;

    let lo = 1;
    let hi = 400;
    for (let i = 0; i < 32; i++) {
      const d = (lo + hi) / 2;
      probe.position.copy(target).addScaledVector(dir, d);
      probe.lookAt(target);
      probe.updateMatrixWorld();
      const fits = corners.every((c) => {
        corner.copy(c).project(probe);
        return corner.z < 1 && Math.abs(corner.x) <= xr && Math.abs(corner.y - cy) <= yr;
      });
      if (fits) hi = d;
      else lo = d;
    }
    return { target, position: target.clone().addScaledVector(dir, hi), dist: hi };
  }

  /** Shift the picture so its centre is the middle of the area the overlays leave free. */
  function applyInsets() {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    camera.setViewOffset(w, h, 0, (insets.bottom - insets.top) / 2, w, h);
    camera.updateProjectionMatrix();
  }

  function flyTo(shot: Shot, instant = false) {
    const { target, position, dist } = frame(shot);
    controls.minDistance = dist * 0.3;
    controls.maxDistance = dist * 1.8;
    if (instant || opts.reducedMotion) {
      camera.position.copy(position);
      controls.target.copy(target);
      tween = null;
      controls.update();
      return;
    }
    tween = {
      fromPos: camera.position.clone(),
      fromTarget: controls.target.clone(),
      toPos: position,
      toTarget: target,
      t: 0,
    };
  }

  // ------------------------------------------------------------- picking

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let down: { x: number; y: number } | null = null;

  function visibleInScene(o: THREE.Object3D | null) {
    for (let n = o; n; n = n.parent) if (!n.visible) return false;
    return true;
  }

  function onPointerDown(e: PointerEvent) {
    down = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp(e: PointerEvent) {
    if (!down || !active) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
    down = null;
    if (moved > 6) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    for (const hit of raycaster.intersectObjects(active.group.children, true)) {
      if (!visibleInScene(hit.object)) continue;
      for (let n: THREE.Object3D | null = hit.object; n; n = n.parent) {
        if (typeof n.userData.pick === "string") {
          opts.onSelect(n.userData.pick);
          return;
        }
      }
    }
    opts.onSelect(null);
  }

  function onStart() {
    if (!touched) {
      touched = true;
      controls.autoRotate = false;
      opts.onInteract?.();
    }
    tween = null;
  }

  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  controls.addEventListener("start", onStart);

  // ------------------------------------------------------------- size and visibility

  function resize() {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = `${w}px`;
    renderer.domElement.style.height = `${h}px`;
    labels.setSize(w, h);
    labels.domElement.classList.toggle("sm-compact", w < 560);
    camera.aspect = w / h;
    applyInsets();
    // Re-frame after a rotation or resize, unless the viewer has moved the camera.
    if (active && !touched) flyTo(active.shot, true);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  let last = performance.now();
  let elapsed = 0;

  function tick() {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += opts.reducedMotion ? dt * 0.4 : dt;

    if (tween) {
      tween.t = Math.min(1, tween.t + dt / 1.1);
      const k = tween.t < 0.5 ? 4 * tween.t ** 3 : 1 - (-2 * tween.t + 2) ** 3 / 2;
      camera.position.lerpVectors(tween.fromPos, tween.toPos, k);
      controls.target.lerpVectors(tween.fromTarget, tween.toTarget, k);
      if (tween.t >= 1) tween = null;
    }
    controls.update();
    // Keep panning from losing the scene off the edge of the island.
    if (controls.target.length() > 6) controls.target.setLength(6);

    active?.update(dt, elapsed);
    renderer.render(scene, camera);
    labels.render(scene, camera);
  }

  let running = false;
  function run(on: boolean) {
    if (on === running) return;
    running = on;
    if (on) last = performance.now();
    renderer.setAnimationLoop(on ? tick : null);
  }
  // Stop drawing while scrolled out of view; phones thank us.
  const visibility = new IntersectionObserver(([entry]) => run(entry.isIntersecting), { threshold: 0.01 });
  visibility.observe(container);

  resize();
  run(true);

  // ------------------------------------------------------------- API

  return {
    setChapter(id) {
      if (id === activeId) return;
      if (active) active.group.visible = false;
      let next = built.get(id);
      if (!next) {
        next = BUILDERS[id](context);
        built.set(id, next);
        scene.add(next.group);
      }
      next.group.visible = true;
      next.enter?.();
      next.setSelected?.(null);
      active = next;
      activeId = id;
      controls.autoRotate = !touched && !opts.reducedMotion && IDLE_SPIN.includes(id);
      flyTo(next.shot);
    },
    setStep(i) {
      active?.setStep?.(i);
    },
    select(id) {
      active?.setSelected?.(id);
    },
    setFilter(f) {
      built.get("players")?.setFilter?.(f);
    },
    setInsets(next) {
      if (next.top === insets.top && next.bottom === insets.bottom) return;
      insets = next;
      applyInsets();
      if (active && !touched) flyTo(active.shot);
    },
    resetView() {
      if (active) flyTo(active.shot);
    },
    dispose() {
      run(false);
      visibility.disconnect();
      resizeObserver.disconnect();
      controls.removeEventListener("start", onStart);
      controls.dispose();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else m?.dispose();
        if (o instanceof CSS2DObject) o.element.remove();
      });
      kit.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      labels.domElement.remove();
    },
  };
}
