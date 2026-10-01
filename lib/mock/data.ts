import type {
  Bid,
  DarkStore,
  GroceryOrder,
  MoveJob,
  Product,
  Transporter,
  User,
} from "@/lib/types";

export const CURRENCY = "$";

export const AREAS = [
  "Msasa",
  "Avondale",
  "Borrowdale",
  "Mount Pleasant",
  "Eastlea",
  "Belvedere",
  "Waterfalls",
  "Highfield",
  "Mbare",
  "Hatfield",
  "Glen View",
  "Chitungwiza",
  "Ruwa",
  "Norton",
  "Harare CBD",
];

export const SHOPS = [
  "Electrosales Hardware, Msasa",
  "N. Richards Warehouse, Msasa",
  "Halsteds Builders Express, Graniteside",
  "OK Zimbabwe, Avondale",
  "TM Pick n Pay, Borrowdale",
  "Gain Cash & Carry, Harare CBD",
  "Mohamed Mussa, Harare CBD",
];

export const CATEGORIES = [
  { slug: "fruit-veg", name: "Fruit & Veg", emoji: "🥬", color: "bg-green-100", tile: "from-green-50 to-green-100", image: "/photos/categories/fruit-veg.webp" },
  { slug: "dairy-eggs", name: "Dairy & Eggs", emoji: "🥚", color: "bg-yellow-100", tile: "from-amber-50 to-yellow-100", image: "/photos/categories/dairy-eggs.webp" },
  { slug: "bakery", name: "Bakery", emoji: "🍞", color: "bg-amber-100", tile: "from-orange-50 to-amber-100", image: "/photos/categories/bakery.webp" },
  { slug: "meat-fish", name: "Meat & Fish", emoji: "🍗", color: "bg-red-100", tile: "from-rose-50 to-red-100", image: "/photos/categories/meat-fish.webp" },
  { slug: "drinks", name: "Drinks", emoji: "🥤", color: "bg-sky-100", tile: "from-sky-50 to-blue-100", image: "/photos/categories/drinks.webp" },
  { slug: "snacks", name: "Snacks", emoji: "🍪", color: "bg-orange-100", tile: "from-orange-50 to-orange-100", image: "/photos/categories/snacks.webp" },
  { slug: "pantry", name: "Pantry", emoji: "🍚", color: "bg-stone-100", tile: "from-stone-50 to-stone-100", image: "/photos/categories/pantry.webp" },
  { slug: "household", name: "Household", emoji: "🧼", color: "bg-indigo-100", tile: "from-indigo-50 to-indigo-100", image: "/photos/categories/household.webp" },
  { slug: "baby", name: "Baby", emoji: "🍼", color: "bg-pink-100", tile: "from-pink-50 to-pink-100", image: "/photos/categories/baby.webp" },
  { slug: "pharmacy", name: "Pharmacy", emoji: "💊", color: "bg-emerald-100", tile: "from-emerald-50 to-emerald-100", image: "/photos/categories/pharmacy.webp" },
];

