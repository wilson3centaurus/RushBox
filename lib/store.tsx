"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DEMO_USER,
  GROCERY_ORDERS,
  MOVE_JOBS,
  TRANSPORTERS,
} from "@/lib/mock/data";
import {
  INITIAL_CATALOGUE,
  loadCatalogue,
  type Catalogue,
} from "@/lib/data/catalogue";
import { loadPricing, publishPricing, type PublishResult } from "@/lib/data/settings";
import {
  DEFAULT_PRICING,
  quoteDelivery,
  withDefaults,
  type DeliveryQuote,
  type PricingSettings,
} from "@/lib/pricing";
import {
  emptyVerification,
  type DocKind,
  type Verification,
} from "@/lib/verification";
import { USE_MOCK_DATA } from "@/lib/supabase";
import type {
  Bid,
  CartLine,
  Category,
  GroceryOrder,
  MoveJob,
  Product,
  Role,
  User,
} from "@/lib/types";

const STORAGE_KEY = "rushbox.state.v1";
// Kept apart from the main state: ID photos are large, and the main state is
// rewritten on every tap of the cart.
const VERIFY_KEY = "rushbox.verification.v1";
// Pricing the admin saved on this device but could not publish.
const PRICING_KEY = "rushbox.pricing.v1";

/** Until addresses are geocoded, every address is this far from its store. */
export const DELIVERY_DISTANCE_KM = 2.4;

type ProfilePatch = Partial<Pick<User, "name" | "email" | "avatar" | "phone">>;

type PersistedState = {
  user: User | null;
  /** Profile edits per account, so signing out and back in keeps them. */
  profiles: Record<string, ProfilePatch>;
  cart: CartLine[];
  orders: GroceryOrder[];
  jobs: MoveJob[];
  address: string;
};

const initialState: PersistedState = {
  user: null,
  profiles: {},
  cart: [],
  orders: GROCERY_ORDERS,
  jobs: MOVE_JOBS,
  address: "14 Fife Ave, Harare CBD",
};

/** Two drivers already waiting, so the admin queue is not empty in a demo. */
const SEED_VERIFICATIONS: Record<string, Verification> = Object.fromEntries(
  TRANSPORTERS.filter((t) => t.status === "pending").map((t, i) => [
    t.id,
    {
      userId: t.id,
      name: t.name,
      phone: t.phone,
      role: "transporter" as const,
      status: "pending" as const,
      docs: Object.fromEntries(
        (["id_front", "id_back", "licence", "vehicle_photo", "vehicle_reg"] as DocKind[]).map(
          (k) => [k, { image: "", uploadedAt: t.joinedAt }],
        ),
      ),
      vehicle: { type: t.vehicle, model: t.vehicleLabel, plate: ["AFB 2291", "ADK 7714"][i] ?? "" },
      submittedAt: `${t.joinedAt}T09:00:00.000Z`,
    },
  ]),
);

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

type Store = PersistedState & {
  ready: boolean;
  cartCount: number;
  cartTotal: number;
  /** Catalogue comes from Supabase when configured, otherwise the mock data. */
  categories: Category[];
  products: Product[];
  catalogueLoading: boolean;
  catalogueError: string | null;
  productById: (id: string) => Product | undefined;
  productsByCategory: (slug: string) => Product[];
  categoryBySlug: (slug: string) => Category | undefined;
  signIn: (phone: string, role: Role) => void;
  signOut: () => void;
  updateProfile: (patch: ProfilePatch) => void;
  /** Pricing in force on this device, and where it came from. */
  pricing: PricingSettings;
  pricingSource: "published" | "device" | "default";
  savePricing: (next: PricingSettings) => Promise<PublishResult>;
  discardLocalPricing: () => void;
  deliveryQuote: DeliveryQuote;
  isFirstOrder: boolean;
  /** The signed-in user's verification, and everyone's for the admin queue. */
  verification: Verification | null;
  verifications: Verification[];
  saveDoc: (kind: DocKind, image: string) => void;
  removeDoc: (kind: DocKind) => void;
  setVehicle: (vehicle: NonNullable<Verification["vehicle"]>) => void;
  submitVerification: () => void;
  reviewVerification: (userId: string, decision: "verified" | "rejected", note?: string) => void;
  addToCart: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  setAddress: (address: string) => void;
  placeOrder: () => GroceryOrder;
  postJob: (job: Omit<MoveJob, "id" | "createdAt" | "status" | "bids">) => MoveJob;
  acceptBid: (jobId: string, bidId: string) => void;
  cancelJob: (jobId: string) => void;
};

