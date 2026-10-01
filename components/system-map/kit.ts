import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/** Scene palette. RushBox-owned things wear the brand orange. */
export const C = {
  brand: 0xf39c12,
  brandDeep: 0xd35400,
  ink: 0x2c3e50,
  slate: 0x64748b,
  mist: 0xcbd5e1,
  white: 0xffffff,
  wall: 0xf8fafc,
  ground: 0xe9eef5,
  road: 0xd5dde8,
  blue: 0x2a78d6,
  orange: 0xeb6834,
  green: 0x16a34a,
  red: 0xdc2626,
  wood: 0xc8935a,
  kraft: 0xc9a46b,
  glass: 0xa9cbe8,
  leaf: 0x6fbf73,
};

export type LabelTone = "plain" | "brand" | "dark" | "blue" | "green" | "orange" | "red" | "muted";

const TONE_CLASS: Record<LabelTone, string> = {
  plain: "bg-white/95 text-ink-900 ring-1 ring-black/5",
  brand: "bg-brand-400 text-ink-900",
  dark: "bg-ink-900 text-white",
  blue: "bg-[#2a78d6] text-white",
  green: "bg-emerald-600 text-white",
  orange: "bg-[#eb6834] text-white",
  red: "bg-red-600 text-white",
  muted: "bg-white/70 text-ink-400 ring-1 ring-black/5",
};

export type Label = CSS2DObject & {
  set: (next: { title?: string; sub?: string; tone?: LabelTone }) => void;
  setActive: (on: boolean) => void;
};

/**
 * Per-engine factory for meshes and labels. Geometries and materials are
 * shared and disposed together when the map unmounts.
 */
