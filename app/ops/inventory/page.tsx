"use client";

import { useState } from "react";
import { Badge, Button, Card, Stat } from "@/components/ui";
import { Icon } from "@/components/icons";
import { PageHead, TableCard } from "@/components/DashShell";
import { money } from "@/lib/format";
import { CATEGORIES, PRODUCTS } from "@/lib/mock/data";

export default function OpsInventory() {
  const [q, setQ] = useState("");
  const [only, setOnly] = useState<"all" | "low">("all");

  const rows = PRODUCTS.filter((p) => p.store === "ds-msasa")
    .filter((p) => (only === "low" ? p.stock < 20 : true))
    .filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase()));

  const value = rows.reduce((s, p) => s + p.price * p.stock, 0);

  return (
    <div className="p-5 lg:p-8">
      <PageHead
        title="Inventory"
        sub="RushBox Msasa · stock we own and hold"
        action={
          <Button variant="primary" size="sm">
            <Icon name="plus" className="w-4 h-4" strokeWidth={2.4} />
            Add stock
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="SKUs stocked" value={String(rows.length)} icon="store" />
        <Stat label="Stock value" value={money(value)} icon="wallet" tone="green" />
        <Stat
          label="Low stock"
          value={String(PRODUCTS.filter((p) => p.stock < 20).length)}
          icon="bell"
          tone="red"
        />
        <Stat label="Out of stock" value="0" icon="close" tone="grey" />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-ink-200 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Icon name="search" className="w-4 h-4 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="flex-1 min-w-0 text-sm outline-none"
          />
        </div>
        {(["all", "low"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setOnly(f)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
              only === f
                ? "bg-ink-900 text-white"
                : "bg-white border border-ink-200 text-ink-600 hover:bg-ink-50"
            }`}
          >
            {f === "all" ? "All items" : "Low stock only"}
          </button>
        ))}
      </div>

      <TableCard head={["Product", "Category", "Price", "In stock", "Status", ""]}>
        {rows.map((p) => {
          const low = p.stock < 20;
          return (
            <tr key={p.id} className="hover:bg-ink-50/60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-lg bg-ink-50 flex items-center justify-center text-lg shrink-0">
                    {p.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-[11px] text-ink-400">{p.unit}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-ink-500">
                {CATEGORIES.find((c) => c.slug === p.category)?.name}
              </td>
              <td className="px-4 py-3 font-medium">{money(p.price)}</td>
              <td className="px-4 py-3 tabular-nums font-medium">{p.stock}</td>
              <td className="px-4 py-3">
                <Badge tone={low ? "red" : "green"}>
                  {low ? "Reorder" : "Healthy"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <button className="text-xs font-semibold text-brand-600 hover:underline whitespace-nowrap">
                  Adjust
                </button>
              </td>
            </tr>
          );
        })}
      </TableCard>

      {!rows.length ? (
        <Card className="p-8 text-center mt-4">
          <p className="text-sm text-ink-500">No products match that filter.</p>
        </Card>
      ) : null}
    </div>
  );
}