const StoreContext = createContext<Store | null>(null);

function randomId(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Bids trickle in after a job is posted so the bidding screen behaves like the
 * real thing during demos. Replace with a Supabase realtime subscription.
 */
function simulatedBidsFor(job: MoveJob): Bid[] {
  const pool = TRANSPORTERS.filter(
    (t) => t.status === "verified" && (job.vehicle === t.vehicle || Math.random() > 0.55),
  );
  const chosen = pool.slice(0, 3);
  return chosen.map((t, i) => {
    const swing = [1.12, 0.94, 1.3][i] ?? 1;
    return {
      id: randomId("b"),
      transporterId: t.id,
      name: t.name,
      initials: t.initials,
      rating: t.rating,
      trips: t.trips,
      vehicle: t.vehicle,
      vehicleLabel: t.vehicleLabel,
      price: Math.max(2, Math.round(job.offer * swing)),
      etaMins: 8 + i * 7 + Math.round(Math.random() * 6),
      distanceKm: Number((1.2 + i * 1.8 + Math.random() * 2).toFixed(1)),
    };
  });
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [ready, setReady] = useState(false);
  const [catalogue, setCatalogue] = useState<Catalogue>(INITIAL_CATALOGUE);
  const [catalogueLoading, setCatalogueLoading] = useState(true);
  const [catalogueError, setCatalogueError] = useState<string | null>(null);
  const [remotePricing, setRemotePricing] = useState<PricingSettings>(DEFAULT_PRICING);
  const [localPricing, setLocalPricing] = useState<PricingSettings | null>(null);
  const [verificationMap, setVerificationMap] =
    useState<Record<string, Verification>>(SEED_VERIFICATIONS);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...JSON.parse(raw) });
      const docs = localStorage.getItem(VERIFY_KEY);
      if (docs) setVerificationMap({ ...SEED_VERIFICATIONS, ...JSON.parse(docs) });
      const pricing = localStorage.getItem(PRICING_KEY);
      if (pricing) setLocalPricing(withDefaults(JSON.parse(pricing)));
    } catch {
      // Private mode or blocked storage — carry on with defaults.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Nothing to do if storage is unavailable.
    }
  }, [state, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(VERIFY_KEY, JSON.stringify(verificationMap));
    } catch {
      // Full storage: the photos stay in memory for this session.
    }
  }, [verificationMap, ready]);

  useEffect(() => {
    let cancelled = false;
    loadPricing()
      .then((next) => {
        if (!cancelled) setRemotePricing(next);
      })
      .catch(() => {
        // Keep the defaults; a pricing outage must not stop people ordering.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadCatalogue()
      .then((next) => {
        if (cancelled) return;
        setCatalogue(next);
        setCatalogueError(null);
      })
      .catch((err: unknown) => {
        // Keep the mock catalogue on screen rather than emptying the shop.
        if (cancelled) return;
        setCatalogueError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setCatalogueLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const productById = useCallback(
    (id: string) => catalogue.products.find((p) => p.id === id),
    [catalogue.products],
  );

  const productsByCategory = useCallback(
    (slug: string) => catalogue.products.filter((p) => p.category === slug),
    [catalogue.products],
  );

  const categoryBySlug = useCallback(
    (slug: string) => catalogue.categories.find((c) => c.slug === slug),
    [catalogue.categories],
  );

  const signIn = useCallback((phone: string, role: Role) => {
    setState((s) => {
      const id = `u-${role}`;
      const saved = s.profiles[id] ?? {};
      const name = saved.name ?? DEMO_USER.name;
      return {
        ...s,
        user: { ...DEMO_USER, ...saved, name, phone, role, id, initials: initialsOf(name) },
      };
    });
  }, []);

  const updateProfile = useCallback((patch: ProfilePatch) => {
    setState((s) => {
      if (!s.user) return s;
      const user = { ...s.user, ...patch };
      user.initials = initialsOf(user.name);
      if (!user.avatar) delete user.avatar;
      return {
        ...s,
        user,
        profiles: { ...s.profiles, [user.id]: { ...s.profiles[user.id], ...patch } },
      };
    });
  }, []);

  const signOut = useCallback(() => {
    setState((s) => ({ ...s, user: null, cart: [] }));
  }, []);

  const addToCart = useCallback((productId: string, qty = 1) => {
    setState((s) => {
      const existing = s.cart.find((l) => l.productId === productId);
      const cart = existing
        ? s.cart.map((l) =>
            l.productId === productId ? { ...l, qty: l.qty + qty } : l,
          )
        : [...s.cart, { productId, qty }];
      return { ...s, cart };
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setState((s) => ({
      ...s,
      cart:
        qty <= 0
          ? s.cart.filter((l) => l.productId !== productId)
          : s.cart.map((l) => (l.productId === productId ? { ...l, qty } : l)),
    }));
  }, []);

  const clearCart = useCallback(() => setState((s) => ({ ...s, cart: [] })), []);

  const setAddress = useCallback(
    (address: string) => setState((s) => ({ ...s, address })),
    [],
  );

  const cartTotal = useMemo(
    () =>
      state.cart.reduce((sum, line) => {
        const p = productById(line.productId);
        return sum + (p ? p.price * line.qty : 0);
      }, 0),
    [state.cart, productById],
  );

  const cartCount = useMemo(
    () => state.cart.reduce((n, l) => n + l.qty, 0),
    [state.cart],
  );

  const pricing = localPricing ?? remotePricing;
  const pricingSource = localPricing ? "device" : USE_MOCK_DATA ? "default" : "published";

  const savePricing = useCallback(async (next: PricingSettings) => {
    const result = await publishPricing(next);
    try {
      if (result.published) localStorage.removeItem(PRICING_KEY);
      else localStorage.setItem(PRICING_KEY, JSON.stringify(next));
    } catch {
      // Storage blocked: the change still applies for this session.
    }
    if (result.published) {
      setRemotePricing(next);
      setLocalPricing(null);
    } else {
      setLocalPricing(next);
    }
    return result;
  }, []);

  const discardLocalPricing = useCallback(() => {
    try {
      localStorage.removeItem(PRICING_KEY);
    } catch {
      // Nothing stored, nothing to remove.
    }
    setLocalPricing(null);
  }, []);

  const isFirstOrder = !state.orders.some((o) => o.status !== "cancelled");

  const deliveryQuote = useMemo(
    () =>
      quoteDelivery(cartTotal, pricing.delivery, {
        now: new Date(),
        distanceKm: DELIVERY_DISTANCE_KM,
        isFirstOrder,
      }),
    [cartTotal, pricing.delivery, isFirstOrder],
  );

  const placeOrder = useCallback((): GroceryOrder => {
    const order: GroceryOrder = {
      id: `RB-${Math.floor(1000 + Math.random() * 8999)}`,
      lines: state.cart,
      subtotal: Number(cartTotal.toFixed(2)),
      deliveryFee: deliveryQuote.fee,
      total: Number((cartTotal + deliveryQuote.fee).toFixed(2)),
      status: "placed",
      address: state.address,
      placedAt: new Date().toISOString(),
      etaMins: 22,
    };
    setState((s) => ({ ...s, cart: [], orders: [order, ...s.orders] }));
    return order;
  }, [state.cart, state.address, cartTotal, deliveryQuote.fee]);

  const user = state.user;
  const verification = user
    ? (verificationMap[user.id] ?? emptyVerification(user))
    : null;

  /** Applies a change to the signed-in user's verification, creating it if needed. */
  const editVerification = useCallback(
    (change: (v: Verification) => Verification) => {
      if (!user) return;
      setVerificationMap((m) => {
        const current = m[user.id] ?? emptyVerification(user);
        // Keep the name and number the reviewer sees in step with the profile.
        const next = change({ ...current, name: user.name, phone: user.phone, role: user.role });
        return { ...m, [user.id]: next };
      });
    },
    [user],
  );

  const saveDoc = useCallback(
    (kind: DocKind, image: string) =>
      editVerification((v) => ({
        ...v,
        docs: { ...v.docs, [kind]: { image, uploadedAt: new Date().toISOString() } },
        // A new photo of an approved document has to be checked again.
        ...(v.status === "verified"
          ? { status: "pending" as const, submittedAt: new Date().toISOString() }
          : {}),
      })),
    [editVerification],
  );

  const removeDoc = useCallback(
    (kind: DocKind) =>
      editVerification((v) => {
        const docs = { ...v.docs };
        delete docs[kind];
        return { ...v, docs };
      }),
    [editVerification],
  );

  const setVehicle = useCallback(
    (vehicle: NonNullable<Verification["vehicle"]>) =>
      editVerification((v) => ({
        ...v,
        vehicle,
        // A different vehicle is inspected again, as the database enforces.
        ...(v.status === "verified" &&
        (v.vehicle?.plate !== vehicle.plate || v.vehicle?.type !== vehicle.type)
          ? { status: "pending" as const, submittedAt: new Date().toISOString() }
          : {}),
      })),
    [editVerification],
  );

  const submitVerification = useCallback(
    () =>
      editVerification((v) => ({
        ...v,
        status: "pending",
        note: undefined,
        submittedAt: new Date().toISOString(),
      })),
    [editVerification],
  );

  const reviewVerification = useCallback(
    (userId: string, decision: "verified" | "rejected", note?: string) =>
      setVerificationMap((m) =>
        m[userId]
          ? {
              ...m,
              [userId]: {
                ...m[userId],
                status: decision,
                note: decision === "rejected" ? note : undefined,
                reviewedAt: new Date().toISOString(),
              },
            }
          : m,
      ),
    [],
  );

  const postJob = useCallback(
    (input: Omit<MoveJob, "id" | "createdAt" | "status" | "bids">): MoveJob => {
      const job: MoveJob = {
        ...input,
        id: randomId("j"),
        createdAt: new Date().toISOString(),
        status: "collecting_bids",
        bids: [],
      };
      setState((s) => ({ ...s, jobs: [job, ...s.jobs] }));

      simulatedBidsFor(job).forEach((b, i) => {
        const t = setTimeout(
          () =>
            setState((s) => ({
              ...s,
              jobs: s.jobs.map((j) =>
                j.id === job.id && j.status === "collecting_bids"
                  ? { ...j, bids: [...j.bids, b] }
                  : j,
              ),
            })),
          2200 + i * 2600,
        );
        timers.current.push(t);
      });

      return job;
    },
    [],
  );

  const acceptBid = useCallback((jobId: string, bidId: string) => {
    setState((s) => ({
      ...s,
      jobs: s.jobs.map((j) =>
        j.id === jobId ? { ...j, acceptedBidId: bidId, status: "assigned" } : j,
      ),
    }));
  }, []);

  const cancelJob = useCallback((jobId: string) => {
    setState((s) => ({
      ...s,
      jobs: s.jobs.map((j) =>
        j.id === jobId ? { ...j, status: "cancelled" } : j,
      ),
    }));
  }, []);

  const value: Store = {
    ...state,
    ready,
    cartCount,
    cartTotal,
    categories: catalogue.categories,
    products: catalogue.products,
    catalogueLoading,
    catalogueError,
    productById,
    productsByCategory,
    categoryBySlug,
    signIn,
    signOut,
    updateProfile,
    pricing,
    pricingSource,
    savePricing,
    discardLocalPricing,
    deliveryQuote,
    isFirstOrder,
    verification,
    verifications: Object.values(verificationMap),
    saveDoc,
    removeDoc,
    setVehicle,
    submitVerification,
    reviewVerification,
    addToCart,
    setQty,
    clearCart,
    setAddress,
    placeOrder,
    postJob,
    acceptBid,
    cancelJob,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
