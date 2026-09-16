"use client";

import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { Icon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";

export function QtyStepper({
  qty,
  onChange,
  size = "md",
}: {
  qty: number;
  onChange: (qty: number) => void;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-7 text-xs" : "h-9 text-sm";
  return (
    <div
      className={`inline-flex items-center rounded-lg bg-brand-400 text-ink-900 font-semibold ${dim}`}
    >
      <button
        onClick={() => onChange(qty - 1)}
        aria-label="Decrease quantity"
        className="px-2 h-full flex items-center active:scale-90 transition"
      >
        <Icon name="minus" className="w-3.5 h-3.5" strokeWidth={2.6} />
      </button>
      <span className="w-5 text-center tabular-nums">{qty}</span>
      <button
        onClick={() => onChange(qty + 1)}
        aria-label="Increase quantity"
        className="px-2 h-full flex items-center active:scale-90 transition"
      >
        <Icon name="plus" className="w-3.5 h-3.5" strokeWidth={2.6} />
      </button>
    </div>
  );
}

export function ProductTile({ product }: { product: Product }) {
  const { cart, addToCart, setQty } = useStore();
  const line = cart.find((l) => l.productId === product.id);
  const outOfStock = product.stock === 0;

  return (
    <Card className="p-2.5 flex flex-col">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative h-20 rounded-xl bg-ink-50 flex items-center justify-center text-4xl">
          {product.emoji}
          {product.tags?.includes("deal") ? (
            <Badge tone="red" className="absolute top-1 left-1">
              Deal
            </Badge>
          ) : null}
          {outOfStock ? (
            <div className="absolute inset-0 rounded-xl bg-white/70 flex items-center justify-center">
              <span className="text-[10px] font-bold text-ink-500">
                OUT OF STOCK
              </span>
            </div>
          ) : null}
        </div>
        <p className="text-xs font-semibold mt-2 leading-tight line-clamp-2 min-h-[2rem]">
          {product.name}
        </p>
        <p className="text-[10px] text-ink-400">{product.unit}</p>
      </Link>

      <div className="flex items-center justify-between mt-2 gap-1">
        <div className="min-w-0">
          <span className="text-sm font-bold">{money(product.price)}</span>
          {product.wasPrice ? (
            <span className="block text-[10px] text-ink-400 line-through leading-none">
              {money(product.wasPrice)}
            </span>
          ) : null}
        </div>
        {outOfStock ? null : line ? (
          <QtyStepper
            qty={line.qty}
            onChange={(q) => setQty(product.id, q)}
            size="sm"
          />
        ) : (
          <button
            onClick={() => addToCart(product.id)}
            aria-label={`Add ${product.name} to cart`}
            className="px-2.5 h-7 rounded-lg border border-brand-400 text-brand-600 text-xs font-bold hover:bg-brand-50 active:scale-95 transition"
          >
            ADD
          </button>
        )}
      </div>
    </Card>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {products.map((p) => (
        <ProductTile key={p.id} product={p} />
      ))}
    </div>
  );
}
