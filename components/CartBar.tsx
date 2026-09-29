"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";

/** Floating "N items · $X — View cart" bar that sits above the bottom nav. */
export function CartBar() {
  const { cartCount, cartTotal } = useStore();
  if (!cartCount) return null;

  return (
    <div className="fixed bottom-[68px] inset-x-0 z-40 mx-auto max-w-[520px] px-4 pointer-events-none">
      <Link
        href="/cart"
        className="pointer-events-auto flex items-center gap-3 bg-ink-900 text-white rounded-2xl px-4 py-3 shadow-lg shadow-black/20 active:scale-[0.99] transition"
      >
        <span className="w-9 h-9 rounded-xl bg-brand-400 text-ink-900 flex items-center justify-center shrink-0">
          <Icon name="cart" className="w-[18px] h-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">
            {cartCount} item{cartCount === 1 ? "" : "s"}
          </p>
          <p className="text-xs text-white/60">{money(cartTotal)}</p>
        </div>
        <span className="text-sm font-semibold flex items-center gap-1">
          View cart
          <Icon name="chevron" className="w-4 h-4" />
        </span>
      </Link>
    </div>
  );
}
