"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Badge, Button, Card, Stat } from "@/components/ui";
import { Icon } from "@/components/icons";
import { PageHead } from "@/components/DashShell";
import { Emoji } from "@/components/Emoji";

type Stage = "new" | "picking" | "packed" | "dispatched";

type Ticket = {
  id: string;
  stage: Stage;
  lines: { productId: string; qty: number }[];
  address: string;
  minsAgo: number;
  rider?: string;
};

const INITIAL: Ticket[] = [
  { id: "RB-4832", stage: "new", lines: [{ productId: "p7", qty: 2 }, { productId: "p11", qty: 1 }, { productId: "p39", qty: 1 }], address: "14 Fife Ave, CBD", minsAgo: 2 },
  { id: "RB-4831", stage: "new", lines: [{ productId: "p26", qty: 1 }, { productId: "p28", qty: 2 }], address: "Belvedere", minsAgo: 4 },
  { id: "RB-4829", stage: "picking", lines: [{ productId: "p14", qty: 1 }, { productId: "p18", qty: 1 }, { productId: "p20", qty: 3 }], address: "Eastlea", minsAgo: 7 },
  { id: "RB-4827", stage: "packed", lines: [{ productId: "p8", qty: 1 }, { productId: "p12", qty: 2 }], address: "Avondale", minsAgo: 11 },
  { id: "RB-4821", stage: "dispatched", lines: [{ productId: "p7", qty: 2 }, { productId: "p11", qty: 1 }], address: "Hatfield", minsAgo: 14, rider: "Thamu N." },
];

const COLUMNS: { stage: Stage; label: string; tone: "blue" | "amber" | "brand" | "green" }[] = [
  { stage: "new", label: "New orders", tone: "blue" },
  { stage: "picking", label: "Picking", tone: "amber" },
  { stage: "packed", label: "Packed", tone: "brand" },
  { stage: "dispatched", label: "Dispatched", tone: "green" },
];

const NEXT: Record<Stage, Stage | null> = {
  new: "picking",
  picking: "packed",
  packed: "dispatched",
  dispatched: null,
};

const ACTION: Record<Stage, string> = {
  new: "Start picking",
  picking: "Mark packed",
  packed: "Assign rider",
  dispatched: "Out for delivery",
};

export default function OpsFulfilment() {
  const { productById } = useStore();
  const [tickets, setTickets] = useState(INITIAL);

  function advance(id: string) {
    setTickets((list) =>
      list.map((t) => {
        const next = NEXT[t.stage];
        if (t.id !== id || !next) return t;
        return {
          ...t,
          stage: next,
          rider: next === "dispatched" ? "Thamu N." : t.rider,
        };
      }),
    );
  }

  return (
    <div className="p-5 lg:p-8">
      <PageHead
        title="Fulfilment queue"
        sub="RushBox Msasa · live orders"
        action={
          <Button variant="outline" size="sm">
            <Icon name="settings" className="w-4 h-4" />
            Store settings
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Orders today" value="148" icon="orders" delta="+12%" />
        <Stat label="Avg pick time" value="4m 12s" icon="clock" tone="blue" />
        <Stat label="Riders active" value="6" icon="bike" tone="green" />
        <Stat label="Low stock SKUs" value="9" icon="store" tone="red" />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = tickets.filter((t) => t.stage === col.stage);
          return (
            <section key={col.stage}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm">{col.label}</h2>
                <Badge tone={col.tone}>{items.length}</Badge>
              </div>
              <div className="space-y-2.5">
                {items.map((t) => (
                  <Card key={t.id} className="p-3.5">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm">{t.id}</p>
                      <span className="text-[11px] text-ink-400">
                        {t.minsAgo}m ago
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-500 mt-0.5">{t.address}</p>

                    <ul className="mt-2.5 space-y-1">
                      {t.lines.map((l) => {
                        const p = productById(l.productId);
                        return (
                          <li
                            key={l.productId}
                            className="flex items-center gap-2 text-xs"
                          >
                            <Emoji char={p?.emoji ?? ""} className="w-4 h-4 shrink-0" />
                            <span className="flex-1 truncate text-ink-600">
                              {p?.name}
                            </span>
                            <span className="text-ink-400 font-medium">
                              ×{l.qty}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    {t.rider ? (
                      <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-emerald-700">
                        <Icon name="bike" className="w-3.5 h-3.5" />
                        {t.rider}
                      </div>
                    ) : null}

                    {NEXT[t.stage] ? (
                      <button
                        onClick={() => advance(t.id)}
                        className="w-full mt-3 py-2 rounded-lg bg-ink-900 text-white text-xs font-semibold hover:bg-ink-800 active:scale-[0.98] transition"
                      >
                        {ACTION[t.stage]}
                      </button>
                    ) : null}
                  </Card>
                ))}
                {!items.length ? (
                  <div className="rounded-2xl border border-dashed border-ink-200 py-8 text-center text-xs text-ink-400">
                    Nothing here
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