export const PRODUCTS: Product[] = [
  { id: "p1", name: "Tomatoes", category: "fruit-veg", price: 1.2, unit: "per kg", emoji: "🍅", stock: 48, store: "ds-msasa", tags: ["bestseller"], image: "/photos/products/tomatoes.webp" },
  { id: "p2", name: "Bananas", category: "fruit-veg", price: 1.5, unit: "per kg", emoji: "🍌", stock: 32, store: "ds-msasa", image: "/photos/products/bananas.webp" },
  { id: "p3", name: "Onions", category: "fruit-veg", price: 0.9, unit: "per kg", emoji: "🧅", stock: 60, store: "ds-msasa", image: "/photos/products/onions.webp" },
  { id: "p4", name: "Rape / Covo Bundle", category: "fruit-veg", price: 0.5, unit: "bundle", emoji: "🥬", stock: 25, store: "ds-msasa", tags: ["deal"], wasPrice: 0.8, image: "/photos/products/covo.webp" },
  { id: "p5", name: "Potatoes", category: "fruit-veg", price: 2.4, unit: "2kg bag", emoji: "🥔", stock: 40, store: "ds-avondale", image: "/photos/products/potatoes.webp" },
  { id: "p6", name: "Apples", category: "fruit-veg", price: 2.8, unit: "per kg", emoji: "🍎", stock: 18, store: "ds-avondale", image: "/photos/products/apples.webp" },

  { id: "p7", name: "Dairibord Fresh Milk", category: "dairy-eggs", price: 1.4, unit: "500ml", emoji: "🥛", stock: 55, store: "ds-msasa", tags: ["bestseller"] },
  { id: "p8", name: "Eggs", category: "dairy-eggs", price: 3.2, unit: "tray of 30", emoji: "🥚", stock: 22, store: "ds-msasa", image: "/photos/products/eggs.webp" },
  { id: "p9", name: "Cheddar Cheese", category: "dairy-eggs", price: 4.5, unit: "250g", emoji: "🧀", stock: 12, store: "ds-avondale", image: "/photos/products/cheese.webp" },
  { id: "p10", name: "Lacto Sour Milk", category: "dairy-eggs", price: 1.1, unit: "500ml", emoji: "🥛", stock: 38, store: "ds-msasa" },

  { id: "p11", name: "White Bread", category: "bakery", price: 1.0, unit: "loaf", emoji: "🍞", stock: 44, store: "ds-msasa", tags: ["bestseller"], image: "/photos/products/white-bread.webp" },
  { id: "p12", name: "Brown Bread", category: "bakery", price: 1.1, unit: "loaf", emoji: "🥖", stock: 30, store: "ds-msasa", image: "/photos/products/brown-bread.webp" },
  { id: "p13", name: "Buns", category: "bakery", price: 1.8, unit: "pack of 6", emoji: "🥐", stock: 16, store: "ds-avondale", image: "/photos/products/buns.webp" },

  { id: "p14", name: "Chicken Pieces", category: "meat-fish", price: 4.2, unit: "1kg", emoji: "🍗", stock: 20, store: "ds-msasa", tags: ["bestseller"] },
  { id: "p15", name: "Beef Mince", category: "meat-fish", price: 5.5, unit: "1kg", emoji: "🥩", stock: 14, store: "ds-msasa" },
  { id: "p16", name: "Kapenta", category: "meat-fish", price: 3.0, unit: "500g", emoji: "🐟", stock: 26, store: "ds-mbare", image: "/photos/products/kapenta.webp" },
  { id: "p17", name: "Boerewors", category: "meat-fish", price: 6.0, unit: "1kg", emoji: "🌭", stock: 9, store: "ds-avondale", image: "/photos/products/boerewors.webp" },

  { id: "p18", name: "Mazoe Orange Crush", category: "drinks", price: 3.5, unit: "2L", emoji: "🧃", stock: 50, store: "ds-msasa", tags: ["bestseller"] },
  { id: "p19", name: "Coca-Cola", category: "drinks", price: 1.2, unit: "500ml", emoji: "🥤", stock: 72, store: "ds-msasa" },
  { id: "p20", name: "Still Water", category: "drinks", price: 0.7, unit: "1.5L", emoji: "💧", stock: 90, store: "ds-msasa", image: "/photos/products/water.webp" },
  { id: "p21", name: "Cascade Juice", category: "drinks", price: 2.2, unit: "1L", emoji: "🧃", stock: 28, store: "ds-avondale", tags: ["deal"], wasPrice: 2.8 },

  { id: "p22", name: "Lobels Biscuits", category: "snacks", price: 1.6, unit: "200g", emoji: "🍪", stock: 34, store: "ds-msasa" },
  { id: "p23", name: "Willards Chips", category: "snacks", price: 1.0, unit: "125g", emoji: "🥔", stock: 46, store: "ds-msasa" },
  { id: "p24", name: "Peanut Butter", category: "snacks", price: 2.5, unit: "375g", emoji: "🥜", stock: 21, store: "ds-avondale" },
  { id: "p25", name: "Charhons Sweets", category: "snacks", price: 0.8, unit: "pack", emoji: "🍬", stock: 60, store: "ds-mbare" },

  { id: "p26", name: "Mealie Meal (Roller)", category: "pantry", price: 6.5, unit: "10kg", emoji: "🌽", stock: 35, store: "ds-msasa", tags: ["bestseller"], image: "/photos/products/mealie-meal.webp" },
  { id: "p27", name: "White Rice", category: "pantry", price: 3.8, unit: "2kg", emoji: "🍚", stock: 29, store: "ds-msasa", image: "/photos/products/rice.webp" },
  { id: "p28", name: "Cooking Oil", category: "pantry", price: 4.0, unit: "2L", emoji: "🛢️", stock: 24, store: "ds-msasa" },
  { id: "p29", name: "Sugar", category: "pantry", price: 1.9, unit: "2kg", emoji: "🍬", stock: 41, store: "ds-avondale", image: "/photos/products/sugar.webp" },
  { id: "p30", name: "Salt", category: "pantry", price: 0.6, unit: "1kg", emoji: "🧂", stock: 55, store: "ds-msasa", image: "/photos/products/salt.webp" },
  { id: "p31", name: "Tanganda Tea", category: "pantry", price: 2.1, unit: "100 bags", emoji: "🍵", stock: 33, store: "ds-msasa" },

  { id: "p32", name: "Sunlight Washing Powder", category: "household", price: 3.4, unit: "1kg", emoji: "🧺", stock: 27, store: "ds-msasa" },
  { id: "p33", name: "Geisha Soap", category: "household", price: 0.9, unit: "bar", emoji: "🧼", stock: 64, store: "ds-msasa" },
  { id: "p34", name: "Toilet Paper", category: "household", price: 3.2, unit: "9 rolls", emoji: "🧻", stock: 31, store: "ds-avondale", image: "/photos/products/toilet-paper.webp" },
  { id: "p35", name: "Dishwashing Liquid", category: "household", price: 1.8, unit: "750ml", emoji: "🧴", stock: 19, store: "ds-msasa" },

  { id: "p36", name: "Nappies (Size 3)", category: "baby", price: 8.5, unit: "pack of 40", emoji: "🧷", stock: 11, store: "ds-avondale" },
  { id: "p37", name: "Baby Formula", category: "baby", price: 12.0, unit: "400g", emoji: "🍼", stock: 7, store: "ds-avondale" },
  { id: "p38", name: "Baby Wipes", category: "baby", price: 2.4, unit: "80 wipes", emoji: "🧻", stock: 23, store: "ds-msasa" },

  { id: "p39", name: "Paracetamol", category: "pharmacy", price: 1.5, unit: "20 tablets", emoji: "💊", stock: 48, store: "ds-msasa", tags: ["bestseller"] },
  { id: "p40", name: "Ibuprofen", category: "pharmacy", price: 2.2, unit: "24 tablets", emoji: "💊", stock: 30, store: "ds-msasa" },
  { id: "p41", name: "Cough Syrup", category: "pharmacy", price: 4.0, unit: "100ml", emoji: "🧪", stock: 15, store: "ds-avondale" },
  { id: "p42", name: "Plasters", category: "pharmacy", price: 1.2, unit: "pack of 20", emoji: "🩹", stock: 40, store: "ds-msasa", image: "/photos/products/plasters.webp" },
  { id: "p43", name: "Antiseptic Liquid", category: "pharmacy", price: 3.6, unit: "250ml", emoji: "🧴", stock: 8, store: "ds-msasa" },
];

