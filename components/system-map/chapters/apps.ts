import * as THREE from "three";
import { C, type Label } from "../kit";
import { APPS, type AppId } from "../content";
import type { Chapter, ChapterContext } from "./types";

const CLOUD = new THREE.Vector3(0, 3.0, -1.9);

const DEVICES: {
  id: Exclude<AppId, "cloud">;
  kind: "phone" | "tablet" | "laptop";
  at: [number, number];
  accent: string;
  screen: string[];
}[] = [
  { id: "customer", kind: "phone", at: [-1.9, -0.1], accent: "#f39c12", screen: ["RushBox", "Groceries in 20 min", "Move anything", "Track it live"] },
  { id: "partner", kind: "phone", at: [1.9, -0.1], accent: "#2c3e50", screen: ["Partner", "You're online", "New drop · $1.20", "Bid on Move jobs"] },
  { id: "store", kind: "tablet", at: [-1.9, 2.7], accent: "#2a78d6", screen: ["Store", "RB-4821 · 6 items", "Pick → check → pack", "3 ready for riders"] },
  { id: "admin", kind: "laptop", at: [1.9, 2.7], accent: "#16a34a", screen: ["Admin", "312 orders today", "2 drivers to verify", "Pricing & delivery"] },
];

export function apps({ kit }: ChapterContext): Chapter {
  const group = new THREE.Group();
  const nodes = new Map<AppId, { root: THREE.Object3D; label: Label; halo?: THREE.Mesh }>();
  const floaters: { obj: THREE.Object3D; phase: number; base: number }[] = [];
  const flows: ReturnType<typeof kit.packets>[] = [];

  // The cloud: a soft cluster of spheres.
  const cloud = new THREE.Group();
  [
    [0, 0, 0, 0.75],
    [0.75, -0.1, 0.1, 0.55],
    [-0.75, -0.12, 0.05, 0.58],
    [0.35, 0.35, -0.1, 0.5],
    [-0.35, 0.3, 0.15, 0.48],
  ].forEach(([x, y, z, r]) => {
    const puff = kit.sphere(r, C.white, { emissive: 0x1d3557 });
    puff.position.set(x, y, z);
    cloud.add(puff);
  });
  cloud.position.copy(CLOUD);
  kit.pickable(cloud, "cloud");
  group.add(cloud);
  const cloudLabel = kit.label({ title: APPS.cloud.label, sub: APPS.cloud.sub, tone: "dark", pick: "cloud" });
  cloudLabel.position.copy(CLOUD).add(new THREE.Vector3(0, 1.2, 0));
  group.add(cloudLabel);
  nodes.set("cloud", { root: cloud, label: cloudLabel });
  floaters.push({ obj: cloud, phase: 0, base: CLOUD.y });

  DEVICES.forEach((d, i) => {
    const [x, z] = d.at;
    const root = new THREE.Group();
    root.position.set(x, 0, z);
    kit.pickable(root, d.id);
    group.add(root);

    const plinth = kit.cylinder(0.7, 0.8, 0.22, C.mist, 32);
    root.add(plinth);
    root.add(kit.shadow(0.9));

    const scr = kit.screen(d.kind === "phone" ? 256 : 400, d.kind === "phone" ? 480 : 300, d.accent);
    scr.draw(d.screen, d.accent);
    const dev = kit.device(d.kind, scr);
    dev.position.y = 0.24;
    dev.scale.setScalar(d.kind === "laptop" ? 1.0 : d.kind === "tablet" ? 1.15 : 1.25);
    // Turn each device slightly towards the middle.
    dev.rotation.y = -x * 0.08;
    root.add(dev);
    floaters.push({ obj: dev, phase: i * 1.3, base: dev.position.y });

    const label = kit.label({ title: APPS[d.id].label, sub: APPS[d.id].sub, tone: "plain", pick: d.id });
    label.position.set(x, -0.05, z + 0.95);
    group.add(label);

    const halo = kit.halo(1.05);
    halo.visible = false;
    root.add(halo);
    nodes.set(d.id, { root, label, halo });

    // Data both ways between each app and the cloud.
    const top = new THREE.Vector3(x, d.kind === "laptop" ? 1.2 : 1.65, z);
    const up = kit.arc(top, CLOUD.clone().add(new THREE.Vector3(x * 0.15, -0.4, 0.3)), C.blue, 0.25, 0.18);
    const down = kit.arc(CLOUD.clone().add(new THREE.Vector3(x * 0.15, -0.4, 0.3)), top, C.green, 0.25, 0.18);
    const pu = kit.packets(up.curve, "orders", 2);
    const pd = kit.packets(down.curve, "money", 2);
    group.add(up.tube, down.tube, pu.group, pd.group);
    flows.push(pu, pd);
  });

  return {
    group,
    shot: { x: [-3.7, 3.7], z: [-2.8, 4.0], top: 4.3, dir: [0, 0.9, 1], portraitDir: [0, 1.3, 1] },
    update(dt, t) {
      floaters.forEach((f) => (f.obj.position.y = f.base + Math.sin(t * 1.4 + f.phase) * 0.06));
      flows.forEach((f, i) => f.update(t + i * 0.37, 0.3));
      nodes.forEach((n) => {
        if (n.halo?.visible) n.halo.scale.setScalar(1 + Math.sin(t * 4) * 0.05);
      });
    },
    setSelected(id) {
      nodes.forEach((n, key) => {
        n.label.setActive(key === id);
        if (n.halo) n.halo.visible = key === id;
      });
    },
  };
}
