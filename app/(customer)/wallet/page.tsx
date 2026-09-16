"use client";

import { Badge, Button, Card, TopBar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { money } from "@/lib/format";
import { TimeAgo } from "@/components/TimeAgo";

const METHODS = [
  { id: "ecocash", label: "EcoCash", sub: "+263 77 123 4567", emoji: "📱", primary: true },
  { id: "card", label: "Visa", sub: "•••• 4821", emoji: "💳", primary: false },
];

const TXNS = [
  { id: "t1", label: "Order RB-4821", sub: "Groceries", amount: -10.4, at: new Date(Date.now() - 12 * 60_000).toISOString() },
  { id: "t2", label: "Escrow released", sub: "Buy-for-me · N. Richards", amount: -58.5, at: new Date(Date.now() - 3 * 24 * 3600_000).toISOString() },
  { id: "t3", label: "Top up", sub: "EcoCash", amount: 100, at: new Date(Date.now() - 3 * 24 * 3600_000).toISOString() },
  { id: "t4", label: "Trip refund", sub: "Driver cancelled", amount: 12, at: new Date(Date.now() - 8 * 24 * 3600_000).toISOString() },
];

export default function Wallet() {
  const balance = 43.1;
  const held = 45;

  return (
    <div>
      <TopBar title="Wallet & payments" back="/profile" />

      <main className="px-5 py-5 space-y-5">
        <Card className="p-5 bg-ink-900 border-ink-900 text-white">
          <p className="text-xs uppercase tracking-wider text-white/50 font-semibold">
            Available balance
          </p>
          <p className="text-4xl font-bold mt-1.5">{money(balance)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-white/60">
            <Icon name="shield" className="w-3.5 h-3.5" />
            {money(held)} held in escrow for an active errand
          </div>
          <div className="flex gap-2 mt-5">
            <Button variant="primary" size="sm" className="flex-1">
              Top up
            </Button>
            <Button variant="outline" size="sm" className="flex-1 !bg-white/10 !border-white/20 !text-white">
              Withdraw
            </Button>
          </div>
        </Card>

        <section>
          <h2 className="font-semibold mb-3">Payment methods</h2>
          <Card className="divide-y divide-ink-100">
            {METHODS.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-4">
                <span className="text-xl">{m.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-[11px] text-ink-400">{m.sub}</p>
                </div>
                {m.primary ? <Badge tone="green">Primary</Badge> : null}
              </div>
            ))}
            <button className="flex items-center gap-3 p-4 w-full hover:bg-ink-50">
              <span className="w-9 h-9 rounded-xl border border-dashed border-ink-300 text-ink-400 flex items-center justify-center shrink-0">
                <Icon name="plus" className="w-4 h-4" strokeWidth={2.4} />
              </span>
              <span className="text-sm font-medium text-ink-600">
                Add payment method
              </span>
            </button>
          </Card>
        </section>

        <section>
          <h2 className="font-semibold mb-3">Recent activity</h2>
          <Card className="divide-y divide-ink-100">
            {TXNS.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-4">
                <span
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    t.amount > 0
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-ink-100 text-ink-500"
                  }`}
                >
                  <Icon
                    name={t.amount > 0 ? "plus" : "receipt"}
                    className="w-[18px] h-[18px]"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{t.label}</p>
                  <p className="text-[11px] text-ink-400">
                    {t.sub} · <TimeAgo iso={t.at} />
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold shrink-0 ${
                    t.amount > 0 ? "text-emerald-600" : "text-ink-800"
                  }`}
                >
                  {t.amount > 0 ? "+" : "−"}
                  {money(Math.abs(t.amount))}
                </span>
              </div>
            ))}
          </Card>
        </section>
      </main>
    </div>
  );
}
