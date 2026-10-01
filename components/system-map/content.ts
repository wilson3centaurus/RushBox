/**
 * Everything the system map says, kept apart from the 3D code so the business
 * team can edit the words without touching a scene.
 */

import type { PricingSettings } from "@/lib/pricing";

export type ChapterId = "players" | "grocery" | "move" | "money" | "apps" | "cash";

export type Detail = {
  title: string;
  tag?: string;
  body: string;
  bullets?: string[];
  /** Which RushBox app this player uses. */
  app?: string;
};

export type Step = Detail & {
  /** Who does it. */
  who: string;
  /** When, measured from the moment the customer pays. */
  time?: string;
};

export const CHAPTERS: { id: ChapterId; label: string; intro: string }[] = [
  {
    id: "players",
    label: "Who's who",
    intro:
      "Everyone involved and how they connect. Tap a building or a label for details; use the buttons to show orders, goods or money moving.",
  },
  {
    id: "grocery",
    label: "Grocery order",
    intro:
      "From tap to doorstep in about 20 minutes: what happens inside a dark store, and what the rider sees on their phone the whole time.",
  },
  {
    id: "move",
    label: "Move job",
    intro:
      "RushBox Move works like inDrive: the system suggests a fair price, the customer sets the offer, nearby drivers accept or counter.",
  },
  {
    id: "money",
    label: "Money",
    intro: "Where every dollar goes on a grocery order and on a Move job, and how riders and drivers earn.",
  },
  {
    id: "apps",
    label: "Apps",
    intro: "Four apps, one backend. Who uses which, and what each one is for.",
  },
  {
    id: "cash",
    label: "Cash on delivery",
    intro: "What happens when a customer won't pay — the rules Blinkit and inDrive use, and the ones RushBox follows.",
  },
];

// ---------------------------------------------------------------- players

export type PlayerId =
  | "hq"
  | "team"
  | "customers"
  | "darkstores"
  | "suppliers"
  | "riders"
  | "movers"
  | "shops";

