import * as THREE from "three";
import { C, type Label } from "../kit";
import { PLAYERS, PLAYER_LINKS, type FlowKind, type PlayerId } from "../content";
import type { Chapter, ChapterContext } from "./types";

/** Plan positions (x, z). HQ in the middle, everyone else on the outer ring. */
const POS: Record<PlayerId, [number, number]> = {
  hq: [0, 0],
  team: [-1.9, 1.2],
  customers: [0, 4.9],
  riders: [-2.9, 4.0],
  darkstores: [-4.7, 1.4],
  suppliers: [-3.9, -3.3],
  movers: [4.7, 1.4],
  shops: [3.9, -3.3],
};

/** Height flows leave from, and where each label floats. */
const HEIGHT: Record<PlayerId, { flow: number; label: number }> = {
  hq: { flow: 2.4, label: 3.75 },
  team: { flow: 0.8, label: 1.35 },
  customers: { flow: 1.0, label: 2.05 },
  riders: { flow: 0.8, label: 1.45 },
  darkstores: { flow: 1.0, label: 1.85 },
  suppliers: { flow: 1.0, label: 1.85 },
  movers: { flow: 0.9, label: 1.55 },
  shops: { flow: 0.9, label: 1.7 },
};

const RING = 3.35;

export function players({ kit }: ChapterContext): Chapter {
  const group = new THREE.Group();

  // A ring road with riders and a bakkie always going round it.
  const road = new THREE.Mesh(
    new THREE.RingGeometry(RING - 0.28, RING + 0.28, 96),
    new THREE.MeshStandardMaterial({ color: C.road, roughness: 0.95 }),
  );
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.01;
  group.add(road);
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const dash = kit.box(0.28, 0.01, 0.05, C.white);
    dash.position.set(Math.cos(a) * RING, 0.015, Math.sin(a) * RING);
    dash.rotation.y = -a + Math.PI / 2;
    group.add(dash);
  }

  const nodes = new Map<PlayerId, { root: THREE.Group; label: Label; halo: THREE.Mesh }>();

  function place(id: PlayerId, root: THREE.Group, haloRadius: number) {
    const [x, z] = POS[id];
    root.position.set(x, 0, z);
    kit.pickable(root, id);
    group.add(root);

    const label = kit.label({
      title: PLAYERS[id].label,
      sub: PLAYERS[id].sub,
      tone: id === "hq" ? "brand" : id === "darkstores" ? "dark" : "plain",
      pick: id,
      small: id === "team",
    });
    label.position.set(x, HEIGHT[id].label, z);
    group.add(label);

    const halo = kit.halo(haloRadius);
    halo.position.set(x, 0.02, z);
    halo.visible = false;
    group.add(halo);

    nodes.set(id, { root, label, halo });
  }

  // HQ
  place("hq", kit.tower(), 1.3);

  // The team, gathered beside HQ.
  const team = new THREE.Group();
  [C.blue, C.green, C.orange, C.ink, C.brand].forEach((vest, i) => {
    const p = kit.person(vest);
    const a = Math.PI * (0.1 + i * 0.2);
    p.position.set(Math.cos(a) * 0.55, 0, Math.sin(a) * 0.3 - 0.1);
    p.scale.setScalar(0.85);
    team.add(p);
  });
  place("team", team, 1.0);

  // Customers: two homes and someone ordering on their phone.
  const customers = new THREE.Group();
  const h1 = kit.house(C.wall, C.blue);
  h1.position.set(-0.85, 0, -0.2);
  const h2 = kit.house(C.wall, 0x7c9cbf);
  h2.position.set(0.95, 0, 0.15);
  h2.scale.setScalar(0.85);
  const shopper = kit.person(C.blue);
  shopper.position.set(0.1, 0, 0.75);
  customers.add(h1, h2, shopper);
  place("customers", customers, 1.6);

  // Riders park between the store and the customers.
  const riders = new THREE.Group();
  const parked = kit.scooter();
  parked.rotation.y = 0.6;
  riders.add(parked);
  place("riders", riders, 0.8);

  // Dark store, ours.
  const store = kit.warehouse();
  store.rotation.y = 0.5;
  place("darkstores", store, 1.6);

  // Suppliers: a factory and the delivery truck.
  const suppliers = new THREE.Group();
  const fac = kit.factory();
  suppliers.add(fac);
  const supplyTruck = kit.truck(C.green);
  supplyTruck.position.set(1.3, 0, 0.9);
  supplyTruck.rotation.y = 2.4;
  supplyTruck.scale.setScalar(0.8);
  suppliers.add(supplyTruck);
  suppliers.rotation.y = 0.7;
  place("suppliers", suppliers, 1.6);

  // Move drivers: their own vehicles.
  const movers = new THREE.Group();
  const mb = kit.bakkie();
  mb.rotation.y = -0.5;
  const mt = kit.truck(C.orange);
  mt.position.set(0.5, 0, -1.1);
  mt.rotation.y = -0.5;
  mt.scale.setScalar(0.8);
  movers.add(mb, mt);
  place("movers", movers, 1.5);

  // Any shop, for Buy-For-Me.
  const shops = kit.shop(C.green);
  shops.rotation.y = -0.6;
  place("shops", shops, 1.2);

  // ------------------------------------------------------------- flows

  const pairCount = new Map<string, number>();
  const links = PLAYER_LINKS.map((l) => {
    const key = [l.from, l.to].sort().join("|");
    const n = pairCount.get(key) ?? 0;
    pairCount.set(key, n + 1);
    const [fx, fz] = POS[l.from];
    const [tx, tz] = POS[l.to];
    const from = new THREE.Vector3(fx, HEIGHT[l.from].flow, fz);
    const to = new THREE.Vector3(tx, HEIGHT[l.to].flow, tz);
    // Two flows between the same pair arc apart so both stay visible.
    const sideways = n === 0 ? 0.35 : -0.55;
    const color = l.kind === "orders" ? C.blue : l.kind === "goods" ? C.brand : C.green;
    const { curve, tube, material } = kit.arc(from, to, color, 0.9, sideways);
    const pk = kit.packets(curve, l.kind, 3);
    group.add(tube, pk.group);
    return { ...l, tube, material, packets: pk, phase: Math.random() };
  });

  // Traffic on the ring road.
  const traffic = [
    { obj: kit.scooter(), speed: 0.22, offset: 0, dir: 1 },
    { obj: kit.scooter(), speed: 0.18, offset: 2.4, dir: 1 },
    { obj: kit.bakkie(), speed: 0.12, offset: 4, dir: -1 },
  ];
  traffic.forEach((c) => {
    c.obj.scale.setScalar(0.75);
    group.add(c.obj);
  });

  let filter: Record<FlowKind, boolean> = { orders: true, goods: true, money: true };
  let selected: PlayerId | null = null;

  function applyVisibility() {
    links.forEach((l) => {
      const on = filter[l.kind];
      const related = !selected || l.from === selected || l.to === selected;
      l.tube.visible = on;
      l.material.opacity = related ? 0.45 : 0.06;
      l.packets.group.visible = on && related;
    });
    nodes.forEach((n, id) => {
      n.halo.visible = id === selected;
      n.label.setActive(id === selected);
    });
  }
  applyVisibility();

  return {
    group,
    shot: { x: [-5.1, 5.1], z: [-4.2, 5.6], top: 3.9, dir: [0, 1.2, 1], portraitDir: [0, 1.75, 1] },
    update(dt, t) {
      links.forEach((l) => l.packets.update(t + l.phase * 5, 0.16));
      traffic.forEach((c) => {
        const a = c.offset + c.dir * t * c.speed;
        const r = RING + (c.dir > 0 ? -0.15 : 0.15);
        c.obj.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        // Forward is local +x; face along the direction of travel.
        c.obj.rotation.y = -a - (c.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
      });
      if (selected) {
        const halo = nodes.get(selected)?.halo;
        if (halo) halo.scale.setScalar(1 + Math.sin(t * 4) * 0.06);
      }
    },
    setSelected(id) {
      selected = id && id in POS ? (id as PlayerId) : null;
      applyVisibility();
    },
    setFilter(f) {
      filter = f;
      applyVisibility();
    },
  };
}
