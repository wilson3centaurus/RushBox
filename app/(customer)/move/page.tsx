"use client";

import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { money, statusLabel } from "@/lib/format";
import { TimeAgo } from "@/components/TimeAgo";
import { vehicleById } from "@/lib/mock/data";
import { Emoji } from "@/components/Emoji";
import type { JobStatus, JobType } from "@/lib/types";

const TYPES: {
  type: JobType;
  emoji: string;
  title: string;
  body: string;
}[] = [
  {
    type: "cargo",
    emoji: "📦",
    title: "Cargo & goods",
    body: "Building material, furniture, pallets, bulk loads",
  },
  {
    type: "parcel",
    emoji: "✉️",
    title: "Send a parcel",
    body: "Documents, small packages, same-day across town",
  },
  {
    type: "errand",
    emoji: "🧾",
    title: "Buy for me",
    body: "Tell us the shop and the list — a runner buys and delivers",
  },
];

const TONE: Record<JobStatus, "brand" | "green" | "grey" | "red" | "blue"> = {
  collecting_bids: "brand",
  assigned: "blue",
  in_transit: "blue",
  delivered: "green",
  cancelled: "red",
};

export default function Move() {
  const { jobs } = useStore();
  const active = jobs.filter(
    (j) => j.status !== "delivered" && j.status !== "cancelled",
  );
  const past = jobs.filter(
    (j) => j.status === "delivered" || j.status === "cancelled",
  );

  return (
    <div>
      <div className="brand-gradient text-white px-5 pt-6 pb-8 safe-top rounded-b-3xl">
        <h1 className="text-2xl font-bold">Move anything</h1>
        <p className="text-white/70 text-sm mt-1.5 leading-snug">
          Post what you need moved. Drivers nearby send you offers. You pick the
          price that&apos;s fair.
        </p>
      </div>

      <main className="px-5 -mt-4 space-y-6 py-5">
        <div className="space-y-3">
          {TYPES.map((t) => (
            <Link key={t.type} href={`/move/new/${t.type}`}>
              <Card className="p-4 flex items-center gap-3.5">
                <span className="w-12 h-12 rounded-2xl bg-ink-50 flex items-center justify-center shrink-0">
                  <Emoji char={t.emoji} className="w-7 h-7" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm">{t.title}</p>
                  <p className="text-xs text-ink-500 mt-0.5 leading-snug">
                    {t.body}
                  </p>
                </div>
                <Icon name="chevron" className="w-4 h-4 text-ink-300 shrink-0" />
              </Card>
            </Link>
          ))}
        </div>

        {active.length ? (
          <section>
            <h2 className="font-semibold mb-3">Active</h2>
            <div className="space-y-2">
              {active.map((j) => (
                <JobRow key={j.id} jobId={j.id} />
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="font-semibold mb-3">Past trips</h2>
          {past.length ? (
            <div className="space-y-2">
              {past.map((j) => (
                <JobRow key={j.id} jobId={j.id} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="truck"
              title="No trips yet"
              body="Your completed moves and errands will be listed here."
            />
          )}
        </section>
      </main>
    </div>
  );
}

function JobRow({ jobId }: { jobId: string }) {
  const { jobs } = useStore();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return null;

  const meta = TYPES.find((t) => t.type === job.type);
  const accepted = job.bids.find((b) => b.id === job.acceptedBidId);
  const price = accepted?.price ?? job.offer;

  return (
    <Link href={`/move/${job.id}`}>
      <Card className="p-4">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center shrink-0">
            <Emoji char={meta?.emoji ?? ""} className="w-6 h-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold">{meta?.title}</p>
              <Badge tone={TONE[job.status]}>
                {job.status === "collecting_bids"
                  ? `${job.bids.length} offer${job.bids.length === 1 ? "" : "s"}`
                  : statusLabel(job.status)}
              </Badge>
            </div>
            <div className="mt-2 space-y-1">
              <Leg dot="bg-ink-900" text={job.pickup} />
              <Leg dot="bg-brand-400" text={job.dropoff} />
            </div>
            <p className="text-[11px] text-ink-400 mt-2">
              {vehicleById(job.vehicle)?.label} · <TimeAgo iso={job.createdAt} />
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold">{money(price)}</p>
            {accepted ? (
              <p className="text-[10px] text-ink-400">agreed</p>
            ) : (
              <p className="text-[10px] text-ink-400">your offer</p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function Leg({ dot, text }: { dot: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
      <span className="text-xs text-ink-600 truncate">{text}</span>
    </div>
  );
}
