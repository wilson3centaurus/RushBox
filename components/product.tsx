"use client";

import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { Icon } from "@/components/icons";
import { ProductImage } from "@/components/Emoji";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import type { Product } from "@/lib/types";

export function QtyStepper({
  qty,
  onChange,
  size = "md",
  full,
}: {
  qty: number;
  onChange: (qty: number) => void;
  size?: "sm" | "md";
  full?: boolean;
}) {
  const dim = size === "sm" ? "h-7 text-xs" : "h-9 text-sm";
  return (
    <div
      className={`items-center rounded-lg bg-brand-400 text-ink-900 font-semibold ${dim} ${
        full ? "flex w-full justify-between" : "inline-flex"
      }`}
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
        <div className="relative">
          <ProductImage product={product} className="h-20" art="w-11 h-11" />
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

      {/* Stacked, not side by side: at three columns on a small phone the price
          and the button do not fit on one line. */}
      <div className="mt-auto pt-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold">{money(product.price)}</span>
          {product.wasPrice ? (
            <span className="text-[10px] text-ink-400 line-through">
              {money(product.wasPrice)}
            </span>
          ) : null}
        </div>
        {outOfStock ? null : line ? (
          <div className="mt-1.5">
            <QtyStepper
              qty={line.qty}
              onChange={(q) => setQty(product.id, q)}
              size="sm"
              full
            />
          </div>
        ) : (
          <button
            onClick={() => addToCart(product.id)}
            aria-label={`Add ${product.name} to cart`}
            className="w-full mt-1.5 h-7 rounded-lg border border-brand-400 text-brand-600 text-xs font-bold hover:bg-brand-50 active:scale-95 transition"
          >
            ADD
          </button>
        )}
      </div>
    </Card>
  );
}

export function ProductGrid({
  products,
  loading,
}: {
  products: Product[];
  loading?: boolean;
}) {
  if (loading && !products.length) return <ProductGridSkeleton />;

  return (
    <div className="grid grid-cols-3 gap-3">
      {products.map((p) => (
        <ProductTile key={p.id} product={p} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-2.5">
          <div className="h-20 rounded-xl bg-ink-100 animate-pulse" />
          <div className="h-3 rounded bg-ink-100 animate-pulse mt-2.5" />
          <div className="h-3 w-2/3 rounded bg-ink-100 animate-pulse mt-1.5" />
          <div className="h-7 rounded-lg bg-ink-100 animate-pulse mt-3" />
        </Card>
      ))}
    </div>
  );
}
