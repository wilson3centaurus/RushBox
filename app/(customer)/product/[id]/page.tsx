"use client";

import { use } from "react";
import Link from "next/link";
import { Badge, Button, Card, TopBar, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { QtyStepper, ProductGrid } from "@/components/product";
import { useStore } from "@/lib/store";
import { money, moneyShort } from "@/lib/format";
import { ProductImage } from "@/components/Emoji";

export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { cart, addToCart, setQty, products, categories, productById, pricing } = useStore();
  const freeDelivery = pricing.delivery.freeOverEnabled
    ? `Free delivery on orders over ${moneyShort(pricing.delivery.freeThreshold)}`
    : `Delivery from ${moneyShort(pricing.delivery.baseFee)}, in about 30 minutes`;
  const product = productById(id);

  if (!product) {
    return (
      <div>
        <TopBar title="Product" back />
        <EmptyState
          icon="bag"
          title="Product not found"
          body="This item may have been removed from the catalogue."
          action={<Button href="/groceries">Back to shop</Button>}
        />
      </div>
    );
  }

  const line = cart.find((l) => l.productId === product.id);
  const category = categories.find((c) => c.slug === product.category);
  const related = products.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 3);

  return (
    <div>
      <TopBar title={product.name} back />

      <main className="pb-6">
        <div className="bg-white px-5 pt-6 pb-8 flex items-center justify-center">
          <ProductImage
            product={product}
            className="w-44 h-44 rounded-3xl"
            art="w-24 h-24"
          />
        </div>

        <div className="px-5 -mt-4 space-y-5">
          <Card className="p-5">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold leading-tight">
                  {product.name}
                </h1>
                <p className="text-sm text-ink-500 mt-0.5">{product.unit}</p>
              </div>
              {product.tags?.includes("bestseller") ? (
                <Badge tone="brand">Bestseller</Badge>
              ) : null}
            </div>

            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-2xl font-bold">{money(product.price)}</span>
              {product.wasPrice ? (
                <>
                  <span className="text-sm text-ink-400 line-through">
                    {money(product.wasPrice)}
                  </span>
                  <Badge tone="red">
                    Save {money(product.wasPrice - product.price)}
                  </Badge>
                </>
              ) : null}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-ink-100 text-xs text-ink-500">
              <span className="flex items-center gap-1.5">
                <Icon name="clock" className="w-4 h-4 text-brand-500" />
                30 min delivery
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="store" className="w-4 h-4 text-brand-500" />
                {product.stock} in stock
              </span>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-sm">Why RushBox</h2>
            <ul className="mt-3 space-y-2.5">
              {[
                "Stocked in our own store, not a third-party shop",
                "Quality checked before it leaves the warehouse",
                freeDelivery,
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-sm text-ink-600">
                  <Icon
                    name="check"
                    className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5"
                    strokeWidth={2.4}
                  />
                  {t}
                </li>
              ))}
            </ul>
          </Card>

          {related.length ? (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">More in {category?.name}</h2>
                <Link
                  href={`/groceries/${product.category}`}
                  className="text-xs font-semibold text-brand-600"
                >
                  See all
                </Link>
              </div>
              <ProductGrid products={related} />
            </section>
          ) : null}
        </div>
      </main>

      <div className="fixed bottom-[68px] inset-x-0 z-40 mx-auto max-w-[520px] px-4">
        <div className="bg-white border border-ink-100 rounded-2xl p-3 shadow-lg shadow-black/10 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold leading-none">
              {money(product.price * (line?.qty ?? 1))}
            </p>
            <p className="text-[11px] text-ink-400 mt-1">
              incl. all taxes
            </p>
          </div>
          {line ? (
            <QtyStepper qty={line.qty} onChange={(q) => setQty(product.id, q)} />
          ) : (
            <Button onClick={() => addToCart(product.id)} variant="primary">
              Add to cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