export const VEHICLES: {
  id: "bike" | "car" | "van" | "bakkie" | "truck";
  label: string;
  emoji: string;
  capacity: string;
}[] = [
  { id: "bike", label: "Motorbike", emoji: "🏍️", capacity: "Envelopes, small parcels up to 10kg" },
  { id: "car", label: "Car", emoji: "🚗", capacity: "Boxes, shopping bags up to 80kg" },
  { id: "van", label: "Van", emoji: "🚐", capacity: "Furniture, appliances up to 800kg" },
  { id: "bakkie", label: "Bakkie / Pickup", emoji: "🛻", capacity: "Building material, pallets up to 1 tonne" },
  { id: "truck", label: "Truck", emoji: "🚚", capacity: "Bulk loads, moving house, 1–7 tonnes" },
];

export const DEMO_USER: User = {
  id: "u1",
  name: "Wilson Sedze",
  phone: "+263 77 123 4567",
  role: "customer",
  initials: "WS",
};

export const DARK_STORES: DarkStore[] = [
  { id: "ds-msasa", name: "RushBox Msasa", area: "Msasa", ordersToday: 148, skus: 412, lowStock: 9 },
  { id: "ds-avondale", name: "RushBox Avondale", area: "Avondale", ordersToday: 96, skus: 388, lowStock: 14 },
  { id: "ds-mbare", name: "RushBox Mbare", area: "Mbare", ordersToday: 71, skus: 260, lowStock: 6 },
];

