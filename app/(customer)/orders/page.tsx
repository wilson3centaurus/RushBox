"use client";

import Link from "next/link";
import { Badge, Button, Card, EmptyState, TopBar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { money, statusLabel } from "@/lib/format";
import { TimeAgo } from "@/components/TimeAgo";
import { Emoji } from "@/components/Emoji";
import type { GroceryStatus } from "@/lib/types";

const TONE: Record<GroceryStatus, "brand" | "green" | "grey" | "red" | "blue"> = {
  placed: "blue",
  packing: "brand",
  out_for_delivery: "brand",
  delivered: "green",
  cancelled: "red",
};

export default function Orders() {
  const { orders, addToCart, productById } = useStore();

  return (
    <div>
      <TopBar title="Your orders" subtitle="Groceries & medicine" back="/profile" />

      <main className="px-5 py-5">
        {orders.length ? (
          <div className="space-y-3">
            {orders.map((o) => (
              <Card key={o.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex -space-x-2 shrink-0">
                    {o.lines.slice(0, 3).map((l) => (
                      <span
                        key={l.productId}
                        className="w-10 h-10 rounded-full bg-ink-50 border-2 border-white flex items-center justify-center"
                      >
                        <Emoji char={productById(l.productId)?.emoji ?? ""} className="w-5 h-5" />
                      </span>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{o.id}</p>
                      <Badge tone={TONE[o.status]}>
                        {statusLabel(o.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-ink-500 mt-1">
                      {o.lines.length} items · {money(o.total)} ·{" "}
                      <TimeAgo iso={o.placedAt} />
                    </p>
                    <p className="text-xs text-ink-400 mt-0.5 truncate">
                      {o.address}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-ink-100">
                  <Link
                    href={`/orders/${o.id}`}
                    className="flex-1 text-center text-xs font-semibold text-ink-700 py-2 rounded-lg border border-ink-200 hover:bg-ink-50"
                  >
                    {o.status === "delivered" ? "View details" : "Track order"}
                  </Link>
                  <button
                    onClick={() =>
                      o.lines.forEach((l) => addToCart(l.productId, l.qty))
                    }
                    className="flex-1 text-xs font-semibold text-brand-700 py-2 rounded-lg bg-brand-50 border border-brand-200 hover:bg-brand-100"
                  >
                    Reorder
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="orders"
            title="No orders yet"
            body="Once you place an order it'll show up here with live tracking."
            action={<Button href="/groceries">Start shopping</Button>}
          />
        )}

        <Card className="p-4 mt-5 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-ink-900 text-brand-400 flex items-center justify-center shrink-0">
            <Icon name="truck" className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Looking for your trips?</p>
            <p className="text-xs text-ink-500">
              Cargo, parcels and errands live under Move.
            </p>
          </div>
          <Link
            href="/move"
            className="text-xs font-semibold text-brand-600 shrink-0"
          >
            Open
          </Link>
        </Card>
      </main>
    </div>
  );
}
