"use client";

import { Button, Card, EmptyState, TopBar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { QtyStepper } from "@/components/product";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import { ProductImage } from "@/components/Emoji";

const DELIVERY_FEE = 1.5;
const FREE_OVER = 20;

export default function Cart() {
  const { cart, cartTotal, setQty, clearCart, productById } = useStore();

  if (!cart.length) {
    return (
      <div>
        <TopBar title="Your cart" back />
        <EmptyState
          icon="cart"
          title="Your cart is empty"
          body="Add a few things from the shop and they'll show up here."
          action={<Button href="/groceries">Start shopping</Button>}
        />
      </div>
    );
  }

  const fee = cartTotal >= FREE_OVER ? 0 : DELIVERY_FEE;
  const total = cartTotal + fee;

  return (
    <div>
      <TopBar
        title="Your cart"
        subtitle={`${cart.length} item${cart.length === 1 ? "" : "s"}`}
        back
        right={
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-red-500 px-2 py-1"
          >
            Clear
          </button>
        }
      />

      <main className="px-5 py-5 space-y-4 pb-44">
        <Card className="p-4 flex items-center gap-3 bg-brand-50 border-brand-200">
          <Icon name="clock" className="w-5 h-5 text-brand-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Arriving in 25–30 minutes</p>
            <p className="text-xs text-ink-500">From RushBox Msasa</p>
          </div>
        </Card>

        <div className="space-y-2">
          {cart.map((line) => {
            const p = productById(line.productId);
            if (!p) return null;
            return (
              <Card key={line.productId} className="p-3 flex items-center gap-3">
                <ProductImage product={p} className="w-14 h-14 shrink-0" art="w-8 h-8" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">{p.name}</p>
                  <p className="text-xs text-ink-400">{p.unit}</p>
                  <p className="text-sm font-bold mt-1">
                    {money(p.price * line.qty)}
                  </p>
                </div>
                <QtyStepper
                  qty={line.qty}
                  onChange={(q) => setQty(line.productId, q)}
                />
              </Card>
            );
          })}
        </div>

        <Card className="p-4">
          <h2 className="font-semibold text-sm mb-3">Bill summary</h2>
          <Row label="Item total" value={money(cartTotal)} />
          <Row
            label="Delivery fee"
            value={fee === 0 ? "FREE" : money(fee)}
            highlight={fee === 0}
          />
          {fee > 0 ? (
            <p className="text-[11px] text-brand-600 font-medium mt-1">
              Add {money(FREE_OVER - cartTotal)} more for free delivery
            </p>
          ) : null}
          <div className="border-t border-ink-100 mt-3 pt-3 flex justify-between font-bold">
            <span>To pay</span>
            <span>{money(total)}</span>
          </div>
        </Card>
      </main>

      <div className="fixed bottom-[68px] inset-x-0 z-40 mx-auto max-w-[520px] px-4">
        <Button href="/checkout" variant="primary" size="lg" full>
          Checkout · {money(total)}
          <Icon name="chevron" className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-ink-500">{label}</span>
      <span
        className={highlight ? "font-semibold text-emerald-600" : "text-ink-800"}
      >
        {value}
      </span>
    </div>
  );
}