export const PLAYERS: Record<PlayerId, Detail & { label: string; sub: string }> = {
  hq: {
    label: "RushBox HQ",
    sub: "Robokorda — runs the platform",
    title: "RushBox HQ (Robokorda)",
    tag: "Us",
    body: "Owns the brand, the apps, the dark stores and the stock. Sets prices, checks every driver, pays everyone and handles support.",
    bullets: [
      "Owns: dark stores, stock, apps, customer relationships",
      "Does not own: riders' bikes, drivers' vehicles, suppliers",
      "Earns from grocery margin, delivery fees and Move commission",
    ],
    app: "RushBox Admin (website)",
  },
  team: {
    label: "Our team",
    sub: "HQ staff",
    title: "The HQ team",
    tag: "Employees",
    body: "A small salaried team. Riders and Move drivers are partners, not employees.",
    bullets: [
      "Partner recruiter — signs up riders and drivers, checks ID, licence and vehicle",
      "Customer support — chats and calls, refunds, failed deliveries",
      "Ops monitor — watches live orders and jobs, unsticks anything late",
      "Procurement — buys stock from suppliers, keeps shelves full",
      "Finance — weekly payouts, cash reconciliation, supplier invoices",
      "Marketing — promotions, free-delivery offers, new areas",
    ],
    app: "RushBox Admin (website)",
  },
  customers: {
    label: "Customers",
    sub: "Order groceries or a move",
    title: "Customers",
    body: "Order groceries and medicine for delivery in about 20 minutes, or post a Move job: cargo, a parcel, or Buy-For-Me.",
    bullets: [
      "Pay by EcoCash, card, or cash on delivery",
      "Optional ID check unlocks cash on bigger orders",
      "Rate every rider and driver",
    ],
    app: "RushBox (Android, iPhone, web)",
  },
  darkstores: {
    label: "Dark stores",
    sub: "Ours — closed to walk-ins",
    title: "Dark stores (owned by RushBox)",
    tag: "We own",
    body: "Small warehouses in each area, closed to the public and laid out for speed. Every grocery order is picked, checked and packed here.",
    bullets: [
      "Store manager, pickers, checker, packer, dispatcher",
      "We own the stock, so we decide the price and keep the margin",
      "One store covers about a 7 km radius",
    ],
    app: "RushBox Store (tablet)",
  },
  suppliers: {
    label: "Suppliers",
    sub: "Stock our dark stores",
    title: "Suppliers",
    body: "Wholesalers, farmers, bakeries and pharmaceutical distributors deliver stock to our dark stores against purchase orders from procurement.",
    bullets: [
      "Paid on invoice, typically 7–30 day terms",
      "Fresh produce and bread arrive daily; dry goods weekly",
      "No app needed — purchase orders by email or WhatsApp",
    ],
  },
  riders: {
    label: "Grocery riders",
    sub: "Independent · motorbikes",
    title: "Grocery riders (independent)",
    tag: "Partners",
    body: "Riders on motorbikes and scooters deliver grocery orders. They own their bikes and choose when to work; we do not own the vehicles.",
    bullets: [
      "Fixed pay per drop, plus extra per km and tips — no bidding, speed matters",
      "The order is offered to the nearest online rider while it is still being packed",
      "Paid weekly to EcoCash; a few anchor riders get a guaranteed minimum at peak",
    ],
    app: "RushBox Partner — Rider mode",
  },
  movers: {
    label: "Move drivers",
    sub: "Independent · bid on jobs",
    title: "Move drivers (independent)",
    tag: "Partners",
    body: "Owners of cars, vans, bakkies and trucks. They see Move jobs nearby and accept the customer's price or send a counter-offer, like inDrive.",
    bullets: [
      "Keep the agreed price minus the RushBox commission",
      "Must pass ID, licence and vehicle checks before bidding",
      "Rated after every job; low ratings lose access",
    ],
    app: "RushBox Partner — Move mode",
  },
  shops: {
    label: "Any shop",
    sub: "For Buy-For-Me",
    title: "Shops (Buy-For-Me)",
    body: "Any shop the customer names — Electrosales Hardware in Msasa, a pharmacy, a market stall. Not partners: the runner buys there with the customer's money and brings the receipt.",
    bullets: [
      "Customer prepays the shopping budget plus the service fee",
      "Runner photographs the receipt; change is refunded to the wallet",
    ],
  },
};

export type FlowKind = "orders" | "goods" | "money";

export const FLOWS: Record<FlowKind, { label: string; color: string }> = {
  orders: { label: "Orders & jobs", color: "#2a78d6" },
  goods: { label: "Goods", color: "#f39c12" },
  money: { label: "Money", color: "#16a34a" },
};

export const PLAYER_LINKS: { from: PlayerId; to: PlayerId; kind: FlowKind }[] = [
  { from: "customers", to: "hq", kind: "orders" },
  { from: "hq", to: "darkstores", kind: "orders" },
  { from: "hq", to: "movers", kind: "orders" },
  { from: "suppliers", to: "darkstores", kind: "goods" },
  { from: "darkstores", to: "riders", kind: "goods" },
  { from: "riders", to: "customers", kind: "goods" },
  { from: "shops", to: "movers", kind: "goods" },
  { from: "movers", to: "customers", kind: "goods" },
  { from: "customers", to: "hq", kind: "money" },
  { from: "hq", to: "suppliers", kind: "money" },
  { from: "hq", to: "riders", kind: "money" },
  { from: "movers", to: "hq", kind: "money" },
];

// ---------------------------------------------------------------- grocery

