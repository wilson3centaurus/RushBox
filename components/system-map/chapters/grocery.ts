import * as THREE from "three";
import { C, damp, dampVec, type Label } from "../kit";
import { GROCERY_STEPS, RIDER_SCREEN } from "../content";
import type { Chapter, ChapterContext } from "./types";

/**
 * The packing line is a U, like most real ones: in along the back, round the
 * corner, out along the front to the rider. It also fits a phone screen.
 */
const BACK_Z = -1.5;
const FRONT_Z = 1.1;
const TURN_X = 3.6;

const STATIONS = [
  { x: -2.6, z: BACK_Z, step: 1, title: "Order in", role: "Store manager", vest: C.ink },
  { x: 0, z: BACK_Z, step: 2, title: "Pick", role: "Picker", vest: C.blue },
  { x: 2.6, z: BACK_Z, step: 3, title: "Check", role: "Checker", vest: C.green },
  { x: 2.4, z: FRONT_Z, step: 4, title: "Pack & wrap", role: "Packer", vest: C.orange },
  { x: -0.2, z: FRONT_Z, step: 5, title: "Ready", role: "Dispatcher", vest: C.brand },
];

const BELT_Y = 0.46;
const DISPATCH = new THREE.Vector3(-3.0, 0, 2.1);
const WAITING = new THREE.Vector3(-4.3, 0, 0.2);
const HOME = new THREE.Vector3(2.9, 0, 4.4);

const CUSTOMER_SCREEN = [
  ["Order placed", "Paid · EcoCash", "Finding your store"],
  ["Order accepted", "RushBox Msasa", "Packing starts now"],
  ["Packing", "Picking your items", "About 20 min"],
  ["Packing", "Double-checking", "every item"],
  ["Packing", "Sealed & labelled", ""],
  ["Ready", "Rider collecting", ""],
  ["On the way", "Rider 2.4 km away", "Your PIN: 4821"],
  ["Delivered", "Rate your rider", "★ ★ ★ ★ ★"],
];

