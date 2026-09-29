"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Card, EmptyState, Stat } from "@/components/ui";
import { Icon } from "@/components/icons";
import { money } from "@/lib/format";
import { TimeAgo } from "@/components/TimeAgo";
import { OPEN_JOB_FEED, vehicleById } from "@/lib/mock/data";
import { Emoji } from "@/components/Emoji";
import type { JobType } from "@/lib/types";

const TYPE_META: Record<JobType, { emoji: string; label: string }> = {
  cargo: { emoji: "📦", label: "Cargo" },
  parcel: { emoji: "✉️", label: "Parcel" },
  errand: { emoji: "🧾", label: "Buy for me" },
};

const FILTERS = ["All", "Cargo", "Parcel", "Buy for me"];

export default function DriverFeed() {
  const [online, setOnline] = useState(true);
  const [filter, setFilter] = useState("All");

  const jobs = OPEN_JOB_FEED.filter((j) =>
    filter === "All" ? true : TYPE_META[j.type].label === filter,
  );

  return (
    <div>
      <header className="bg-ink-900 text-white px-5 pt-5 pb-6 safe-top">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">
              Tendai Moyo
            </p>
            <p className="font-semibold">Toyota Hilux · 🛻 Bakkie</p>
          </div>
          <button
            onClick={() => setOnline((o) => !o)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold transition ${
              online ? "bg-emerald-500 text-white" : "bg-white/10 text-white/60"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${online ? "bg-white" : "bg-white/40"}`}
            />
            {online ? "ONLINE" : "OFFLINE"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <MiniStat label="Today" value={money(64)} />
          <MiniStat label="Trips" value="4" />
          <MiniStat label="Rating" value="4.8" />
        </div>
      </header>

      <main className="px-5 py-5 space-y-4">
        {!online ? (
          <Card className="p-4 flex items-center gap-3 bg-amber-50 border-amber-200">
            <Icon name="bell" className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-900">
              You&apos;re offline — go online to see jobs near you.
            </p>
          </Card>
        ) : null}

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                filter === f
                  ? "bg-ink-900 text-white"
                  : "bg-ink-100 text-ink-600 hover:bg-ink-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-1">
          <h2 className="font-semibold">Jobs near you</h2>
          <span className="text-xs text-ink-400">{jobs.length} open</span>
        </div>

        {online && jobs.length ? (
          <div className="space-y-2.5">
            {jobs.map((job) => {
              const meta = TYPE_META[job.type];
              return (
                <Link key={job.id} href={`/driver/jobs/${job.id}`}>
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center shrink-0">
                        <Emoji char={meta.emoji} className="w-6 h-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold">{meta.label}</p>
                          <Badge tone="grey">
                            {vehicleById(job.vehicle)?.label}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          <Leg dot="bg-ink-900" text={job.pickup} />
                          <Leg dot="bg-brand-400" text={job.dropoff} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold leading-none">
                          {money(job.offer)}
                        </p>
                        <p className="text-[10px] text-ink-400 mt-1">offered</p>
                      </div>
                    </div>
                    <p className="text-xs text-ink-500 mt-3 line-clamp-1">
                      {job.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100">
                      <span className="text-[11px] text-ink-400">
                        Posted <TimeAgo iso={job.createdAt} />
                      </span>
                      <span className="text-xs font-semibold text-brand-600 flex items-center gap-1">
                        Place a bid
                        <Icon name="chevron" className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="zap"
            title={online ? "No jobs right now" : "You're offline"}
            body={
              online
                ? "New requests appear here the moment a customer posts one nearby."
                : "Go online to start receiving job requests near you."
            }
          />
        )}

        <Card className="p-4">
          <h2 className="font-semibold text-sm mb-3">This week</h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Earned" value={money(287)} icon="wallet" delta="+18%" />
            <Stat
              label="Jobs completed"
              value="19"
              icon="check"
              tone="green"
              delta="+4"
            />
          </div>
        </Card>
      </main>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 rounded-xl px-3 py-2.5">
      <p className="text-[10px] text-white/50 uppercase tracking-wide font-semibold">
        {label}
      </p>
      <p className="font-bold text-lg leading-tight mt-0.5">{value}</p>
    </div>
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
