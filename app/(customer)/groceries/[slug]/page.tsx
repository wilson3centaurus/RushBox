"use client";

import { use, useState } from "react";
import { TopBar, EmptyState } from "@/components/ui";
import { ProductGrid } from "@/components/product";
import { CartBar } from "@/components/CartBar";
import { categoryBySlug, productsByCategory } from "@/lib/mock/data";

const SORTS = [
  { id: "popular", label: "Popular" },
  { id: "low", label: "Price: low" },
  { id: "high", label: "Price: high" },
] as const;

export default function Category({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("popular");

  const category = categoryBySlug(slug);
  const products = [...productsByCategory(slug)].sort((a, b) => {
    if (sort === "low") return a.price - b.price;
    if (sort === "high") return b.price - a.price;
    return (b.tags?.length ?? 0) - (a.tags?.length ?? 0);
  });

  return (
    <div>
      <TopBar
        title={category?.name ?? "Category"}
        subtitle={`${products.length} items available`}
        back
      />

      <div className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-ink-100 bg-white sticky top-14 z-20">
        {SORTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSort(s.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              sort === s.id
                ? "bg-ink-900 text-white"
                : "bg-ink-100 text-ink-600 hover:bg-ink-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <main className="px-5 py-5">
        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            icon="bag"
            title="Nothing here yet"
            body="This category is still being stocked at your nearest RushBox store."
          />
        )}
      </main>

      <CartBar />
    </div>
  );
}