export const TRANSPORTERS: Transporter[] = [
  { id: "t1", name: "Tendai Moyo", initials: "TM", phone: "+263 77 234 5566", vehicle: "bakkie", vehicleLabel: "Toyota Hilux", rating: 4.8, trips: 212, status: "verified", joinedAt: "2026-02-11", earnings: 1840 },
  { id: "t2", name: "Rodney Chikuni", initials: "RC", phone: "+263 71 445 8890", vehicle: "truck", vehicleLabel: "Isuzu 3t Truck", rating: 4.6, trips: 87, status: "verified", joinedAt: "2026-04-02", earnings: 1120 },
  { id: "t3", name: "Grace Mutasa", initials: "GM", phone: "+263 78 991 2020", vehicle: "van", vehicleLabel: "Nissan Caravan", rating: 4.9, trips: 340, status: "verified", joinedAt: "2025-11-20", earnings: 2960 },
  { id: "t4", name: "Thamu Ncube", initials: "TN", phone: "+263 73 556 7788", vehicle: "bike", vehicleLabel: "Honda 125", rating: 4.7, trips: 501, status: "verified", joinedAt: "2025-09-05", earnings: 2210 },
  { id: "t5", name: "Blessing Dube", initials: "BD", phone: "+263 77 880 1122", vehicle: "car", vehicleLabel: "Toyota Wish", rating: 4.4, trips: 45, status: "pending", joinedAt: "2026-09-02", earnings: 0 },
  { id: "t6", name: "Simba Nyoni", initials: "SN", phone: "+263 71 220 3344", vehicle: "bakkie", vehicleLabel: "Mazda BT-50", rating: 4.2, trips: 28, status: "pending", joinedAt: "2026-09-10", earnings: 0 },
];

const bid = (
  id: string,
  t: Transporter,
  price: number,
  etaMins: number,
  distanceKm: number,
): Bid => ({
  id,
  transporterId: t.id,
  name: t.name,
  initials: t.initials,
  rating: t.rating,
  trips: t.trips,
  vehicle: t.vehicle,
  vehicleLabel: t.vehicleLabel,
  price,
  etaMins,
  distanceKm,
});

export const MOVE_JOBS: MoveJob[] = [
  {
    id: "j1",
    type: "cargo",
    pickup: "Electrosales Hardware, Msasa",
    dropoff: "Subway City, Harare",
    description: "6 wood pallets and a box of hardware fittings. Need help loading.",
    vehicle: "bakkie",
    offer: 18,
    status: "collecting_bids",
    createdAt: new Date(Date.now() - 4 * 60_000).toISOString(),
    bids: [
      bid("b1", TRANSPORTERS[0], 20, 14, 3.2),
      bid("b2", TRANSPORTERS[5], 17, 22, 5.8),
      bid("b3", TRANSPORTERS[1], 25, 11, 2.4),
    ],
  },
  {
    id: "j2",
    type: "parcel",
    pickup: "Avondale Shops",
    dropoff: "Borrowdale Village",
    description: "A4 envelope with documents. Hand to reception.",
    vehicle: "bike",
    offer: 4,
    status: "in_transit",
    createdAt: new Date(Date.now() - 46 * 60_000).toISOString(),
    bids: [bid("b4", TRANSPORTERS[3], 5, 18, 1.1)],
    acceptedBidId: "b4",
  },
  {
    id: "j3",
    type: "errand",
    pickup: "N. Richards Warehouse, Msasa",
    dropoff: "14 Fife Ave, Harare CBD",
    description: "Buy the items on the list, keep the receipt.",
    vehicle: "car",
    offer: 8,
    shop: "N. Richards Warehouse, Msasa",
    shoppingBudget: 60,
    items: [
      { name: "Cement (32.5N)", qty: 2, note: "50kg bags" },
      { name: "Wheelbarrow", qty: 1 },
      { name: "Builders line", qty: 3 },
    ],
    status: "delivered",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60_000).toISOString(),
    bids: [bid("b5", TRANSPORTERS[2], 9, 40, 6.5)],
    acceptedBidId: "b5",
  },
  {
    id: "j4",
    type: "cargo",
    pickup: "Glen View Furniture Complex",
    dropoff: "Ruwa",
    description: "Room divider and a 3-piece lounge suite.",
    vehicle: "truck",
    offer: 35,
    status: "delivered",
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60_000).toISOString(),
    bids: [bid("b6", TRANSPORTERS[1], 38, 55, 12.4)],
    acceptedBidId: "b6",
  },
];

