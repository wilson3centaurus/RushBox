"use client";

import { useState } from "react";
import { Badge, Button, Card, Stat, TopBar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";

const RANGES = ["Today", "This week", "This month"];

const BARS = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 58 },
  { day: "Wed", value: 31 },
  { day: "Thu", value: 67 },
  { day: "Fri", value: 89 },
  { day: "Sat", value: 74 },
  { day: "Sun", value: 26 },
];

const TRIPS = [
  { id: "j1", label: "Cargo · Msasa → Subway City", amount: 17, at: "Today, 10:42" },
  { id: "j2", label: "Buy for me · N. Richards → CBD", amount: 9.35, at: "Today, 08:15" },
  { id: "j3", label: "Cargo · Graniteside → Chitungwiza", amount: 23.8, at: "Yesterday, 16:20" },
  { id: "j4", label: "Parcel · Avondale → Borrowdale", amount: 4.25, at: "Yesterday, 11:05" },
];

export default function Earnings() {
  const { pricing } = useStore();
  const [range, setRange] = useState("This week");
  const max = Math.max(...BARS.map((b) => b.value));
  const total = BARS.reduce((s, b) => s + b.value, 0);

  return (
    <div>
      <TopBar title="Earnings" />

      <main className="px-5 py-5 space-y-4">
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
                range === r
                  ? "bg-ink-900 text-white"
                  : "bg-ink-100 text-ink-600 hover:bg-ink-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <Card className="p-5 bg-ink-900 border-ink-900 text-white">
          <p className="text-xs uppercase tracking-wider text-white/50 font-semibold">
            {range} earnings
          </p>
          <p className="text-4xl font-bold mt-1.5">{money(total)}</p>
          <p className="text-xs text-white/60 mt-1">After {pricing.move.commissionPct}% RushBox commission</p>
          <Button variant="primary" size="sm" className="mt-4" full>
            Cash out to EcoCash
          </Button>
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold text-sm mb-4">Daily breakdown</h2>
          <div className="flex items-end justify-between gap-2 h-32">
            {BARS.map((b) => (
              <div key={b.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-md bg-brand-400"
                    style={{ height: `${(b.value / max) * 100}%` }}
                    title={money(b.value)}
                  />
                </div>
                <span className="text-[10px] text-ink-400 font-medium">
                  {b.day}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Trips completed" value="19" icon="check" tone="green" />
          <Stat label="Acceptance rate" value="92%" icon="zap" />
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent payouts</h2>
            <Badge tone="green">Paid out weekly</Badge>
          </div>
          <Card className="divide-y divide-ink-100">
            {TRIPS.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-4">
                <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Icon name="check" className="w-4 h-4" strokeWidth={2.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{t.label}</p>
                  <p className="text-[11px] text-ink-400">{t.at}</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600 shrink-0">
                  +{money(t.amount)}
                </span>
              </div>
            ))}
          </Card>
        </section>
      </main>
    </div>
  );
}
