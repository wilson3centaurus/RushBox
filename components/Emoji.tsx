"use client";

import { useState } from "react";
import { emojiSrc } from "@/lib/emoji";
import type { Product } from "@/lib/types";
import { CATEGORIES } from "@/lib/mock/data";

/**
 * Bundled vector art rather than the system emoji font, so a tomato looks the
 * same on every phone. Falls back to the platform glyph if a file is missing.
 */
export function Emoji({
  char,
  className = "w-6 h-6",
  label,
}: {
  char: string;
  className?: string;
  label?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={`inline-flex items-center justify-center ${className}`}>
        {char}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG, no optimisation needed
    <img
      src={emojiSrc(char)}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      draggable={false}
      onError={() => setFailed(true)}
      className={`object-contain select-none ${className}`}
    />
  );
}

/**
 * A real photo when the product has one, otherwise the vector illustration on
 * the category's tint. Photos are added by setting `image` on the product —
 * see docs/PRODUCT_IMAGES.md.
 */
export function ProductImage({
  product,
  className = "h-20",
  art = "w-12 h-12",
}: {
  product: Product;
  className?: string;
  art?: string;
}) {
  const [broken, setBroken] = useState(false);
  const tint =
    CATEGORIES.find((c) => c.slug === product.category)?.tile ??
    "from-ink-50 to-ink-100";

  if (product.image && !broken) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-ink-50 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- source is user-supplied at runtime */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={() => setBroken(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl bg-gradient-to-br ${tint} flex items-center justify-center ${className}`}
    >
      <Emoji char={product.emoji} className={art} label={product.name} />
    </div>
  );
}
