"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, EmptyState, TopBar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import { Emoji } from "@/components/Emoji";

const PAYMENTS = [
  { id: "ecocash", label: "EcoCash", sub: "+263 77 123 4567", emoji: "📱" },
  { id: "card", label: "Card", sub: "Visa ending 4821", emoji: "💳" },
  { id: "cash", label: "Cash on delivery", sub: "Pay the rider", emoji: "💵" },
];

const SLOTS = [
  { id: "now", label: "Express", sub: "25–30 min" },
  { id: "evening", label: "Today, 6–8pm", sub: "Scheduled" },
];

export default function Checkout() {
  const { cart, cartTotal, address, setAddress, placeOrder, productById } =
    useStore();
  const [payment, setPayment] = useState("ecocash");
  const [slot, setSlot] = useState("now");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  if (!cart.length && !busy) {
    return (
      <div>
        <TopBar title="Checkout" back />
        <EmptyState
          icon="cart"
          title="Nothing to check out"
          body="Your cart is empty."
          action={<Button href="/groceries">Start shopping</Button>}
        />
      </div>
    );
  }

  const fee = cartTotal >= 20 ? 0 : 1.5;
  const total = cartTotal + fee;

  function confirm() {
    setBusy(true);
    const order = placeOrder();
    setTimeout(() => router.replace(`/orders/${order.id}?placed=1`), 900);
  }

  return (
    <div>
      <TopBar title="Checkout" back />

      <main className="px-5 py-5 space-y-4 pb-40">
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Icon name="pin" className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Delivery address
              </p>
              {editing ? (
                <input
                  autoFocus
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={() => setEditing(false)}
                  onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-ink-200 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                />
              ) : (
                <p className="text-sm font-medium mt-0.5">{address}</p>
              )}
            </div>
            <button
              onClick={() => setEditing((e) => !e)}
              className="text-xs font-semibold text-brand-600 shrink-0"
            >
              {editing ? "Done" : "Change"}
            </button>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-3">
            Delivery time
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SLOTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSlot(s.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  slot === s.id
                    ? "border-brand-400 bg-brand-50"
                    : "border-ink-200 hover:bg-ink-50"
                }`}
              >
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="text-[11px] text-ink-500">{s.sub}</p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-3">
            Payment method
          </p>
          <div className="space-y-2">
            {PAYMENTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPayment(p.id)}
                className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                  payment === p.id
                    ? "border-brand-400 bg-brand-50"
                    : "border-ink-200 hover:bg-ink-50"
                }`}
              >
                <Emoji char={p.emoji} className="w-6 h-6 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{p.label}</span>
                  <span className="block text-[11px] text-ink-500">{p.sub}</span>
                </span>
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    payment === p.id
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-ink-300"
                  }`}
                >
                  {payment === p.id ? (
                    <Icon name="check" className="w-3 h-3" strokeWidth={3} />
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-3">
            {cart.length} item{cart.length === 1 ? "" : "s"}
          </p>
          <div className="space-y-2">
            {cart.map((l) => {
              const p = productById(l.productId);
              if (!p) return null;
              return (
                <div key={l.productId} className="flex items-center gap-2 text-sm">
                  <Emoji char={p.emoji} className="w-5 h-5 shrink-0" />
                  <span className="flex-1 min-w-0 truncate text-ink-600">
                    {p.name} × {l.qty}
                  </span>
                  <span className="font-medium">{money(p.price * l.qty)}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-ink-100 mt-3 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-ink-500">
              <span>Delivery fee</span>
              <span className={fee === 0 ? "text-emerald-600 font-semibold" : ""}>
                {fee === 0 ? "FREE" : money(fee)}
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span>To pay</span>
              <span>{money(total)}</span>
            </div>
          </div>
        </Card>
      </main>

      <div className="fixed bottom-[68px] inset-x-0 z-40 mx-auto max-w-[520px] px-4">
        <Button
          onClick={confirm}
          disabled={busy}
          variant="primary"
          size="lg"
          full
        >
          {busy ? "Placing order…" : `Place order · ${money(total)}`}
        </Button>
      </div>
    </div>
  );
}
