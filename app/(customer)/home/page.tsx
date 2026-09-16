"use client";

import Link from "next/link";
import { Avatar, Badge, Card } from "@/components/ui";
import { Icon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { CATEGORIES, PRODUCTS, productById } from "@/lib/mock/data";
import { etaLabel, money, statusLabel } from "@/lib/format";

export default function Home() {
  const { user, address, orders, jobs, addToCart } = useStore();
  const activeOrder = orders.find(
    (o) => o.status !== "delivered" && o.status !== "cancelled",
  );
  const activeJob = jobs.find(
    (j) => j.status === "collecting_bids" || j.status === "assigned" || j.status === "in_transit",
  );
  const deals = PRODUCTS.filter((p) => p.tags?.includes("deal"));
  const popular = PRODUCTS.filter((p) => p.tags?.includes("bestseller")).slice(0, 6);

  return (
    <div>
      <header className="brand-gradient text-white px-5 pt-5 pb-8 safe-top rounded-b-3xl">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">
              Deliver to
            </p>
            <button className="flex items-center gap-1 font-semibold truncate max-w-full">
              <Icon name="pin" className="w-4 h-4 text-brand-300 shrink-0" />
              <span className="truncate">{address}</span>
              <Icon name="chevron" className="w-3.5 h-3.5 rotate-90 shrink-0" />
            </button>
          </div>
          <Link
            href="/profile"
            className="p-2 rounded-full hover:bg-white/10"
            aria-label="Notifications"
          >
            <Icon name="bell" />
          </Link>
          <Avatar initials={user?.initials ?? "G"} className="w-9 h-9" />
        </div>

        <Link
          href="/search"
          className="mt-5 flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3.5 text-ink-400"
        >
          <Icon name="search" className="w-[18px] h-[18px]" />
          <span className="text-sm">Search groceries, medicine…</span>
        </Link>
      </header>

      <main className="px-5 -mt-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <ServiceCard
            href="/groceries"
            emoji="🛒"
            title="Shop"
            sub="30 min delivery"
            tone="bg-brand-400 text-ink-900"
          />
          <ServiceCard
            href="/move"
            emoji="🛻"
            title="Move"
            sub="Drivers bid, you choose"
            tone="bg-ink-900 text-white"
          />
        </div>

        {activeOrder ? (
          <Link href={`/orders/${activeOrder.id}`} className="block">
            <Card className="p-4 border-brand-200 bg-brand-50">
              <div className="flex items-center gap-3">
                <span className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-brand-400 text-ink-900 shrink-0">
                  <span className="absolute inset-0 rounded-xl bg-brand-400 animate-pulse-ring" />
                  <Icon name="bike" className="relative w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">
                    {statusLabel(activeOrder.status)} · {activeOrder.id}
                  </p>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Arriving in {etaLabel(activeOrder.etaMins)}
                  </p>
                </div>
                <Icon name="chevron" className="w-4 h-4 text-ink-400" />
              </div>
            </Card>
          </Link>
        ) : null}

        {activeJob ? (
          <Link href={`/move/${activeJob.id}`} className="block">
            <Card className="p-4 border-ink-200">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-ink-900 text-brand-400 flex items-center justify-center shrink-0">
                  <Icon name="truck" className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">
                    {activeJob.status === "collecting_bids"
                      ? `${activeJob.bids.length} offer${activeJob.bids.length === 1 ? "" : "s"} coming in`
                      : statusLabel(activeJob.status)}
                  </p>
                  <p className="text-xs text-ink-500 mt-0.5 truncate">
                    {activeJob.pickup} → {activeJob.dropoff}
                  </p>
                </div>
                <Icon name="chevron" className="w-4 h-4 text-ink-400" />
              </div>
            </Card>
          </Link>
        ) : null}

        <section>
          <SectionHead title="Shop by category" href="/groceries" />
          <div className="grid grid-cols-4 gap-3 mt-3">
            {CATEGORIES.slice(0, 8).map((c) => (
              <Link
                key={c.slug}
                href={`/groceries/${c.slug}`}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className={`w-full aspect-square rounded-2xl ${c.color} flex items-center justify-center text-2xl`}
                >
                  {c.emoji}
                </span>
                <span className="text-[10px] font-medium text-ink-600 text-center leading-tight">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHead title="Need something moved?" />
          <div className="grid grid-cols-3 gap-3 mt-3">
            <MoveTile href="/move/new/cargo" emoji="📦" label="Cargo" sub="Pallets, furniture" />
            <MoveTile href="/move/new/parcel" emoji="✉️" label="Parcel" sub="Docs, small items" />
            <MoveTile href="/move/new/errand" emoji="🧾" label="Buy for me" sub="We shop for you" />
          </div>
        </section>

        {deals.length ? (
          <section>
            <SectionHead title="Deals today" href="/groceries" />
            <div className="flex gap-3 mt-3 overflow-x-auto no-scrollbar -mx-5 px-5">
              {deals.map((p) => (
                <Card key={p.id} className="p-3 w-36 shrink-0">
                  <div className="relative">
                    <div className="h-20 rounded-xl bg-ink-50 flex items-center justify-center text-4xl">
                      {p.emoji}
                    </div>
                    <Badge tone="red" className="absolute top-1 left-1">
                      Deal
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold mt-2 leading-tight line-clamp-2">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-ink-400">{p.unit}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="text-sm font-bold">{money(p.price)}</span>
                      {p.wasPrice ? (
                        <span className="text-[10px] text-ink-400 line-through ml-1">
                          {money(p.wasPrice)}
                        </span>
                      ) : null}
                    </div>
                    <button
                      onClick={() => addToCart(p.id)}
                      aria-label={`Add ${p.name}`}
                      className="w-7 h-7 rounded-lg bg-brand-400 text-ink-900 flex items-center justify-center active:scale-95 transition"
                    >
                      <Icon name="plus" className="w-4 h-4" strokeWidth={2.4} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <SectionHead title="Popular near you" href="/groceries" />
          <div className="grid grid-cols-3 gap-3 mt-3">
            {popular.map((p) => (
              <Link key={p.id} href={`/product/${p.id}`}>
                <Card className="p-2.5">
                  <div className="h-16 rounded-lg bg-ink-50 flex items-center justify-center text-3xl">
                    {p.emoji}
                  </div>
                  <p className="text-[11px] font-semibold mt-2 leading-tight line-clamp-2">
                    {p.name}
                  </p>
                  <p className="text-xs font-bold text-ink-900 mt-1">
                    {money(p.price)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {orders.length ? (
          <section className="pb-4">
            <SectionHead title="Order again" href="/orders" />
            <div className="space-y-2 mt-3">
              {orders.slice(0, 2).map((o) => (
                <Card key={o.id} className="p-3.5 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {o.lines.slice(0, 3).map((l) => (
                      <span
                        key={l.productId}
                        className="w-9 h-9 rounded-full bg-ink-50 border-2 border-white flex items-center justify-center text-base"
                      >
                        {productById(l.productId)?.emoji}
                      </span>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{o.id}</p>
                    <p className="text-xs text-ink-500">
                      {o.lines.length} items · {money(o.total)}
                    </p>
                  </div>
                  <button
                    onClick={() => o.lines.forEach((l) => addToCart(l.productId, l.qty))}
                    className="text-xs font-semibold text-brand-600 px-3 py-1.5 rounded-lg border border-brand-200 hover:bg-brand-50"
                  >
                    Reorder
                  </button>
                </Card>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function SectionHead({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-semibold text-ink-900">{title}</h2>
      {href ? (
        <Link href={href} className="text-xs font-semibold text-brand-600">
          See all
        </Link>
      ) : null}
    </div>
  );
}

function ServiceCard({
  href,
  emoji,
  title,
  sub,
  tone,
}: {
  href: string;
  emoji: string;
  title: string;
  sub: string;
  tone: string;
}) {
  return (
    <Link
      href={href}
      className={`${tone} rounded-2xl p-4 active:scale-[0.98] transition-transform`}
    >
      <span className="text-3xl">{emoji}</span>
      <p className="font-bold text-lg mt-2 leading-none">{title}</p>
      <p className="text-[11px] opacity-70 mt-1.5 leading-tight">{sub}</p>
    </Link>
  );
}

function MoveTile({
  href,
  emoji,
  label,
  sub,
}: {
  href: string;
  emoji: string;
  label: string;
  sub: string;
}) {
  return (
    <Link href={href}>
      <Card className="p-3 h-full">
        <span className="text-2xl">{emoji}</span>
        <p className="text-xs font-semibold mt-1.5">{label}</p>
        <p className="text-[10px] text-ink-400 leading-tight mt-0.5">{sub}</p>
      </Card>
    </Link>
  );
}
