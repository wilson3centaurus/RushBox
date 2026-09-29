"use client";

import { Card, TopBar } from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";

const TOPICS: { icon: IconName; label: string; sub: string }[] = [
  { icon: "orders", label: "Problem with an order", sub: "Missing, damaged or late items" },
  { icon: "truck", label: "Problem with a trip", sub: "Driver, price or delivery issue" },
  { icon: "receipt", label: "Buy-for-me dispute", sub: "Receipt, refund or wrong items" },
  { icon: "wallet", label: "Payments & refunds", sub: "Charges, escrow and top-ups" },
  { icon: "user", label: "My account", sub: "Number, address and login" },
];

const FAQ = [
  {
    q: "How does the bidding work?",
    a: "You post a job with the price you want to pay. Drivers nearby see it and send offers — some match your price, some go lower or higher. You pick whichever offer works, based on price, rating and how far away they are.",
  },
  {
    q: "What is Buy-for-me?",
    a: "You give us the shop, the items and a budget. Your budget is held in your RushBox wallet, a runner buys the items, uploads the receipt, and the money is released to them on delivery. Anything left over comes back to you.",
  },
  {
    q: "Where do the groceries come from?",
    a: "Our own RushBox dark stores — small warehouses stocked and run by us, not third-party shops. That's how we keep 30-minute delivery and consistent pricing.",
  },
];

export default function Support() {
  return (
    <div>
      <TopBar title="Help & support" back="/profile" />

      <main className="px-5 py-5 space-y-5">
        <Card className="p-4 flex items-center gap-3 bg-ink-900 border-ink-900 text-white">
          <span className="w-11 h-11 rounded-xl bg-brand-400 text-ink-900 flex items-center justify-center shrink-0">
            <Icon name="chat" className="w-5 h-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Chat with us</p>
            <p className="text-xs text-white/60">
              Average reply time: 4 minutes
            </p>
          </div>
          <Icon name="chevron" className="w-4 h-4 text-white/40" />
        </Card>

        <section>
          <h2 className="font-semibold mb-3">What do you need help with?</h2>
          <Card className="divide-y divide-ink-100">
            {TOPICS.map((t) => (
              <button
                key={t.label}
                className="flex items-center gap-3 p-4 w-full text-left hover:bg-ink-50"
              >
                <span className="w-9 h-9 rounded-xl bg-ink-100 text-ink-600 flex items-center justify-center shrink-0">
                  <Icon name={t.icon} className="w-[18px] h-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{t.label}</span>
                  <span className="block text-[11px] text-ink-400">{t.sub}</span>
                </span>
                <Icon name="chevron" className="w-4 h-4 text-ink-300 shrink-0" />
              </button>
            ))}
          </Card>
        </section>

        <section>
          <h2 className="font-semibold mb-3">Common questions</h2>
          <div className="space-y-2">
            {FAQ.map((f) => (
              <details key={f.q} className="group">
                <Card className="p-4">
                  <summary className="flex items-center gap-2 cursor-pointer list-none">
                    <span className="text-sm font-medium flex-1">{f.q}</span>
                    <Icon
                      name="chevron"
                      className="w-4 h-4 text-ink-400 rotate-90 group-open:-rotate-90 transition-transform shrink-0"
                    />
                  </summary>
                  <p className="text-sm text-ink-600 mt-3 leading-relaxed">
                    {f.a}
                  </p>
                </Card>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
