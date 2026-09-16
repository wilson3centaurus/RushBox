export type Role = "customer" | "transporter" | "ops" | "admin";

export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  initials: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  emoji: string;
  stock: number;
  store: string;
  tags?: ("bestseller" | "new" | "deal")[];
  wasPrice?: number;
};

export type CartLine = { productId: string; qty: number };

export type GroceryStatus =
  | "placed"
  | "packing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type GroceryOrder = {
  id: string;
  lines: CartLine[];
  total: number;
  status: GroceryStatus;
  address: string;
  placedAt: string;
  etaMins: number;
  rider?: { name: string; phone: string; vehicle: string };
};

export type JobType = "cargo" | "parcel" | "errand";

export type JobStatus =
  | "collecting_bids"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type VehicleType = "bike" | "car" | "van" | "bakkie" | "truck";

export type ErrandItem = { name: string; qty: number; note?: string };

export type MoveJob = {
  id: string;
  type: JobType;
  pickup: string;
  dropoff: string;
  description: string;
  vehicle: VehicleType;
  /** What the customer offers to pay for the transport itself. */
  offer: number;
  status: JobStatus;
  createdAt: string;
  bids: Bid[];
  acceptedBidId?: string;
  /** Buy-For-Me only. */
  shop?: string;
  items?: ErrandItem[];
  shoppingBudget?: number;
};

export type Bid = {
  id: string;
  transporterId: string;
  name: string;
  initials: string;
  rating: number;
  trips: number;
  vehicle: VehicleType;
  vehicleLabel: string;
  price: number;
  etaMins: number;
  distanceKm: number;
};

export type Transporter = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  vehicle: VehicleType;
  vehicleLabel: string;
  rating: number;
  trips: number;
  status: "pending" | "verified" | "suspended";
  joinedAt: string;
  earnings: number;
};

export type DarkStore = {
  id: string;
  name: string;
  area: string;
  ordersToday: number;
  skus: number;
  lowStock: number;
};
