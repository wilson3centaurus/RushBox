import * as THREE from "three";
import { C, damp, type Label } from "../kit";
import { moneySlices, type Slice } from "../content";
import type { Chapter, ChapterContext } from "./types";

const STACK_HEIGHT = 4.6;
const MIN_SLICE = 0.1;
const LABEL_GAP = 0.42;

export function money({ kit, pricing }: ChapterContext): Chapter {
  const group = new THREE.Group();
  const { grocery, groceryTotal, move, moveTotal } = moneySlices(pricing);

  const stacks: { id: string; root: THREE.Group; grow: THREE.Group; labels: Label[]; header: Label; halo: THREE.Mesh }[] = [];

  function stack(id: string, x: number, slices: Slice[], total: number, title: string, side: 1 | -1) {
    const root = new THREE.Group();
    root.position.x = x;
    kit.pickable(root, id);
    group.add(root);

    const base = kit.cylinder(1.05, 1.15, 0.18, C.mist, 40);
    root.add(base);
    root.add(kit.shadow(1.3));

    // Everything that grows on entry lives in `grow`, scaled from the base.
    const grow = new THREE.Group();
    grow.position.y = 0.18;
    root.add(grow);

    const heights = slices.map((s) => Math.max(MIN_SLICE, (s.amount / total) * STACK_HEIGHT));
    let y = 0;
    let lastLabel = -Infinity;
    const labels: Label[] = [];
    slices.forEach((s, i) => {
      const h = heights[i];
      const slab = kit.box(1.3, h - 0.02, 1.3, Number.parseInt(s.color.slice(1), 16));
      slab.position.y = y + h / 2;
      grow.add(slab);

      // Labels stack beside the column without overlapping, even for thin slices.
      const mid = y + h / 2;
      const ly = Math.max(mid, lastLabel + LABEL_GAP);
      lastLabel = ly;
      const isProfit = s.label === "RushBox profit";
      // Anchored by the edge nearest the column, so labels grow outwards.
      const label = kit.label({
        title: `$${s.amount.toFixed(2)}`,
        titleExtra: ` · ${s.label}`,
        sub: s.who,
        tone: isProfit ? "green" : "plain",
        small: true,
        subOptional: true,
        anchor: side < 0 ? "right" : "left",
      });
      label.position.set(x + side * 0.95, ly + 0.18, 0);
      group.add(label);
      labels.push(label);
      y += h;
    });

    const header = kit.label({
      title: `${title} · $${total.toFixed(2)}`,
      sub: "Customer pays",
      subOptional: true,
      tone: id === "grocery" ? "blue" : "orange",
      pick: id,
    });
    // Above the column and above its highest label, whichever is taller.
    header.position.set(x, Math.max(STACK_HEIGHT, lastLabel) + 1.05, 0);
    group.add(header);

    const coin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.32, 0.08, 32),
      kit.mat(0xfacc15, { emissive: 0x4a3b00, rough: 0.35 }),
    );
    coin.rotation.x = Math.PI / 2;
    coin.position.y = STACK_HEIGHT + 0.45;
    coin.userData.spin = true;
    root.add(coin);

    const halo = kit.halo(1.4);
    halo.visible = false;
    root.add(halo);

    stacks.push({ id, root, grow, labels, header, halo });
  }

  stack("grocery", -1.75, grocery, groceryTotal, "Grocery", -1);
  stack("move", 1.75, move, moveTotal, "Move", 1);

  let growth = 0;

  return {
    group,
    shot: { x: [-4.3, 4.3], z: [-1.2, 1.2], top: 6.6, dir: [0, 0.3, 1], portraitDir: [0, 0.4, 1] },
    enter() {
      growth = 0;
    },
    update(dt, t) {
      growth = damp(growth, 1, 2.2, dt);
      stacks.forEach((s) => {
        s.grow.scale.y = Math.max(0.001, growth);
        s.labels.forEach((l) => (l.visible = growth > 0.85));
        s.root.traverse((o) => {
          if (o.userData.spin) o.rotation.z = t * 1.6;
        });
        if (s.halo.visible) s.halo.scale.setScalar(1 + Math.sin(t * 4) * 0.05);
      });
    },
    setSelected(id) {
      stacks.forEach((s) => {
        s.halo.visible = s.id === id;
        s.header.setActive(s.id === id);
      });
    },
  };
}