export const GROCERY_ORDERS: GroceryOrder[] = [
  {
    id: "RB-4821",
    lines: [
      { productId: "p7", qty: 2 },
      { productId: "p11", qty: 1 },
      { productId: "p8", qty: 1 },
      { productId: "p18", qty: 1 },
    ],
    total: 10.4,
    status: "out_for_delivery",
    address: "14 Fife Ave, Harare CBD",
    placedAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    etaMins: 9,
    rider: { name: "Thamu Ncube", phone: "+263 73 556 7788", vehicle: "Honda 125" },
  },
  {
    id: "RB-4790",
    lines: [
      { productId: "p26", qty: 1 },
      { productId: "p28", qty: 1 },
      { productId: "p29", qty: 2 },
    ],
    total: 14.3,
    status: "delivered",
    address: "14 Fife Ave, Harare CBD",
    placedAt: new Date(Date.now() - 2 * 24 * 60 * 60_000).toISOString(),
    etaMins: 0,
  },
  {
    id: "RB-4755",
    lines: [
      { productId: "p39", qty: 1 },
      { productId: "p41", qty: 1 },
      { productId: "p20", qty: 2 },
    ],
    total: 6.9,
    status: "delivered",
    address: "8 Samora Machel Ave, Harare",
    placedAt: new Date(Date.now() - 6 * 24 * 60 * 60_000).toISOString(),
    etaMins: 0,
  },
];

/** Jobs shown in the transporter's nearby feed. */
export const OPEN_JOB_FEED: MoveJob[] = [
  MOVE_JOBS[0],
  {
    id: "j5",
    type: "parcel",
    pickup: "Eastlea",
    dropoff: "Mount Pleasant",
    description: "Laptop bag, handle with care.",
    vehicle: "car",
    offer: 6,
    status: "collecting_bids",
    createdAt: new Date(Date.now() - 2 * 60_000).toISOString(),
    bids: [],
  },
  {
    id: "j6",
    type: "errand",
    pickup: "OK Zimbabwe, Avondale",
    dropoff: "Belvedere",
    description: "Month-end groceries, list attached. Budget $45.",
    vehicle: "car",
    offer: 7,
    shop: "OK Zimbabwe, Avondale",
    shoppingBudget: 45,
    items: [
      { name: "Mealie meal 10kg", qty: 1 },
      { name: "Cooking oil 2L", qty: 2 },
      { name: "Washing powder", qty: 1 },
    ],
    status: "collecting_bids",
    createdAt: new Date(Date.now() - 9 * 60_000).toISOString(),
    bids: [],
  },
  {
    id: "j7",
    type: "cargo",
    pickup: "Halsteds Builders Express, Graniteside",
    dropoff: "Chitungwiza",
    description: "20 bags of cement, need a 1 tonne bakkie minimum.",
    vehicle: "bakkie",
    offer: 28,
    status: "collecting_bids",
    createdAt: new Date(Date.now() - 16 * 60_000).toISOString(),
    bids: [],
  },
];

export function productById(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export function productsByCategory(slug: string) {
  return PRODUCTS.filter((p) => p.category === slug);
}

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function vehicleById(id: string) {
  return VEHICLES.find((v) => v.id === id);
}