export const GROCERY_STEPS: Step[] = [
  {
    title: "Customer orders",
    who: "Customer · RushBox app",
    time: "0:00",
    body: "Taps Place order and pays by EcoCash or card, or picks cash on delivery.",
    bullets: ["The delivery fee follows the rules set in Admin → Pricing & delivery"],
  },
  {
    title: "Store receives it",
    who: "Store tablet",
    time: "0:00",
    body: "The nearest dark store with everything in stock gets the order on its tablet, with a pick list.",
    bullets: ["At the same moment the order is offered to the nearest online rider, so they arrive as packing finishes"],
  },
  {
    title: "Picker collects the items",
    who: "Picker",
    time: "0:01 – 0:04",
    body: "Walks the shelves in pick-list order and scans each item's barcode into the bag.",
    bullets: ["Out of stock? The customer gets a one-tap substitute or refund"],
  },
  {
    title: "Checker verifies",
    who: "Checker",
    time: "0:04 – 0:05",
    body: "A second person scans every item again against the order. Nothing leaves with a missing or wrong item.",
  },
  {
    title: "Packer wraps it",
    who: "Packer",
    time: "0:05 – 0:06",
    body: "Cold items go in a separate bag. The order is sealed with a tamper sticker and labelled with a QR code.",
  },
  {
    title: "Final check — ready",
    who: "Dispatcher",
    time: "0:06 – 0:08",
    body: "Bag count, cold items and label confirmed; the order goes on the ready shelf.",
    bullets: ["The rider scans the QR code to collect — no scan, no handover"],
  },
  {
    title: "Rider on the way",
    who: "Rider · RushBox Partner",
    time: "0:08 – 0:20",
    body: "The customer watches the rider live on the map.",
  },
  {
    title: "Delivered",
    who: "Rider + customer",
    time: "~0:20",
    body: "The customer reads out a 4-digit PIN; only then is the order complete. Cash is collected here for cash orders.",
    bullets: ["The rider is paid a fixed fee for the drop, settled weekly to EcoCash"],
  },
];

/** What the rider's phone shows at each grocery step. */
export const RIDER_SCREEN: string[][] = [
  ["Online", "Waiting for orders"],
  ["New delivery", "RushBox Msasa → 2.4 km", "Earn $1.20 · Accept"],
  ["Accepted", "Head to RushBox Msasa", "Ready in ~6 min"],
  ["At the store", "Order being checked", ""],
  ["Almost ready", "Order being sealed", ""],
  ["Ready", "Scan the QR to collect", ""],
  ["Delivering", "Avondale · 2.4 km", "ETA 12 min"],
  ["Delivered", "+$1.20 earned", "Next order nearby…"],
];

// ---------------------------------------------------------------- move

/** One worked example, used by the Move and Money chapters. */
export const MOVE_EXAMPLE = {
  load: "20 wood pallets, ~400 kg",
  from: "Electrosales, Msasa",
  to: "Subway City",
  km: 12,
  vehicle: "bakkie",
  suggested: 34,
  formula: [
    ["Bakkie base fare", 10],
    ["12 km × $1.30", 15.6],
    ["Weight over 100 kg", 4.5],
    ["One loading helper", 4],
  ] as [string, number][],
  offers: [
    { name: "Tendai", vehicle: "Bakkie", price: 34, eta: 6, rating: 4.8, kind: "accepts" },
    { name: "Grace", vehicle: "Van", price: 38, eta: 9, rating: 4.9, kind: "counters" },
    { name: "Rodney", vehicle: "Truck", price: 45, eta: 12, rating: 4.6, kind: "counters" },
  ],
};