export function grocery({ kit }: ChapterContext): Chapter {
  const group = new THREE.Group();
  let step = 0;

  // ------------------------------------------------------------- the store
  const floor = kit.box(8.8, 0.05, 6.1, 0xf1f5f9);
  floor.position.set(0.1, 0, -0.45);
  group.add(floor);
  const wall = kit.box(8.8, 1.0, 0.12, C.wall);
  wall.position.set(0.1, 0, -3.5);
  group.add(wall);
  const stripe = kit.box(8.82, 0.16, 0.14, C.brand);
  stripe.position.set(0.1, 0.82, -3.5);
  group.add(stripe);
  const sign = kit.label({ title: "RushBox Msasa", sub: "Dark store · ours", tone: "dark" });
  sign.position.set(-2.6, 1.6, -3.5);
  group.add(sign);

  // The U-shaped belt.
  for (const [w, d, x, z] of [
    [7.0, 0.62, 0.2, BACK_Z],
    [0.62, 3.22, TURN_X, (BACK_Z + FRONT_Z) / 2],
    [6.4, 0.62, 0.6, FRONT_Z],
  ] as const) {
    const body = kit.box(w, 0.4, d, C.slate);
    body.position.set(x, 0, z);
    group.add(body);
    const top = kit.box(w - 0.04, 0.04, d - 0.1, C.ink);
    top.position.set(x, 0.4, z);
    group.add(top);
  }

  // Props at each station.
  const tabletScreen = kit.screen(320, 240, "#2c3e50");
  tabletScreen.draw(["Order RB-4821", "6 items · pick list", "Rider offered"]);
  const tab = kit.device("tablet", tabletScreen);
  tab.scale.setScalar(0.5);
  tab.position.set(-2.6, 0.42, BACK_Z + 0.42);
  tab.rotation.x = -0.55;
  group.add(tab);

  const shelf = kit.shelf();
  shelf.position.set(0, 0, -3.05);
  group.add(shelf);

  const arch = new THREE.Group();
  for (const z of [-0.45, 0.45]) {
    const post = kit.box(0.08, 1.15, 0.08, C.ink);
    post.position.z = z;
    arch.add(post);
  }
  const bar = kit.box(0.12, 0.1, 1.0, C.ink);
  bar.position.y = 1.1;
  arch.add(bar);
  const beam = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.6),
    new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
  );
  beam.rotation.y = Math.PI / 2;
  beam.position.y = 0.78;
  arch.add(beam);
  arch.position.set(2.6, 0, BACK_Z);
  group.add(arch);

  const packTable = kit.box(1.0, 0.42, 0.6, C.mist);
  packTable.position.set(2.4, 0, 2.05);
  group.add(packTable);
  const paperRoll = kit.cylinder(0.13, 0.13, 0.75, C.kraft, 16);
  paperRoll.rotation.x = Math.PI / 2;
  paperRoll.position.set(2.4, 0.55, 2.05);
  group.add(paperRoll);

  const ready = kit.shelf([C.kraft, C.kraft, C.kraft, C.kraft]);
  ready.position.set(-0.2, 0, 2.15);
  ready.scale.set(0.8, 0.55, 0.9);
  group.add(ready);
  const readyLight = kit.sphere(0.09, C.green, { emissive: 0x0f5d2b });
  readyLight.position.set(0.35, 0.82, 2.15);
  group.add(readyLight);

  // Staff stand behind the back belt and inside the U for the front one.
  const stationLabels: Label[] = [];
  const staff: THREE.Group[] = [];
  STATIONS.forEach((s, i) => {
    const p = kit.person(s.vest);
    const standZ = s.z === BACK_Z ? -2.3 : 0.25;
    p.position.set(s.x, 0, standZ);
    group.add(p);
    staff.push(p);

    const role = kit.label({ title: s.role, tone: "muted", small: true, optional: true });
    role.position.set(s.x, 1.2, standZ);
    group.add(role);

    const tag = kit.label({ title: `${i + 1} · ${s.title}`, tone: "plain", small: true });
    tag.position.set(s.x, 1.0, s.z + (s.z === BACK_Z ? 0.55 : 0.6));
    group.add(tag);
    stationLabels.push(tag);
  });

  // ------------------------------------------------------------- the order

  const path = new THREE.CurvePath<THREE.Vector3>();
  const points = [
    new THREE.Vector3(-3.3, BELT_Y, BACK_Z),
    ...STATIONS.slice(0, 3).map((s) => new THREE.Vector3(s.x, BELT_Y, s.z)),
    new THREE.Vector3(TURN_X, BELT_Y, BACK_Z),
    new THREE.Vector3(TURN_X, BELT_Y, FRONT_Z),
    ...STATIONS.slice(3).map((s) => new THREE.Vector3(s.x, BELT_Y, s.z)),
    new THREE.Vector3(-2.6, BELT_Y, FRONT_Z),
  ];
  for (let i = 0; i < points.length - 1; i++) path.add(new THREE.LineCurve3(points[i], points[i + 1]));
  // Where along the belt each step leaves the order (0 = start, 1 = rider hand-off).
  const lengths = path.getCurveLengths();
  const total = path.getLength();
  const stationU = (i: number) => lengths[i] / total;
  const STEP_U = [0, stationU(0), stationU(1), stationU(2), stationU(5), stationU(6), 1, 1];

  // A blue tote while it's being picked, a sealed kraft parcel after.
  const tote = new THREE.Group();
  tote.add(kit.box(0.5, 0.26, 0.38, C.blue));
  const items: THREE.Mesh[] = [C.red, C.green, C.brand, C.white, C.leaf].map((c, i) => {
    const it = kit.box(0.12, 0.14, 0.12, c);
    it.position.set(-0.16 + (i % 3) * 0.16, 0.24, i < 3 ? -0.08 : 0.08);
    it.visible = false;
    tote.add(it);
    return it;
  });
  const parcel = kit.parcel();
  parcel.visible = false;
  const order = new THREE.Group();
  order.add(tote, parcel);
  group.add(order);
  let u = 0;

  // ------------------------------------------------------------- outside

  const home = kit.house(C.wall, C.blue);
  home.position.copy(HOME);
  home.rotation.y = -0.3;
  group.add(home);
  const customerLabel = kit.label({ title: "Customer", sub: "RushBox app" });
  customerLabel.position.set(HOME.x, 2.0, HOME.z);
  group.add(customerLabel);

  const customerScreen = kit.screen(256, 440, "#f39c12");
  const customerPhone = kit.device("phone", customerScreen);
  customerPhone.scale.setScalar(0.75);
  customerPhone.position.set(HOME.x + 1.25, 0.3, HOME.z - 0.3);
  customerPhone.rotation.y = -0.45;
  group.add(customerPhone);

  const road = new THREE.CatmullRomCurve3([
    DISPATCH.clone(),
    new THREE.Vector3(-2.0, 0, 3.6),
    new THREE.Vector3(HOME.x - 1.2, 0, HOME.z + 0.3),
  ]);
  const roadMesh = new THREE.Mesh(
    new THREE.TubeGeometry(road, 30, 0.3, 4, false),
    new THREE.MeshStandardMaterial({ color: C.road, roughness: 1 }),
  );
  roadMesh.scale.y = 0.05;
  group.add(roadMesh);

  const rider = kit.scooter();
  rider.position.copy(WAITING);
  group.add(rider);
  const riderLabel = kit.label({ title: "Rider", sub: "Online nearby", tone: "plain" });
  group.add(riderLabel);

  const riderScreen = kit.screen(256, 440, "#2c3e50");
  const riderPhone = kit.device("phone", riderScreen);
  riderPhone.scale.setScalar(0.75);
  riderPhone.position.set(-4.4, 0.3, 3.4);
  riderPhone.rotation.y = 0.35;
  group.add(riderPhone);
  const riderPhoneLabel = kit.label({ title: "Rider's phone", tone: "dark", small: true });
  riderPhoneLabel.position.set(-4.4, 1.55, 3.4);
  group.add(riderPhoneLabel);

  // The order travelling from the customer's phone to the store's tablet.
  const orderArc = kit.arc(new THREE.Vector3(HOME.x, 1.3, HOME.z), new THREE.Vector3(-2.6, 1.0, BACK_Z + 0.4), C.blue, 1.4);
  const orderPackets = kit.packets(orderArc.curve, "orders", 4);
  group.add(orderArc.tube, orderPackets.group);

  // ------------------------------------------------------------- animation

  const riderTarget = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  let ride = 0;

  function draw() {
    riderScreen.draw(RIDER_SCREEN[step], step === 1 ? "#16a34a" : "#2c3e50");
    customerScreen.draw(CUSTOMER_SCREEN[step], step === 7 ? "#16a34a" : "#f39c12");
    stationLabels.forEach((l, i) =>
      l.set({ tone: STATIONS[i].step === step ? "brand" : step > STATIONS[i].step ? "green" : "plain" }),
    );
    riderLabel.set({
      sub: ["Online nearby", "Gets the offer", "Heading to store", "Waiting", "Waiting", "Scans QR to collect", "Delivering", "Paid $1.20"][step],
      tone: step === 1 || step >= 6 ? "brand" : "plain",
    });
    customerLabel.set({ tone: step === 0 || step === 7 ? "brand" : "plain" });
    orderArc.tube.visible = orderPackets.group.visible = step <= 1;
    items.forEach((it, i) => (it.visible = step >= 3 || (step === 2 && i < 3)));
    tote.visible = step < 4;
    parcel.visible = step >= 4;
    order.visible = step >= 1 && step <= 5;
  }

  function setStep(i: number) {
    const back = i < step;
    step = Math.max(0, Math.min(GROCERY_STEPS.length - 1, i));
    if (back) {
      // Jump rather than run the belt backwards.
      u = STEP_U[step];
      if (step < 6) ride = 0;
    }
    draw();
  }

  draw();

  return {
    group,
    shot: { x: [-4.8, 4.6], z: [-3.6, 5.0], top: 2.0, dir: [0, 1.35, 1], portraitDir: [0, 1.9, 1] },
    enter() {
      u = 0;
      ride = 0;
      rider.position.copy(WAITING);
      setStep(0);
    },
    setStep,
    update(dt, t) {
      orderPackets.update(t, 0.35);

      // The order rides the belt to whichever station is working on it.
      u = damp(u, STEP_U[step], 2.2, dt);
      path.getPointAt(Math.min(1, Math.max(0, u)), tmp);
      order.position.copy(tmp);

      // Whoever is working moves a little.
      staff.forEach((p, i) => {
        const busy = STATIONS[i].step === step;
        p.position.y = busy ? Math.abs(Math.sin(t * 6)) * 0.06 : 0;
        p.rotation.y = busy ? Math.sin(t * 3) * 0.4 : 0;
      });
      // The picker walks to the shelf and back.
      staff[1].position.z = step === 2 ? -2.3 - (Math.sin(t * 2) * 0.5 + 0.5) * 0.4 : -2.3;

      (beam.material as THREE.MeshBasicMaterial).opacity = step === 3 ? 0.25 + Math.abs(Math.sin(t * 8)) * 0.35 : 0;
      readyLight.visible = step >= 5;

      // Rider: waiting nearby, then at the dispatch door, then out to the customer.
      if (step <= 1) {
        dampVec(rider.position, WAITING, 2.5, dt);
        rider.rotation.y = damp(rider.rotation.y, -Math.PI / 2, 3, dt);
      } else if (step < 6) {
        riderTarget.copy(DISPATCH);
        dampVec(rider.position, riderTarget, 2, dt);
        rider.rotation.y = damp(rider.rotation.y, -1.2, 3, dt);
      } else {
        ride = Math.min(1, ride + dt / 3);
        road.getPointAt(ride, tmp);
        road.getTangentAt(Math.min(ride, 0.999), tangent);
        rider.position.copy(tmp);
        rider.rotation.y = Math.atan2(-tangent.z, tangent.x);
      }
      riderLabel.position.set(rider.position.x, 1.45, rider.position.z);
    },
  };
}