export function createKit(onPick: (id: string) => void) {
  const geometries = new Map<string, THREE.BufferGeometry>();
  const materials = new Map<string, THREE.Material>();
  const textures: THREE.Texture[] = [];

  function geo<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
    let g = geometries.get(key) as T | undefined;
    if (!g) {
      g = make();
      geometries.set(key, g);
    }
    return g;
  }

  function mat(color: number, opts: { emissive?: number; opacity?: number; rough?: number } = {}) {
    const key = `${color}|${opts.emissive ?? 0}|${opts.opacity ?? 1}|${opts.rough ?? 0.75}`;
    let m = materials.get(key) as THREE.MeshStandardMaterial | undefined;
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color,
        roughness: opts.rough ?? 0.75,
        metalness: 0.05,
        emissive: opts.emissive ?? 0x000000,
        transparent: (opts.opacity ?? 1) < 1,
        opacity: opts.opacity ?? 1,
      });
      materials.set(key, m);
    }
    return m;
  }

  const unitBox = () => geo("box", () => new THREE.BoxGeometry(1, 1, 1));

  /** A box whose base sits at y = 0 of its own origin. */
  function box(w: number, h: number, d: number, color: number, opts?: Parameters<typeof mat>[1]) {
    const m = new THREE.Mesh(unitBox(), mat(color, opts));
    m.scale.set(w, h, d);
    m.position.y = h / 2;
    return m;
  }

  function rounded(w: number, h: number, d: number, r: number, color: number) {
    const g = geo(`rbox:${w}:${h}:${d}:${r}`, () => new RoundedBoxGeometry(w, h, d, 3, r));
    const m = new THREE.Mesh(g, mat(color));
    m.position.y = h / 2;
    return m;
  }

  function cylinder(rTop: number, rBottom: number, h: number, color: number, seg = 20) {
    const g = geo(`cyl:${rTop}:${rBottom}:${h}:${seg}`, () => new THREE.CylinderGeometry(rTop, rBottom, h, seg));
    const m = new THREE.Mesh(g, mat(color));
    m.position.y = h / 2;
    return m;
  }

  function sphere(r: number, color: number, opts?: Parameters<typeof mat>[1]) {
    const g = geo(`sph:${r}`, () => new THREE.SphereGeometry(r, 20, 14));
    return new THREE.Mesh(g, mat(color, opts));
  }

  /** Soft contact shadow, much cheaper than real shadow maps on a phone. */
  function shadow(radius: number) {
    let material = materials.get("__shadow") as THREE.MeshBasicMaterial | undefined;
    if (!material) {
      material = new THREE.MeshBasicMaterial({
        map: makeShadowTexture(),
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      });
      materials.set("__shadow", material);
    }
    const m = new THREE.Mesh(geo("shadowPlane", () => new THREE.PlaneGeometry(1, 1)), material);
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.012;
    m.scale.set(radius * 2.4, radius * 2.4, 1);
    m.renderOrder = -1;
    return m;
  }

  let shadowTex: THREE.Texture | null = null;
  function makeShadowTexture() {
    if (shadowTex) return shadowTex;
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(15,23,42,0.45)");
    g.addColorStop(1, "rgba(15,23,42,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    shadowTex = new THREE.CanvasTexture(c);
    textures.push(shadowTex);
    return shadowTex;
  }

  // ------------------------------------------------------------- models

  function house(wall = C.wall, roof = C.blue) {
    const g = new THREE.Group();
    g.add(box(1.3, 0.9, 1.1, wall));
    const r = new THREE.Mesh(
      geo("roof", () => new THREE.ConeGeometry(1.0, 0.6, 4)),
      mat(roof),
    );
    r.rotation.y = Math.PI / 4;
    r.position.y = 0.9 + 0.3;
    r.scale.set(1.05, 1, 0.9);
    g.add(r);
    const door = box(0.28, 0.48, 0.04, C.ink);
    door.position.set(0, 0.24, 0.56);
    g.add(door);
    const win = box(0.26, 0.22, 0.04, C.glass);
    win.position.set(0.38, 0.52, 0.56);
    g.add(win);
    g.add(shadow(0.9));
    return g;
  }

  /** A dark store: wide, windowless, roller door, brand stripe. */
  function warehouse() {
    const g = new THREE.Group();
    g.add(box(2.2, 1.1, 1.6, C.wall));
    const stripe = box(2.22, 0.18, 1.62, C.brand);
    stripe.position.y = 0.95;
    g.add(stripe);
    const roof = box(2.3, 0.12, 1.7, C.mist);
    roof.position.y = 1.1;
    g.add(roof);
    const door = box(0.9, 0.62, 0.04, C.slate);
    door.position.set(-0.35, 0.31, 0.81);
    g.add(door);
    for (let i = 0; i < 4; i++) {
      const slat = box(0.9, 0.02, 0.05, C.ink);
      slat.position.set(-0.35, 0.12 + i * 0.14, 0.82);
      g.add(slat);
    }
    g.add(shadow(1.4));
    return g;
  }

  function tower() {
    const g = new THREE.Group();
    g.add(box(1.4, 2.6, 1.4, C.wall));
    for (let f = 0; f < 4; f++) {
      const band = box(1.42, 0.16, 1.42, C.glass);
      band.position.y = 0.55 + f * 0.5;
      g.add(band);
    }
    const crown = box(1.5, 0.22, 1.5, C.brand);
    crown.position.y = 2.6;
    g.add(crown);
    const mast = cylinder(0.03, 0.03, 0.6, C.ink, 8);
    mast.position.y = 2.82 + 0.3;
    g.add(mast);
    const beacon = sphere(0.09, C.brand, { emissive: 0x7a4300 });
    beacon.position.y = 3.15;
    g.add(beacon);
    g.add(shadow(1.2));
    return g;
  }

  function factory() {
    const g = new THREE.Group();
    g.add(box(1.8, 0.9, 1.3, 0xe2e8f0));
    for (let i = 0; i < 3; i++) {
      const tooth = new THREE.Mesh(
        geo("tooth", () => new THREE.CylinderGeometry(0.0, 0.32, 0.32, 3)),
        mat(C.slate),
      );
      tooth.rotation.set(Math.PI / 2, 0, Math.PI / 2);
      tooth.position.set(-0.6 + i * 0.6, 1.05, 0);
      tooth.scale.set(1, 4, 1);
      g.add(tooth);
    }
    const chimney = cylinder(0.12, 0.14, 0.9, C.slate, 12);
    // cylinder() puts its base at 0; lift it onto the roof.
    chimney.position.set(0.65, 0.9 + 0.45, -0.35);
    g.add(chimney);
    g.add(shadow(1.2));
    return g;
  }

  function shop(awning = C.green) {
    const g = new THREE.Group();
    g.add(box(1.4, 0.95, 1.0, C.wall));
    for (let i = 0; i < 5; i++) {
      const s = box(0.28, 0.06, 0.4, i % 2 ? C.white : awning);
      s.position.set(-0.56 + i * 0.28, 0.82, 0.62);
      s.rotation.x = 0.35;
      g.add(s);
    }
    const win = box(0.9, 0.36, 0.04, C.glass);
    win.position.set(0, 0.42, 0.51);
    g.add(win);
    g.add(shadow(1));
    return g;
  }

  /** A person: vest colour tells you their job. */
  function person(vest = C.blue, skin = 0x8d5a3b) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(geo("capsule", () => new THREE.CapsuleGeometry(0.16, 0.34, 4, 10)), mat(vest));
    body.position.y = 0.33;
    g.add(body);
    const head = sphere(0.13, skin);
    head.position.y = 0.72;
    g.add(head);
    g.add(shadow(0.25));
    return g;
  }

  function wheel(r = 0.16) {
    const w = new THREE.Mesh(geo(`wheel:${r}`, () => new THREE.TorusGeometry(r, r * 0.38, 8, 18)), mat(C.ink));
    w.position.y = r;
    return w;
  }

  /** Motorbike with a RushBox delivery box and its rider. */
  function scooter(withRider = true) {
    const g = new THREE.Group();
    const w1 = wheel();
    w1.position.x = 0.38;
    const w2 = wheel();
    w2.position.x = -0.38;
    g.add(w1, w2);
    const body = box(0.62, 0.16, 0.22, C.red);
    body.position.y = 0.3;
    g.add(body);
    const bars = box(0.06, 0.32, 0.36, C.ink);
    bars.position.set(0.36, 0.42, 0);
    g.add(bars);
    const crate = box(0.34, 0.32, 0.34, C.brand);
    crate.position.set(-0.32, 0.4, 0);
    g.add(crate);
    if (withRider) {
      const rider = person(C.brand);
      rider.position.set(0.02, 0.18, 0);
      rider.scale.setScalar(0.85);
      g.add(rider);
    }
    g.add(shadow(0.45));
    return g;
  }

  /** Bakkie (pickup) — the Move workhorse. */
  function bakkie(color = C.orange) {
    const g = new THREE.Group();
    for (const [x, z] of [[0.55, 0.3], [0.55, -0.3], [-0.5, 0.3], [-0.5, -0.3]]) {
      const w = wheel(0.17);
      w.position.set(x, 0.17, z);
      g.add(w);
    }
    const chassis = box(1.5, 0.22, 0.66, C.ink);
    chassis.position.y = 0.28;
    g.add(chassis);
    const cab = box(0.6, 0.42, 0.62, color);
    cab.position.set(0.42, 0.39 + 0.21, 0);
    g.add(cab);
    const glass = box(0.05, 0.22, 0.52, C.glass);
    glass.position.set(0.73, 0.68, 0);
    g.add(glass);
    const bed = box(0.82, 0.2, 0.64, color);
    bed.position.set(-0.32, 0.39, 0);
    g.add(bed);
    g.add(shadow(0.85));
    return g;
  }

  function truck(color = C.blue) {
    const g = new THREE.Group();
    for (const [x, z] of [[0.8, 0.34], [0.8, -0.34], [-0.7, 0.34], [-0.7, -0.34]]) {
      const w = wheel(0.2);
      w.position.set(x, 0.2, z);
      g.add(w);
    }
    const cab = box(0.55, 0.62, 0.72, color);
    cab.position.set(0.82, 0.3 + 0.31, 0);
    g.add(cab);
    const glass = box(0.05, 0.24, 0.6, C.glass);
    glass.position.set(1.1, 0.78, 0);
    g.add(glass);
    const cargo = box(1.4, 0.92, 0.76, C.white);
    cargo.position.set(-0.22, 0.3 + 0.46, 0);
    g.add(cargo);
    g.add(shadow(1.1));
    return g;
  }

  function van(color = 0x0ea5e9) {
    const g = new THREE.Group();
    for (const [x, z] of [[0.5, 0.3], [0.5, -0.3], [-0.5, 0.3], [-0.5, -0.3]]) {
      const w = wheel(0.17);
      w.position.set(x, 0.17, z);
      g.add(w);
    }
    const body = rounded(1.45, 0.7, 0.66, 0.1, color);
    body.position.y = 0.28 + 0.35;
    g.add(body);
    const glass = box(0.05, 0.24, 0.56, C.glass);
    glass.position.set(0.72, 0.78, 0);
    g.add(glass);
    g.add(shadow(0.85));
    return g;
  }

  function car(color = 0x9ca3af) {
    const g = new THREE.Group();
    for (const [x, z] of [[0.4, 0.27], [0.4, -0.27], [-0.4, 0.27], [-0.4, -0.27]]) {
      const w = wheel(0.14);
      w.position.set(x, 0.14, z);
      g.add(w);
    }
    const body = rounded(1.15, 0.26, 0.58, 0.08, color);
    body.position.y = 0.22 + 0.13;
    g.add(body);
    const top = rounded(0.6, 0.24, 0.52, 0.08, C.glass);
    top.position.set(-0.05, 0.48 + 0.12, 0);
    g.add(top);
    g.add(shadow(0.7));
    return g;
  }

  function pallets(count = 4) {
    const g = new THREE.Group();
    for (let i = 0; i < count; i++) {
      const p = box(0.7, 0.1, 0.5, C.wood);
      p.position.y = 0.05 + i * 0.13;
      g.add(p);
    }
    g.add(shadow(0.45));
    return g;
  }

  function parcel(color = C.kraft) {
    const g = new THREE.Group();
    g.add(box(0.42, 0.32, 0.36, color));
    const tape = box(0.43, 0.04, 0.37, C.brand);
    tape.position.y = 0.3;
    g.add(tape);
    return g;
  }

  function shelf(colors = [C.red, C.green, C.brand, C.blue]) {
    const g = new THREE.Group();
    for (const x of [-0.55, 0.55]) {
      const post = box(0.06, 1.3, 0.4, C.slate);
      post.position.x = x;
      g.add(post);
    }
    for (let level = 0; level < 3; level++) {
      const board = box(1.16, 0.05, 0.42, C.mist);
      board.position.y = 0.15 + level * 0.45;
      g.add(board);
      for (let i = 0; i < 4; i++) {
        const item = box(0.18, 0.22, 0.2, colors[(i + level) % colors.length]);
        item.position.set(-0.4 + i * 0.27, 0.18 + level * 0.45, 0);
        g.add(item);
      }
    }
    g.add(shadow(0.8));
    return g;
  }

  /** Phone or tablet whose screen is a live canvas we can redraw. */
  function device(kind: "phone" | "tablet" | "laptop", screen: Screen) {
    const g = new THREE.Group();
    if (kind === "laptop") {
      const base = rounded(1.5, 0.06, 1.0, 0.03, C.mist);
      g.add(base);
      const lid = new THREE.Group();
      // Hinged at the lid's bottom edge, so it tilts back like a real laptop.
      const back = rounded(1.5, 0.95, 0.05, 0.03, C.slate);
      lid.add(back);
      const s = new THREE.Mesh(geo("screen:laptop", () => new THREE.PlaneGeometry(1.38, 0.84)), screen.material);
      s.position.set(0, 0.475, 0.03);
      lid.add(s);
      lid.position.set(0, 0.06, -0.48);
      lid.rotation.x = -0.18;
      g.add(lid);
      g.add(shadow(0.9));
      return g;
    }
    const [w, h] = kind === "phone" ? [0.62, 1.22] : [1.25, 0.92];
    const shell = rounded(w, h, 0.08, 0.06, C.ink);
    g.add(shell);
    const s = new THREE.Mesh(geo(`screen:${kind}`, () => new THREE.PlaneGeometry(w - 0.08, h - 0.1)), screen.material);
    s.position.set(0, h / 2, 0.045);
    g.add(s);
    return g;
  }

  // ------------------------------------------------------------- canvas screens

  type Screen = { material: THREE.MeshBasicMaterial; draw: (lines: string[], accent?: string) => void };

  function screen(width = 256, height = 480, accent = "#f39c12"): Screen {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    textures.push(texture);
    const material = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
    materials.set(`screen:${materials.size}`, material);

    function draw(lines: string[], color = accent) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      const header = Math.round(height * 0.2);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, header);
      const base = Math.round(width / 9);
      ctx.fillStyle = "#1f2937";
      ctx.font = `700 ${Math.round(base * 1.05)}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
      ctx.textBaseline = "middle";
      ctx.fillText(lines[0] ?? "", base * 0.6, header / 2, width - base);
      ctx.fillStyle = "#334155";
      lines.slice(1).forEach((line, i) => {
        ctx.font = `${i === 0 ? 600 : 500} ${Math.round(base * (i === 0 ? 0.92 : 0.8))}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
        wrap(ctx, line, base * 0.6, header + base * 1.3 + i * base * 2.1, width - base * 1.2, base * 0.95);
      });
      texture.needsUpdate = true;
    }

    return { material, draw };
  }

  // ------------------------------------------------------------- labels

  function label(opts: {
    title: string;
    sub?: string;
    tone?: LabelTone;
    pick?: string;
    small?: boolean;
    /** Hidden on small screens, where every label competes for room. */
    optional?: boolean;
    /** Keep the title but drop the second line on small screens. */
    subOptional?: boolean;
    /** Appended to the title on larger screens only. */
    titleExtra?: string;
    /** Which edge of the label sits on its anchor point. */
    anchor?: "center" | "left" | "right";
  }): Label {
    const outer = document.createElement("div");
    const inner = document.createElement("div");
    outer.appendChild(inner);
    if (opts.optional) outer.classList.add("sm-optional");
    if (opts.anchor === "left") inner.style.transform = "translateX(50%)";
    if (opts.anchor === "right") inner.style.transform = "translateX(-50%)";
    const obj = new CSS2DObject(outer) as Label;
    let tone: LabelTone = opts.tone ?? "plain";
    let title = opts.title;
    let sub = opts.sub;
    let active = false;

    function render() {
      inner.className = [
        "rounded-xl text-center leading-tight shadow-md transition-transform duration-200 select-none",
        opts.small ? "px-1.5 py-0.5" : "px-2.5 py-1",
        TONE_CLASS[tone],
        opts.pick ? "pointer-events-auto cursor-pointer" : "pointer-events-none",
        active ? "scale-110 ring-2 ring-brand-500" : "",
      ].join(" ");
      inner.innerHTML = "";
      const t = document.createElement("div");
      t.className = `${opts.small ? "text-[9px]" : "text-[11px]"} font-bold whitespace-nowrap`;
      t.textContent = title;
      if (opts.titleExtra) {
        const extra = document.createElement("span");
        extra.className = "sm-optional";
        extra.textContent = opts.titleExtra;
        t.appendChild(extra);
      }
      inner.appendChild(t);
      if (sub) {
        const s = document.createElement("div");
        s.className = `sm-sub ${opts.subOptional ? "sm-optional" : ""} ${opts.small ? "text-[8px]" : "text-[9px]"} opacity-75 whitespace-nowrap`;
        s.textContent = sub;
        inner.appendChild(s);
      }
    }

    if (opts.pick) {
      const id = opts.pick;
      inner.addEventListener("click", (e) => {
        e.stopPropagation();
        onPick(id);
      });
    }

    obj.set = (next) => {
      title = next.title ?? title;
      sub = next.sub === undefined ? sub : next.sub;
      tone = next.tone ?? tone;
      render();
    };
    obj.setActive = (on) => {
      if (on === active) return;
      active = on;
      render();
    };
    render();
    return obj;
  }

  // ------------------------------------------------------------- flows

  /** A raised arc between two points, drawn as a thin tube. */
  function arc(from: THREE.Vector3, to: THREE.Vector3, color: number, lift = 1.6, sideways = 0) {
    const mid = from.clone().add(to).multiplyScalar(0.5);
    const dir = to.clone().sub(from);
    const side = new THREE.Vector3(-dir.z, 0, dir.x).normalize().multiplyScalar(sideways);
    mid.add(side);
    mid.y += lift + dir.length() * 0.12;
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    const tubeMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35, depthWrite: false });
    materials.set(`arc:${materials.size}`, tubeMat);
    const tubeGeo = new THREE.TubeGeometry(curve, 40, 0.035, 6, false);
    geometries.set(`arc:${geometries.size}`, tubeGeo);
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    return { curve, tube, material: tubeMat };
  }

  /** Little tokens travelling along a curve: blue orders, orange goods, green money. */
  function packets(curve: THREE.Curve<THREE.Vector3>, kind: "orders" | "goods" | "money", count = 3) {
    const color = kind === "orders" ? C.blue : kind === "goods" ? C.brand : C.green;
    const group = new THREE.Group();
    const items: THREE.Object3D[] = [];
    for (let i = 0; i < count; i++) {
      let m: THREE.Mesh;
      if (kind === "goods") {
        m = new THREE.Mesh(unitBox(), mat(color));
        m.scale.setScalar(0.2);
      } else if (kind === "money") {
        m = new THREE.Mesh(geo("coin", () => new THREE.CylinderGeometry(0.13, 0.13, 0.05, 18)), mat(0x22c55e, { emissive: 0x0b3d1d }));
        m.rotation.x = Math.PI / 2;
      } else {
        m = sphere(0.1, color, { emissive: 0x0b2a55 });
      }
      group.add(m);
      items.push(m);
    }
    const tmp = new THREE.Vector3();
    return {
      group,
      update(t: number, speed = 0.22) {
        items.forEach((m, i) => {
          const u = (t * speed + i / count) % 1;
          curve.getPointAt(u, tmp);
          m.position.copy(tmp);
          if (kind === "money") m.rotation.z = t * 3 + i;
        });
      },
    };
  }

  /** Flat ring under a selected thing. */
  function halo(radius: number, color = C.brand) {
    const g = geo(`halo:${radius}`, () => new THREE.RingGeometry(radius * 0.82, radius, 48));
    const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false });
    materials.set(`halo:${materials.size}`, m);
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.02;
    return mesh;
  }

  /** Tag a group so a tap anywhere on it selects `id`. */
  function pickable<T extends THREE.Object3D>(obj: T, id: string) {
    obj.userData.pick = id;
    return obj;
  }

  function dispose() {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    geometries.clear();
    materials.clear();
  }

  return {
    mat, box, rounded, cylinder, sphere, shadow,
    house, warehouse, tower, factory, shop, person, scooter, bakkie, truck, van, car,
    pallets, parcel, shelf, device, screen, label, arc, packets, halo, pickable, dispose,
  };
}

export type Kit = ReturnType<typeof createKit>;

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}

/** Frame-rate independent easing towards a target. */
export function damp(current: number, target: number, rate: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}

export function dampVec(v: THREE.Vector3, target: THREE.Vector3, rate: number, dt: number) {
  const k = 1 - Math.exp(-rate * dt);
  v.x += (target.x - v.x) * k;
  v.y += (target.y - v.y) * k;
  v.z += (target.z - v.z) * k;
}