export function moveSteps(p: PricingSettings): Step[] {
  const keep = 100 - p.move.commissionPct;
  return [
    {
      title: "Post the job",
      who: "Customer",
      body: `Cargo: ${MOVE_EXAMPLE.load}, ${MOVE_EXAMPLE.from} → ${MOVE_EXAMPLE.to}. Photos, size and weight help drivers decide.`,
    },
    {
      title: "System suggests a fair price",
      who: "RushBox",
      body: `From distance, vehicle size, weight and help needed: about $${MOVE_EXAMPLE.suggested}.`,
      bullets: [
        ...MOVE_EXAMPLE.formula.map(([label, amount]) => `${label}: $${amount.toFixed(2)}`),
        "Why not a flat fee? It overcharges short trips and underpays long ones, so drivers ignore those jobs",
      ],
    },
    {
      title: "Customer sets the offer",
      who: "Customer",
      body: "They can go from 20% below to 50% above the suggestion. The app says what most drivers accept.",
      bullets: ["Offers below the cost floor are blocked, so drivers are never asked to work at a loss"],
    },
    {
      title: "Sent to nearby drivers",
      who: "RushBox",
      body: "Only verified drivers nearby with a big enough vehicle see it. Cars and motorbikes don't, for 400 kg of pallets.",
    },
    {
      title: "Drivers accept or counter",
      who: "Move drivers",
      body: "Each driver accepts the price or sends one counter-offer. Offers expire after 60 seconds; the customer sees the best five.",
      bullets: ["No offers in 3 minutes? The app suggests raising the price by 10%"],
    },
    {
      title: "Customer picks one",
      who: "Customer",
      body: "Chooses on price, arrival time and rating. Every other offer is declined automatically.",
    },
    {
      title: "Pickup",
      who: "Driver",
      body: "Driver photographs the load and both confirm the item count before anything moves.",
    },
    {
      title: "Delivered and paid",
      who: "Driver + customer",
      body: `Customer confirms with a PIN and both rate each other. The driver keeps ${keep}%, RushBox keeps ${p.move.commissionPct}%.`,
    },
  ];
}

// ---------------------------------------------------------------- money

export type Slice = { label: string; amount: number; who: string; color: string };

export function moneySlices(p: PricingSettings) {
  const basket = 20;
  const delivery = p.delivery.baseFee;
  const pays = basket + delivery;
  const stock = basket * 0.78;
  const rider = 1.2;
  const packaging = 0.2;
  const fees = pays * 0.015;
  const store = 1.8;
  const grocery: Slice[] = [
    { label: "Stock", amount: stock, who: "Suppliers", color: "#94a3b8" },
    { label: "Rider", amount: rider, who: "Rider (per drop)", color: "#f39c12" },
    { label: "Packaging", amount: packaging, who: "Bags, seals", color: "#cbd5e1" },
    { label: "Payment fees", amount: fees, who: "EcoCash / card", color: "#64748b" },
    { label: "Store & staff", amount: store, who: "Rent, wages", color: "#475569" },
    { label: "RushBox profit", amount: pays - stock - rider - packaging - fees - store, who: "Us", color: "#16a34a" },
  ];

  const job = MOVE_EXAMPLE.suggested;
  const commission = (job * p.move.commissionPct) / 100;
  const moveFees = job * 0.015;
  const support = 0.6;
  const move: Slice[] = [
    { label: "Driver keeps", amount: job - commission, who: "Move driver", color: "#eb6834" },
    { label: "Payment fees", amount: moveFees, who: "EcoCash / card", color: "#64748b" },
    { label: "Support & insurance", amount: support, who: "Ops cost", color: "#475569" },
    { label: "RushBox profit", amount: commission - moveFees - support, who: "Us", color: "#16a34a" },
  ];

  return { grocery, groceryTotal: pays, move, moveTotal: job };
}

export function moneyDetail(p: PricingSettings): Detail {
  return {
    title: "How the money works",
    body: "Groceries make money on the margin between what we pay suppliers and what customers pay. Move makes money on commission.",
    bullets: [
      "Grocery margin: stock bought wholesale, sold at retail — about 20%",
      `Delivery fee ($${p.delivery.baseFee.toFixed(2)}) mostly pays the rider`,
      `Move commission: ${p.move.commissionPct}% of every job`,
      `Buy-For-Me service fee: ${p.move.errandFeePct}% of the shopping budget`,
      "Later: brands paying for promoted spots, and a free-delivery subscription",
    ],
  };
}

