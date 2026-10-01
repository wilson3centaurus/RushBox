"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, EmptyState, TopBar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { MapView } from "@/components/MapView";
import { money } from "@/lib/format";
import { TimeAgo } from "@/components/TimeAgo";
import { OPEN_JOB_FEED, vehicleById } from "@/lib/mock/data";
import { useStore } from "@/lib/store";

export default function DriverJob({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const job = OPEN_JOB_FEED.find((j) => j.id === id);
  const [bid, setBid] = useState(job?.offer ?? 10);
  const [sent, setSent] = useState(false);
  const { pricing, verification } = useStore();
  const commission = pricing.move.commissionPct;
  const verified = verification?.status === "verified";

  if (!job) {
    return (
      <div>
        <TopBar title="Job" back="/driver" />
        <EmptyState
          icon="zap"
          title="Job no longer available"
          body="Someone else may have been assigned already."
          action={<Button href="/driver">Back to jobs</Button>}
        />
      </div>
    );
  }

  const payout = bid * (1 - commission / 100);

  return (
    <div>
      <TopBar title="Job details" subtitle={<TimeAgo iso={job.createdAt} />} back="/driver" />

      <MapView from={job.pickup} to={job.dropoff} progress={0} height="h-44" />

      <main className="px-5 py-5 space-y-4 pb-36">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <Badge tone="brand">{vehicleById(job.vehicle)?.label} needed</Badge>
            <span className="text-xs text-ink-400">~8.4 km total</span>
          </div>
          <div className="mt-3 space-y-3">
            <Stop
              dot="bg-ink-900"
              label="Pick up"
              value={job.pickup}
              sub="Loading help may be needed"
            />
            <Stop dot="bg-brand-400" label="Drop off" value={job.dropoff} />
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">
            Customer notes
          </p>
          <p className="text-sm text-ink-700 leading-relaxed">{job.description}</p>
        </Card>

        {job.type === "errand" && job.items ? (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Shopping list
              </p>
              <Badge tone="green">
                Budget {money(job.shoppingBudget ?? 0)} pre-funded
              </Badge>
            </div>
            <ul className="space-y-1.5">
              {job.items.map((it) => (
                <li key={it.name} className="flex justify-between text-sm">
                  <span className="text-ink-600">{it.name}</span>
                  <span className="text-ink-400">×{it.qty}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-ink-400 mt-3 leading-relaxed">
              The customer&apos;s budget is already held by RushBox. Buy the
              items, upload the receipt, and you&apos;re reimbursed plus your fee
              on delivery — you never pay out of pocket.
            </p>
          </Card>
        ) : null}

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Your bid
            </p>
            <span className="text-xs text-ink-400">
              Customer offered {money(job.offer)}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setBid((b) => Math.max(1, b - 1))}
              aria-label="Lower bid"
              className="w-11 h-11 rounded-xl border border-ink-200 flex items-center justify-center active:scale-95 transition"
            >
              <Icon name="minus" strokeWidth={2.4} />
            </button>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-2xl font-bold text-ink-400">$</span>
              <input
                type="number"
                min={1}
                value={bid}
                onChange={(e) => setBid(Math.max(1, Number(e.target.value)))}
                aria-label="Your bid"
                className="w-24 text-4xl font-bold text-center outline-none tabular-nums"
              />
            </div>
            <button
              onClick={() => setBid((b) => b + 1)}
              aria-label="Raise bid"
              className="w-11 h-11 rounded-xl border border-ink-200 flex items-center justify-center active:scale-95 transition"
            >
              <Icon name="plus" strokeWidth={2.4} />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            {[job.offer, job.offer + 3, job.offer + 6].map((p) => (
              <button
                key={p}
                onClick={() => setBid(p)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition ${
                  bid === p
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-ink-200 text-ink-600 hover:bg-ink-50"
                }`}
              >
                {money(p)}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-ink-100 space-y-1 text-sm">
            <div className="flex justify-between text-ink-500">
              <span>RushBox commission ({commission}%)</span>
              <span>−{money(bid - payout)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>You keep</span>
              <span className="text-emerald-600">{money(payout)}</span>
            </div>
          </div>
        </Card>
      </main>

      <div className="fixed bottom-[68px] inset-x-0 z-40 mx-auto max-w-[520px] px-4">
        {verified ? (
          <Button
            onClick={() => {
              setSent(true);
              setTimeout(() => router.push("/driver"), 1000);
            }}
            disabled={sent}
            variant="primary"
            size="lg"
            full
          >
            {sent ? "Bid sent ✓" : `Send bid · ${money(bid)}`}
          </Button>
        ) : (
          <Button href="/driver/onboarding" variant="dark" size="lg" full>
            <Icon name="shield" className="w-4 h-4" />
            {verification?.status === "pending"
              ? "Bidding opens once you're verified"
              : "Get verified to bid"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Stop({
  dot,
  label,
  value,
  sub,
}: {
  dot: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex gap-3">
      <span className={`w-2.5 h-2.5 rounded-full ${dot} shrink-0 mt-1.5`} />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide font-semibold text-ink-400">
          {label}
        </p>
        <p className="text-sm font-medium">{value}</p>
        {sub ? <p className="text-[11px] text-ink-400 mt-0.5">{sub}</p> : null}
      </div>
    </div>
  );
}
