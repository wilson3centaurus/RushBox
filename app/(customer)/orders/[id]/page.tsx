"use client";

import { Suspense, use } from "react";
import { useSearchParams } from "next/navigation";
import { Avatar, Badge, Button, Card, EmptyState, TopBar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { MapView, Timeline } from "@/components/MapView";
import { useStore } from "@/lib/store";
import { etaLabel, money, statusLabel } from "@/lib/format";
import { ProductImage } from "@/components/Emoji";

const STEPS = [
  { label: "Order placed", sub: "We received your order" },
  { label: "Packing at RushBox Msasa", sub: "Picking your items" },
  { label: "Out for delivery", sub: "Rider is on the way" },
  { label: "Delivered", sub: "Enjoy!" },
];

const STEP_INDEX = {
  placed: 0,
  packing: 1,
  out_for_delivery: 2,
  delivered: 3,
  cancelled: 0,
} as const;

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-ink-50" />}>
      <OrderTracking params={params} />
    </Suspense>
  );
}

function OrderTracking({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const search = useSearchParams();
  const { orders, productById } = useStore();
  const order = orders.find((o) => o.id === id);
  const justPlaced = search.get("placed") === "1";

  if (!order) {
    return (
      <div>
        <TopBar title="Order" back="/orders" />
        <EmptyState
          icon="orders"
          title="Order not found"
          body="We couldn't find that order on this device."
          action={<Button href="/orders">All orders</Button>}
        />
      </div>
    );
  }

  const step = STEP_INDEX[order.status];
  const delivered = order.status === "delivered";

  return (
    <div>
      <TopBar title={order.id} subtitle={statusLabel(order.status)} back="/orders" />

      <main>
        {justPlaced ? (
          <div className="mx-5 mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 animate-fade-up">
            <span className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Icon name="check" className="w-5 h-5" strokeWidth={3} />
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Order confirmed
              </p>
              <p className="text-xs text-emerald-700">
                We&apos;re packing it right now.
              </p>
            </div>
          </div>
        ) : null}

        {!delivered ? (
          <div className="mt-4">
            <MapView
              from="RushBox Msasa"
              to={order.address}
              progress={step === 2 ? 0.7 : 0.15}
            />
          </div>
        ) : null}

        <div className="px-5 py-5 space-y-4">
          {!delivered ? (
            <Card className="p-4 bg-ink-900 text-white border-ink-900">
              <p className="text-xs uppercase tracking-wider text-white/50 font-semibold">
                Arriving in
              </p>
              <p className="text-3xl font-bold mt-1">
                {etaLabel(order.etaMins)}
              </p>
              <p className="text-xs text-white/60 mt-1">
                Delivering to {order.address}
              </p>
            </Card>
          ) : null}

          {order.rider ? (
            <Card className="p-4 flex items-center gap-3">
              <Avatar initials="TN" className="w-11 h-11" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{order.rider.name}</p>
                <p className="text-xs text-ink-500">
                  {order.rider.vehicle} · Your rider
                </p>
              </div>
              <a
                href={`tel:${order.rider.phone.replace(/\s/g, "")}`}
                aria-label="Call rider"
                className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"
              >
                <Icon name="phone" className="w-[18px] h-[18px]" />
              </a>
              <button
                aria-label="Message rider"
                className="w-10 h-10 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center shrink-0"
              >
                <Icon name="chat" className="w-[18px] h-[18px]" />
              </button>
            </Card>
          ) : null}

          <Card className="p-4">
            <h2 className="font-semibold text-sm mb-4">Progress</h2>
            <Timeline steps={STEPS} current={step} />
          </Card>

          <Card className="p-4">
            <h2 className="font-semibold text-sm mb-3">
              {order.lines.length} item{order.lines.length === 1 ? "" : "s"}
            </h2>
            <div className="space-y-2.5">
              {order.lines.map((l) => {
                const p = productById(l.productId);
                if (!p) return null;
                return (
                  <div key={l.productId} className="flex items-center gap-3">
                    <ProductImage product={p} className="w-10 h-10 shrink-0" art="w-6 h-6" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[11px] text-ink-400">
                        {p.unit} × {l.qty}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      {money(p.price * l.qty)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-ink-100 mt-3 pt-3 flex justify-between font-bold">
              <span>Total paid</span>
              <span>{money(order.total)}</span>
            </div>
          </Card>

          {delivered ? (
            <Card className="p-4">
              <h2 className="font-semibold text-sm">How was your delivery?</h2>
              <div className="flex gap-2 mt-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    aria-label={`Rate ${n} stars`}
                    className="flex-1 aspect-square rounded-xl border border-ink-200 flex items-center justify-center text-ink-300 hover:text-brand-400 hover:border-brand-300 transition"
                  >
                    <Icon name="star" className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </Card>
          ) : (
            <Button variant="outline" full href="/support">
              <Icon name="chat" className="w-4 h-4" />
              Need help with this order?
            </Button>
          )}

          <div className="flex items-center justify-center gap-1.5 text-xs text-ink-400 pt-2">
            <Icon name="receipt" className="w-3.5 h-3.5" />
            <Badge tone="grey">Invoice available after delivery</Badge>
          </div>
        </div>
      </main>
    </div>
  );
}
