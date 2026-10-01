import * as THREE from "three";
import { C, damp, dampVec } from "../kit";
import { CASH_STEPS } from "../content";
import type { Chapter, ChapterContext } from "./types";

const STORE = new THREE.Vector3(-3.2, 0, -1.5);
const HOME = new THREE.Vector3(3.1, 0, -0.8);
const DOOR = new THREE.Vector3(2.2, 0, 0.7);
const BACK_AT_STORE = new THREE.Vector3(-2.0, 0, -0.1);

export function cash({ kit }: ChapterContext): Chapter {
  const group = new THREE.Group();
  let step = 0;

  const store = kit.warehouse();
  store.position.copy(STORE);
  store.rotation.y = 0.35;
  group.add(store);
  const storeLabel = kit.label({ title: "Dark store", sub: "RushBox Msasa", tone: "dark" });
  storeLabel.position.copy(STORE).setY(1.9);
  group.add(storeLabel);

  const home = kit.house(C.wall, C.blue);
  home.position.copy(HOME);
  home.rotation.y = -0.45;
  group.add(home);

  const route = new THREE.CatmullRomCurve3([
    DOOR.clone(),
    new THREE.Vector3(0.6, 0, 1.4),
    new THREE.Vector3(-1.1, 0, 0.9),
    BACK_AT_STORE.clone(),
  ]);
  const roadMesh = new THREE.Mesh(
    new THREE.TubeGeometry(route, 40, 0.34, 4, false),
    new THREE.MeshStandardMaterial({ color: C.road, roughness: 1 }),
  );
  roadMesh.scale.y = 0.05;
  group.add(roadMesh);

  const customer = kit.person(C.blue);
  customer.position.set(HOME.x - 0.1, 0, HOME.z + 1.0);
  group.add(customer);
  const customerLabel = kit.label({ title: "Customer", sub: "Chose cash on delivery" });
  customerLabel.position.copy(customer.position).setY(1.4);
  group.add(customerLabel);

  const halo = kit.halo(0.7, C.red);
  halo.position.copy(customer.position).setY(0.02);
  group.add(halo);

  const rider = kit.scooter();
  rider.position.copy(DOOR);
  group.add(rider);
  const riderLabel = kit.label({ title: "Rider", tone: "plain" });
  group.add(riderLabel);

  const bag = kit.parcel();
  bag.scale.setScalar(0.8);
  group.add(bag);

  // The Move rule, shown on its own at the end.
  const moveScene = new THREE.Group();
  const bk = kit.bakkie();
  bk.rotation.y = -0.2;
  const pl = kit.pallets(3);
  pl.position.set(-0.32, 0.5, 0);
  pl.scale.setScalar(0.8);
  bk.add(pl);
  moveScene.add(bk);
  moveScene.position.set(0.1, 0, -2.7);
  group.add(moveScene);
  const moveLabel = kit.label({ title: "Paid by EcoCash · held", sub: "Released to the driver on delivery", tone: "green" });
  moveLabel.position.set(0.1, 1.6, -2.7);
  group.add(moveLabel);

  let back = 0;
  const tmp = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const bagAt = new THREE.Vector3();

  function draw() {
    const r = [
      { title: "Collect $21.50 first", sub: "Shown on the rider's app", tone: "brand" as const },
      { title: "Keeps the bag", sub: "No payment, no handover", tone: "red" as const },
      { title: "Marked refused", sub: "Photo + GPS saved", tone: "dark" as const },
      { title: "Returning to store", sub: "Still paid for the trip", tone: "plain" as const },
      { title: "Back at the store", sub: "Stock checked", tone: "plain" as const },
      { title: "Back at the store", sub: "", tone: "muted" as const },
    ][step];
    riderLabel.set(r);
    customerLabel.set(
      [
        { title: "Customer", sub: "Chose cash on delivery", tone: "plain" as const },
        { title: "✕ Can't pay", sub: "", tone: "red" as const },
        { title: "Support calling…", sub: "Within 2 minutes", tone: "blue" as const },
        { title: "Order cancelled", sub: "", tone: "muted" as const },
        { title: "Cash switched off", sub: "Fee added to next order", tone: "red" as const },
        { title: "Customer", sub: "Can still pay by EcoCash", tone: "muted" as const },
      ][step],
    );
    storeLabel.set({ sub: step >= 3 && step <= 4 ? "Restock or write off" : "RushBox Msasa" });
    halo.visible = step === 1 || step === 4;
    moveScene.visible = moveLabel.visible = step === CASH_STEPS.length - 1;
  }

  function setStep(i: number) {
    const goingBack = i < step;
    step = Math.max(0, Math.min(CASH_STEPS.length - 1, i));
    if (goingBack && step < 3) {
      back = 0;
      rider.position.copy(DOOR);
    }
    draw();
  }

  draw();

  return {
    group,
    shot: { x: [-4.6, 4.4], z: [-3.4, 2.4], top: 2.0, dir: [0, 1.05, 1], portraitDir: [0, 1.7, 1] },
    enter() {
      back = 0;
      rider.position.copy(DOOR);
      setStep(0);
    },
    setStep,
    update(dt, t) {
      if (step >= 3) {
        back = Math.min(1, back + dt / 3);
        route.getPointAt(back, tmp);
        route.getTangentAt(Math.min(back, 0.999), tangent);
        rider.position.copy(tmp);
        rider.rotation.y = Math.atan2(-tangent.z, tangent.x);
      } else {
        rider.rotation.y = damp(rider.rotation.y, Math.PI * 0.85, 3, dt);
      }
      riderLabel.position.set(rider.position.x, 1.5, rider.position.z);

      // The bag stays with the rider until it's back on the store's shelf.
      if (step >= 4 && back >= 1) bagAt.set(STORE.x + 1.3, 0.05, STORE.z + 0.9);
      else bagAt.set(rider.position.x - 0.1, 0.62 + (step === 1 ? Math.abs(Math.sin(t * 5)) * 0.05 : 0), rider.position.z);
      dampVec(bag.position, bagAt, 8, dt);

      if (halo.visible) halo.scale.setScalar(1 + Math.sin(t * 5) * 0.08);
      customer.rotation.y = step === 1 ? Math.sin(t * 6) * 0.35 : 0;
    },
  };
}
