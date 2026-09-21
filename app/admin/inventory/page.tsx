"use client";

import { useState } from "react";
import { Badge, Button, Card, Stat } from "@/components/ui";
import { Icon } from "@/components/icons";
import { PageHead, TableCard } from "@/components/DashShell";
import { BarList } from "@/components/charts";
import { money } from "@/lib/format";
import { CATEGORIES, DARK_STORES, PRODUCTS } from "@/lib/mock/data";
import { ProductImage } from "@/components/Emoji";

export default function AdminInventory() {
  const [store, setStore] = useState("all");

  const rows = PRODUCTS.filter((p) => store === "all" || p.store === store);
  const value = rows.reduce((s, p) => s + p.price * p.stock, 0);
  const low = rows.filter((p) => p.stock < 20);

  const byCategory = CATEGORIES.map((c) => ({
    label: c.name,
    value: PRODUCTS.filter((p) => p.category === c.slug).reduce(
      (s, p) => s + p.stock,
      0,
    ),
  }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="p-5 lg:p-8">
      <PageHead
        title="Inventory"
        sub="Stock across all RushBox dark stores"
        action={
          <Button variant="primary" size="sm">
            <Icon name="plus" className="w-4 h-4" strokeWidth={2.4} />
            New product
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Total SKUs" value={String(rows.length)} icon="store" />
        <Stat label="Stock value" value={money(value)} icon="wallet" tone="green" />
        <Stat label="Below reorder" value={String(low.length)} icon="bell" tone="red" />
        <Stat label="Dark stores" value={String(DARK_STORES.length)} icon="package" tone="blue" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-semibold mb-1">Units held by category</h2>
          <p className="text-xs text-ink-500 mb-4">Across every store</p>
          <BarList data={byCategory} />
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-4">Stores</h2>
          <div className="space-y-2">
            <FilterRow
              active={store === "all"}
              onClick={() => setStore("all")}
              label="All stores"
              sub={`${PRODUCTS.length} SKUs`}
            />
            {DARK_STORES.map((s) => (
              <FilterRow
                key={s.id}
                active={store === s.id}
                onClick={() => setStore(s.id)}
                label={s.name}
                sub={`${s.lowStock} low · ${s.ordersToday} orders today`}
              />
            ))}
          </div>
        </Card>
      </div>

      <TableCard head={["Product", "Category", "Store", "Price", "Stock", "Status"]}>
        {rows.map((p) => {
          const isLow = p.stock < 20;
          return (
            <tr key={p.id} className="hover:bg-ink-50/60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <ProductImage product={p} className="w-9 h-9 shrink-0" art="w-5 h-5" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-[11px] text-ink-400">{p.unit}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-ink-500 whitespace-nowrap">
                {CATEGORIES.find((c) => c.slug === p.category)?.name}
              </td>
              <td className="px-4 py-3 text-ink-500 whitespace-nowrap">
                {DARK_STORES.find((s) => s.id === p.store)?.area}
              </td>
              <td className="px-4 py-3 font-medium">{money(p.price)}</td>
              <td className="px-4 py-3 tabular-nums font-medium">{p.stock}</td>
              <td className="px-4 py-3">
                <Badge tone={isLow ? "red" : "green"}>
                  {isLow ? "Reorder" : "Healthy"}
                </Badge>
              </td>
            </tr>
          );
        })}
      </TableCard>
    </div>
  );
}

function FilterRow({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition ${
        active
          ? "border-brand-400 bg-brand-50"
          : "border-ink-100 hover:bg-ink-50"
      }`}
    >
      <p className="text-sm font-medium">{label}</p>
      <p className="text-[11px] text-ink-400 mt-0.5">{sub}</p>
    </button>
  );
}
