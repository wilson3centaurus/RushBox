"use client";

import { useState } from "react";
import { Badge, Button, Card, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/icons";
import { PageHead } from "@/components/DashShell";
import { money } from "@/lib/format";
import { VEHICLES } from "@/lib/mock/data";
import { Emoji } from "@/components/Emoji";

export default function AdminPricing() {
  const [commission, setCommission] = useState(15);
  const [deliveryFee, setDeliveryFee] = useState(1.5);
  const [freeOver, setFreeOver] = useState(20);
  const [errandFee, setErrandFee] = useState(10);

  const exampleBid = 20;

  return (
    <div className="p-5 lg:p-8">
      <PageHead
        title="Pricing & fees"
        sub="What RushBox charges on each service line"
        action={
          <Button variant="primary" size="sm">
            Save changes
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <Icon name="truck" className="w-4 h-4" />
            </span>
            <h2 className="font-semibold">Move marketplace</h2>
          </div>

          <div className="space-y-4">
            <Field
              label="Platform commission"
              hint="Taken from the agreed bid before the transporter is paid."
            >
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={30}
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="flex-1 accent-brand-500"
                />
                <span className="w-14 text-right font-bold tabular-nums">
                  {commission}%
                </span>
              </div>
            </Field>

            <div className="rounded-xl bg-ink-50 p-3.5 text-sm space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">
                On a {money(exampleBid)} job
              </p>
              <div className="flex justify-between text-ink-600">
                <span>Customer pays</span>
                <span className="font-medium">{money(exampleBid)}</span>
              </div>
              <div className="flex justify-between text-ink-600">
                <span>RushBox keeps</span>
                <span className="font-medium">
                  {money((exampleBid * commission) / 100)}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-1.5 border-t border-ink-200">
                <span>Transporter receives</span>
                <span className="text-emerald-600">
                  {money(exampleBid * (1 - commission / 100))}
                </span>
              </div>
            </div>

            <Field
              label="Buy-for-me service fee"
              hint="Charged on top of the shopping budget, as a percentage of the budget."
            >
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={errandFee}
                  onChange={(e) => setErrandFee(Number(e.target.value))}
                  className="flex-1 accent-brand-500"
                />
                <span className="w-14 text-right font-bold tabular-nums">
                  {errandFee}%
                </span>
              </div>
            </Field>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Icon name="bag" className="w-4 h-4" />
            </span>
            <h2 className="font-semibold">Groceries</h2>
          </div>

          <div className="space-y-4">
            <Field label="Standard delivery fee">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 font-semibold">
                  $
                </span>
                <input
                  type="number"
                  step="0.5"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value))}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </Field>

            <Field label="Free delivery over" hint="Encourages bigger baskets.">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 font-semibold">
                  $
                </span>
                <input
                  type="number"
                  value={freeOver}
                  onChange={(e) => setFreeOver(Number(e.target.value))}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </Field>

            <div className="rounded-xl bg-ink-50 p-3.5">
              <p className="text-xs text-ink-600 leading-relaxed">
                Because we own the stock, margin on groceries comes from the
                buy/sell spread — the delivery fee only needs to cover the rider.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h2 className="font-semibold mb-1">Suggested price bands</h2>
          <p className="text-xs text-ink-500 mb-4">
            Shown to customers as &ldquo;most drivers accept $X–$Y&rdquo; when they set
            their offer.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {VEHICLES.map((v) => (
              <div key={v.id} className="rounded-xl border border-ink-100 p-3.5">
                <div className="flex items-center gap-2">
                  <Emoji char={v.emoji} className="w-6 h-6" />
                  <p className="text-sm font-semibold">{v.label}</p>
                </div>
                <p className="text-[11px] text-ink-400 mt-1.5 leading-tight">
                  {v.capacity}
                </p>
                <Badge tone="grey" className="mt-2.5">
                  {
                    {
                      bike: "$3–6",
                      car: "$6–10",
                      van: "$13–21",
                      bakkie: "$18–27",
                      truck: "$31–48",
                    }[v.id]
                  }
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