export const EARNINGS: Detail = {
  title: "How riders and drivers earn",
  body: "Partners are paid weekly to EcoCash, and can cash out early for a small fee.",
  bullets: [
    "Grocery rider: about $1.20 a drop plus extra per km and tips — 20 drops ≈ $28 a day, before ~$4 fuel",
    `Move driver: keeps the agreed price minus commission — the $${MOVE_EXAMPLE.suggested} pallet job pays them about $30, roughly $25 after fuel`,
    "Cash jobs: the driver keeps the cash and the commission comes off their partner wallet",
    "A wallet below zero must be topped up before taking more cash jobs",
  ],
};

// ---------------------------------------------------------------- apps

export type AppId = "customer" | "partner" | "store" | "admin" | "cloud";

export const APPS: Record<AppId, Detail & { label: string; sub: string }> = {
  customer: {
    label: "RushBox",
    sub: "Customers",
    title: "RushBox — the customer app",
    body: "Groceries, medicine and Move in one app. Android, iPhone and web.",
    bullets: ["Shop, track orders live, post Move jobs and pick offers", "Wallet, addresses, ID verification, support"],
  },
  partner: {
    label: "RushBox Partner",
    sub: "Riders & drivers",
    title: "RushBox Partner — riders and drivers",
    body: "One app with two modes: Rider mode for grocery drops, Move mode for jobs with bidding. A separate app keeps the customer app simple.",
    bullets: ["Go online or offline, accept drops, bid on jobs", "Navigation, QR collect, delivery PIN, earnings and payouts", "ID, licence and vehicle checks before the first job"],
  },
  store: {
    label: "RushBox Store",
    sub: "Dark-store staff",
    title: "RushBox Store — on a tablet in each dark store",
    body: "The fulfilment queue: pick lists, scanning, checking, packing and handing over to riders. Also stock counts and deliveries from suppliers.",
  },
  admin: {
    label: "RushBox Admin",
    sub: "HQ team · website",
    title: "RushBox Admin — a website, not an app",
    body: "Used on laptops at HQ. Pricing and delivery rules, verifications, live orders and jobs, payouts, disputes and reports.",
  },
  cloud: {
    label: "RushBox Cloud",
    sub: "Supabase",
    title: "One backend for all four",
    body: "Every app reads and writes the same database through Supabase, with row-level security deciding who can see what.",
    bullets: ["ID photos sit in a private bucket only verification staff can open", "Today all four are sections of one web app: /, /driver, /ops and /admin"],
  },
};

// ---------------------------------------------------------------- cash

export const CASH_STEPS: Step[] = [
  {
    title: "Rider arrives with a cash order",
    who: "Rider",
    body: "The rider's app says exactly how much to collect before handing over: $21.50.",
  },
  {
    title: "Customer can't or won't pay",
    who: "Rider",
    body: "The bag never leaves the rider's hands before payment. This is the rule Blinkit and other quick-commerce apps use.",
  },
  {
    title: "Marked as refused",
    who: "Rider + support",
    body: "The rider taps Refused; the app records a photo, GPS and time. Support calls the customer within two minutes to try to save it.",
  },
  {
    title: "Back to the store",
    who: "Rider + dark store",
    body: "The order returns to the dark store. Chilled items are checked; anything unsafe is written off. The rider is still paid for the trip.",
  },
  {
    title: "Consequences for the account",
    who: "RushBox",
    body: "Cash on delivery is switched off for that customer, and a failed-delivery fee is added to their next order. Repeat refusals suspend the account.",
    bullets: [
      "New customers get cash only up to a limit; verified customers get a higher one",
      "Blinkit-style apps also cap cash by order value and history",
    ],
  },
  {
    title: "Move jobs: pay before goods move",
    who: "Customer",
    body: "The transport fee is paid by EcoCash when booking and held until delivery, or in cash at pickup. A driver never carries goods on credit; Buy-For-Me budgets are always prepaid.",
    bullets: [
      "inDrive's way: riders pay drivers directly, commission comes off the driver's balance, and non-payers are reported and blocked",
    ],
  },
];
