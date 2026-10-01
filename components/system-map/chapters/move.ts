import * as THREE from "three";
import { C, type Label } from "../kit";
import { MOVE_EXAMPLE } from "../content";
import type { Chapter, ChapterContext } from "./types";

const PICKUP = new THREE.Vector3(-3.2, 0, 1.6);
const DROP = new THREE.Vector3(3.4, 0, -2.4);
const STEPS = 8;

type Driver = {
  name: string;
  root: THREE.Group;
  label: Label;
  home: THREE.Vector3;
  /** Index into MOVE_EXAMPLE.offers, or -1 if the vehicle is too small. */
  offer: number;
};

export function move({ kit, pricing }: ChapterContext): Chapter {
  const group = new THREE.Group();
  let step = 0;
  const keep = (MOVE_EXAMPLE.suggested * (100 - pricing.move.commissionPct)) / 100;

  // ------------------------------------------------------------- the road
  const route = new THREE.CatmullRomCurve3([
    PICKUP.clone().add(new THREE.Vector3(0.8, 0, -0.2)),
    new THREE.Vector3(-0.8, 0, 0.5),
    new THREE.Vector3(1.0, 0, -1.2),
    DROP.clone().add(new THREE.Vector3(-1.1, 0, 0.5)),
  ]);
  const roadMesh = new THREE.Mesh(
    new THREE.TubeGeometry(route, 60, 0.4, 4, false),
    new THREE.MeshStandardMaterial({ color: C.road, roughness: 1 }),
  );
  roadMesh.scale.y = 0.05;
  group.add(roadMesh);

  // ------------------------------------------------------------- pickup and drop
  const hardware = kit.shop(C.brand);
  hardware.position.copy(PICKUP).add(new THREE.Vector3(-0.8, 0, -1.0));
  hardware.rotation.y = 0.3;
  group.add(hardware);
  const shopLabel = kit.label({ title: "Electrosales", sub: "Msasa", tone: "muted", small: true, optional: true });
  shopLabel.position.copy(hardware.position).setY(1.45);
  group.add(shopLabel);

  const load = kit.pallets(5);
  load.position.copy(PICKUP);
  group.add(load);

  const customer = kit.person(C.blue);
  customer.position.copy(PICKUP).add(new THREE.Vector3(0.7, 0, 1.1));
  group.add(customer);
  const jobLabel = kit.label({ title: "Cargo · 20 pallets · 400 kg", sub: "Msasa → Subway City · 12 km", tone: "blue", subOptional: true });
  jobLabel.position.copy(customer.position).setY(1.45);
  group.add(jobLabel);

  const priceLabel = kit.label({ title: "", tone: "brand" });
  priceLabel.position.copy(PICKUP).setY(2.3);
  group.add(priceLabel);

  const plaza = kit.warehouse();
  plaza.position.copy(DROP);
  plaza.rotation.y = -0.4;
  group.add(plaza);
  const dropLabel = kit.label({ title: "Subway City", sub: "Drop-off" });
  dropLabel.position.copy(DROP).setY(1.9);
  group.add(dropLabel);

  // ------------------------------------------------------------- drivers
  const offers = MOVE_EXAMPLE.offers;
  const drivers: Driver[] = (
    [
      ["Tendai · Bakkie", kit.bakkie(), [-1.2, -2.3], 0, 0.6],
      ["Grace · Van", kit.van(), [0.9, 2.5], 1, -2.4],
      ["Rodney · Truck", kit.truck(C.blue), [3.0, 0.7], 2, 2.8],
      ["Car", kit.car(), [-1.1, 3.6], -1, -0.4],
      ["Motorbike", kit.scooter(), [-0.2, -0.8], -1, 1.2],
    ] as const
  ).map(([name, root, [x, z], offer, heading]) => {
    root.position.set(x, 0, z);
    root.rotation.y = heading;
    group.add(root);
    const label = kit.label({ title: name, tone: "muted", small: true });
    group.add(label);
    return { name, root, label, home: new THREE.Vector3(x, 0, z), offer };
  });
  const chosen = drivers[0];

  // Broadcast pulses from the pickup point.
  const rings = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(0.92, 1, 64),
      new THREE.MeshBasicMaterial({ color: C.orange, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.copy(PICKUP).setY(0.03);
    group.add(m);
    return m;
  });

  // ------------------------------------------------------------- state
  // 0 → 1 while the chosen bakkie drives to the pickup, then along the road.
  let toPickup = 0;
  let toDrop = 0;
  const approach = new THREE.CatmullRomCurve3([
    chosen.home.clone(),
    new THREE.Vector3(-2.4, 0, -0.9),
    PICKUP.clone().add(new THREE.Vector3(0.8, 0, -0.2)),
  ]);
  const tmp = new THREE.Vector3();
  const tangent = new THREE.Vector3();

  /** Pallets back on the ground at the pickup. */
  function unload() {
    group.attach(load);
    load.position.copy(PICKUP);
    load.rotation.set(0, 0, 0);
    load.scale.setScalar(1);
  }

  function draw() {
    priceLabel.visible = step >= 1 && step <= 5;
    priceLabel.set(
      step === 1
        ? { title: `Suggested $${MOVE_EXAMPLE.suggested}`, sub: "bakkie · 12 km · 400 kg" }
        : { title: `Offer $${MOVE_EXAMPLE.suggested}`, sub: `Allowed $${Math.round(MOVE_EXAMPLE.suggested * 0.8)}–$${Math.round(MOVE_EXAMPLE.suggested * 1.5)}` },
    );
    jobLabel.set({ tone: step === 0 ? "blue" : "plain" });

    drivers.forEach((d) => {
      const o = d.offer >= 0 ? offers[d.offer] : null;
      if (step < 3) d.label.set({ title: d.name, sub: "", tone: "muted" });
      else if (step === 3) d.label.set(o ? { title: d.name, sub: "Sees the job", tone: "plain" } : { title: d.name, sub: "Too small for 400 kg", tone: "muted" });
      else if (step === 4) d.label.set(o ? { title: `${o.kind === "accepts" ? "Accepts" : "Counters"} $${o.price}`, sub: `${o.name} · ${o.eta} min · ★${o.rating}`, tone: o.kind === "accepts" ? "green" : "orange" } : { title: d.name, sub: "", tone: "muted" });
      else if (d === chosen) d.label.set({ title: step >= 7 ? "Delivered · PIN ✓" : step === 6 ? "Collecting the load" : `Chosen · $${offers[0].price}`, sub: step >= 7 ? `Driver keeps $${keep.toFixed(2)}` : `${offers[0].name} · ★${offers[0].rating}`, tone: "green" });
      else d.label.set(o ? { title: `$${o.price} declined`, sub: "Automatically", tone: "muted" } : { title: d.name, sub: "", tone: "muted" });
    });

    dropLabel.set({ tone: step >= 7 ? "green" : "plain", sub: step >= 7 ? "Paid · rated both ways" : "Drop-off" });
  }

  function setStep(i: number) {
    const back = i < step;
    step = Math.max(0, Math.min(STEPS - 1, i));
    if (back) {
      // Snap rather than reverse the bakkie across town.
      if (step < 7) toDrop = 0;
      if (step < 6) toPickup = 0;
      if (step < 6) {
        chosen.root.position.copy(chosen.home);
        unload();
      }
    }
    draw();
  }

  draw();

  return {
    group,
    shot: { x: [-5.0, 4.9], z: [-3.6, 4.4], top: 2.0, dir: [0, 1.25, 1], portraitDir: [0, 2.0, 1] },
    enter() {
      toPickup = toDrop = 0;
      chosen.root.position.copy(chosen.home);
      chosen.root.rotation.y = 0.6;
      unload();
      setStep(0);
    },
    setStep,
    update(dt, t) {
      // Pulses go out while the job is being broadcast and answered.
      rings.forEach((r, i) => {
        const on = step === 3 || step === 4;
        const u = (t * 0.45 + i / 3) % 1;
        r.scale.setScalar(0.3 + u * 6.5);
        (r.material as THREE.MeshBasicMaterial).opacity = on ? (1 - u) * 0.6 : 0;
      });

      // Drivers who answer bounce gently.
      drivers.forEach((d) => {
        const lift = step === 4 && d.offer >= 0 ? Math.abs(Math.sin(t * 4 + d.offer)) * 0.08 : 0;
        if (d !== chosen || step < 6) d.root.position.y = lift;
        d.label.position.set(d.root.position.x, 1.45, d.root.position.z);
      });

      if (step >= 6) {
        if (toPickup < 1) {
          toPickup = Math.min(1, toPickup + dt / 2.2);
          approach.getPointAt(toPickup, tmp);
          approach.getTangentAt(Math.min(toPickup, 0.999), tangent);
          chosen.root.position.copy(tmp);
          chosen.root.rotation.y = Math.atan2(-tangent.z, tangent.x);
        } else if (load.parent !== chosen.root) {
          // Load the pallets onto the bed.
          chosen.root.attach(load);
          load.position.set(-0.32, 0.5, 0);
          load.rotation.set(0, 0, 0);
          load.scale.setScalar(0.8);
        }
      }
      if (step >= 7 && toPickup >= 1) {
        toDrop = Math.min(1, toDrop + dt / 3.4);
        route.getPointAt(toDrop, tmp);
        route.getTangentAt(Math.min(toDrop, 0.999), tangent);
        chosen.root.position.copy(tmp);
        chosen.root.rotation.y = Math.atan2(-tangent.z, tangent.x);
      }
    },
  };
}
