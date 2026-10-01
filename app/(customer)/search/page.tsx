"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { ProductGrid } from "@/components/product";
import { CartBar } from "@/components/CartBar";
import { Emoji } from "@/components/Emoji";

const SUGGESTIONS = ["Bread", "Milk", "Mealie meal", "Paracetamol", "Mazoe", "Eggs"];

export default function Search() {
  const { products, categories } = useStore();
  const [q, setQ] = useState("");
  const router = useRouter();

  const term = q.trim().toLowerCase();
  const results = term
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          categories.find((c) => c.slug === p.category)
            ?.name.toLowerCase()
            .includes(term),
      )
    : [];

  return (
    <div>
      <header className="sticky top-0 z-30 bg-white border-b border-ink-100 safe-top">
        <div className="flex items-center gap-2 px-4 h-14">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="-ml-2 p-2 rounded-full hover:bg-ink-100"
          >
            <Icon name="back" />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-ink-100 rounded-xl px-3 py-2.5">
            <Icon name="search" className="w-[18px] h-[18px] text-ink-400" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search groceries, medicine…"
              className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-ink-400"
            />
            {q ? (
              <button onClick={() => setQ("")} aria-label="Clear search">
                <Icon name="close" className="w-4 h-4 text-ink-400" />
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="px-5 py-5">
        {!term ? (
          <>
            <h2 className="text-sm font-semibold text-ink-700">Popular searches</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setQ(s)}
                  className="px-3 py-1.5 rounded-full bg-ink-100 text-ink-600 text-xs font-medium hover:bg-ink-200"
                >
                  {s}
                </button>
              ))}
            </div>

            <h2 className="text-sm font-semibold text-ink-700 mt-7">
              Browse categories
            </h2>
            <div className="grid grid-cols-4 gap-3 mt-3">
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => router.push(`/groceries/${c.slug}`)}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span
                    className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${c.tile} flex items-center justify-center`}
                  >
                    <Emoji char={c.emoji} className="w-7 h-7" />
                  </span>
                  <span className="text-[10px] font-medium text-ink-600 leading-tight text-center">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : results.length ? (
          <>
            <p className="text-sm text-ink-500 mb-3">
              {results.length} result{results.length === 1 ? "" : "s"} for
              <span className="font-semibold text-ink-800"> “{q}”</span>
            </p>
            <ProductGrid products={results} />
          </>
        ) : (
          <EmptyState
            icon="search"
            title={`No results for “${q}”`}
            body="Try a different word, or ask a runner to buy it for you from any shop in town."
          />
        )}
      </main>

      <CartBar />
    </div>
  );
}
