"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { TopBar, Card } from "@/components/ui";
import { Icon } from "@/components/icons";
import { ProductGrid } from "@/components/product";
import { CategoryImage } from "@/components/Emoji";
import { CartBar } from "@/components/CartBar";

export default function Groceries() {
  const { products, categories, catalogueLoading } = useStore();
  const featured = products.filter((p) => p.tags?.length).slice(0, 9);

  return (
    <div>
      <TopBar
        title="Shop"
        subtitle="Delivered from RushBox Msasa · 30 min"
        right={
          <Link
            href="/search"
            aria-label="Search"
            className="p-2 rounded-full hover:bg-ink-100"
          >
            <Icon name="search" />
          </Link>
        }
      />

      <main className="px-5 py-5 space-y-6">
        <section>
          <h2 className="font-semibold mb-3">Categories</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((c) => (
              <Link key={c.slug} href={`/groceries/${c.slug}`}>
                <Card className="p-2.5 flex items-center gap-3">
                  <CategoryImage
                    category={c}
                    className="w-12 h-12 rounded-xl shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-ink-400">
                      {products.filter((p) => p.category === c.slug).length} items
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold mb-3">Trending in your area</h2>
          <ProductGrid products={featured} loading={catalogueLoading} />
        </section>
      </main>

      <CartBar />
    </div>
  );
}
