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

type PersistedState = {
  user: User | null;
  cart: CartLine[];
  orders: GroceryOrder[];
  jobs: MoveJob[];
  address: string;
};

const initialState: PersistedState = {
  user: null,
  cart: [],
  orders: GROCERY_ORDERS,
  jobs: MOVE_JOBS,
  address: "14 Fife Ave, Harare CBD",
};

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
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...initialState, ...JSON.parse(raw) });
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
    setState((s) => ({
      ...s,
      user: { ...DEMO_USER, phone, role, id: `u-${role}` },
    }));
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

  const placeOrder = useCallback((): GroceryOrder => {
    const order: GroceryOrder = {
      id: `RB-${Math.floor(1000 + Math.random() * 8999)}`,
      lines: [],
      total: 0,
      status: "placed",
      address: "",
      placedAt: new Date().toISOString(),
      etaMins: 22,
    };
    setState((s) => {
      const total =
        s.cart.reduce((sum, line) => {
          const p = productById(line.productId);
          return sum + (p ? p.price * line.qty : 0);
        }, 0) + 1.5;
      order.lines = s.cart;
      order.total = Number(total.toFixed(2));
      order.address = s.address;
      return { ...s, cart: [], orders: [order, ...s.orders] };
    });
    return order;
  }, [productById]);

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
