"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Rating,
  TopBar,
} from "@/components/ui";
import { Icon } from "@/components/icons";
import { MapView, Timeline } from "@/components/MapView";
import { useStore } from "@/lib/store";
import { etaLabel, money, statusLabel } from "@/lib/format";
import { TimeAgo } from "@/components/TimeAgo";
import { vehicleById } from "@/lib/mock/data";
import type { Bid, MoveJob } from "@/lib/types";

export default function JobDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { jobs } = useStore();
  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div>
        <TopBar title="Trip" back="/move" />
        <EmptyState
          icon="truck"
          title="Trip not found"
          body="We couldn't find that trip on this device."
          action={<Button href="/move">All trips</Button>}
        />
      </div>
    );
  }

  if (job.status === "collecting_bids") return <Bidding job={job} />;
  return <Tracking job={job} />;
}

function Bidding({ job }: { job: MoveJob }) {
  const { acceptBid, cancelJob } = useStore();
  const router = useRouter();
  const sorted = [...job.bids].sort((a, b) => a.price - b.price);
  const best = sorted[0]?.id;

  return (
    <div>
      <TopBar
        title="Choosing a driver"
        subtitle={`${job.bids.length} offer${job.bids.length === 1 ? "" : "s"} so far`}
        back="/move"
      />

      <main className="px-5 py-5 space-y-4 pb-36">
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <Leg dot="bg-ink-900" text={job.pickup} />
              <Leg dot="bg-brand-400" text={job.dropoff} />
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-ink-400 uppercase tracking-wide font-semibold">
                Your offer
              </p>
              <p className="text-lg font-bold">{money(job.offer)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-ink-100 text-xs text-ink-500">
            <Badge tone="grey">{vehicleById(job.vehicle)?.label}</Badge>
            <span>Posted <TimeAgo iso={job.createdAt} /></span>
          </div>
        </Card>

        {job.type === "errand" && job.items ? (
          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2.5">
              Shopping list · budget {money(job.shoppingBudget ?? 0)}
            </p>
            <ul className="space-y-1.5">
              {job.items.map((it) => (
                <li key={it.name} className="flex justify-between text-sm">
                  <span className="text-ink-600">{it.name}</span>
                  <span className="text-ink-400">×{it.qty}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <div className="flex items-center gap-3 px-1">
          <span className="relative flex w-9 h-9 items-center justify-center shrink-0">
            <span className="absolute inset-0 rounded-full bg-brand-400 animate-pulse-ring" />
            <span className="relative w-9 h-9 rounded-full bg-brand-400 text-ink-900 flex items-center justify-center">
              <Icon name="zap" className="w-4 h-4" />
            </span>
          </span>
          <div>
            <p className="text-sm font-semibold">Finding drivers nearby</p>
            <p className="text-xs text-ink-500">
              Offers come in over the next few minutes
            </p>
          </div>
        </div>

        {sorted.length ? (
          <div className="space-y-2.5">
            {sorted.map((bid) => (
              <BidCard
                key={bid.id}
                bid={bid}
                cheapest={bid.id === best}
                offer={job.offer}
                onAccept={() => {
                  acceptBid(job.id, bid.id);
                  router.refresh();
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="flex justify-center gap-1.5 mb-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-brand-300 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <p className="text-sm font-medium text-ink-700">
              Waiting for offers…
            </p>
            <p className="text-xs text-ink-400 mt-1">
              We&apos;ve notified drivers with a{" "}
              {vehicleById(job.vehicle)?.label.toLowerCase()} near {job.pickup}
            </p>
          </Card>
        )}
      </main>

      <div className="fixed bottom-[68px] inset-x-0 z-40 mx-auto max-w-[520px] px-4">
        <Button
          onClick={() => {
            cancelJob(job.id);
            router.push("/move");
          }}
          variant="outline"
          size="lg"
          full
        >
          Cancel request
        </Button>
      </div>
    </div>
  );
}

function BidCard({
  bid,
  cheapest,
  offer,
  onAccept,
}: {
  bid: Bid;
  cheapest: boolean;
  offer: number;
  onAccept: () => void;
}) {
  const diff = bid.price - offer;
  return (
    <Card
      className={`p-4 animate-fade-up ${cheapest ? "border-brand-300 bg-brand-50/50" : ""}`}
    >
      <div className="flex items-start gap-3">
        <Avatar initials={bid.initials} className="w-11 h-11" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold truncate">{bid.name}</p>
            {cheapest ? <Badge tone="brand">Best price</Badge> : null}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-ink-500">
            <Rating value={bid.rating} />
            <span>·</span>
            <span>{bid.trips} trips</span>
          </div>
          <p className="text-xs text-ink-500 mt-1">
            {bid.vehicleLabel} · {bid.distanceKm} km away
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-bold leading-none">{money(bid.price)}</p>
          <p
            className={`text-[10px] mt-1 font-medium ${diff > 0 ? "text-ink-400" : "text-emerald-600"}`}
          >
            {diff === 0
              ? "matches your offer"
              : diff > 0
                ? `${money(diff)} above`
                : `${money(-diff)} below`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3.5">
        <span className="flex items-center gap-1 text-xs text-ink-500 mr-auto">
          <Icon name="clock" className="w-3.5 h-3.5" />
          Picks up in {etaLabel(bid.etaMins)}
        </span>
        <button className="px-3 py-2 rounded-lg border border-ink-200 text-xs font-semibold text-ink-600 hover:bg-ink-50">
          Counter
        </button>
        <Button onClick={onAccept} variant="dark" size="sm">
          Accept
        </Button>
      </div>
    </Card>
  );
}

function Tracking({ job }: { job: MoveJob }) {
  const accepted = job.bids.find((b) => b.id === job.acceptedBidId);
  const done = job.status === "delivered";
  const steps =
    job.type === "errand"
      ? [
          { label: "Runner assigned", sub: accepted?.name },
          { label: "At the shop", sub: job.shop },
          { label: "Items bought", sub: "Receipt uploaded" },
          { label: "Delivered", sub: job.dropoff },
        ]
      : [
          { label: "Driver assigned", sub: accepted?.name },
          { label: "Heading to pickup", sub: job.pickup },
          { label: "Load collected", sub: "On the way" },
          { label: "Delivered", sub: job.dropoff },
        ];
  const step = done ? 3 : job.status === "in_transit" ? 2 : 1;

  return (
    <div>
      <TopBar
        title={done ? "Trip complete" : "On the way"}
        subtitle={statusLabel(job.status)}
        back="/move"
      />

      <main className="pb-6">
        {!done ? (
          <MapView from={job.pickup} to={job.dropoff} progress={step / 3} />
        ) : null}

        <div className="px-5 py-5 space-y-4">
          {accepted ? (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Avatar initials={accepted.initials} className="w-12 h-12" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{accepted.name}</p>
                  <div className="flex items-center gap-2 text-xs text-ink-500 mt-0.5">
                    <Rating value={accepted.rating} />
                    <span>·</span>
                    <span className="truncate">{accepted.vehicleLabel}</span>
                  </div>
                </div>
                {!done ? (
                  <>
                    <button
                      aria-label="Call driver"
                      className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"
                    >
                      <Icon name="phone" className="w-[18px] h-[18px]" />
                    </button>
                    <button
                      aria-label="Message driver"
                      className="w-10 h-10 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center shrink-0"
                    >
                      <Icon name="chat" className="w-[18px] h-[18px]" />
                    </button>
                  </>
                ) : null}
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-ink-100">
                <span className="text-sm text-ink-500">Agreed price</span>
                <span className="text-lg font-bold">{money(accepted.price)}</span>
              </div>
            </Card>
          ) : null}

          <Card className="p-4">
            <h2 className="font-semibold text-sm mb-4">Progress</h2>
            <Timeline steps={steps} current={step} />
          </Card>

          {job.type === "errand" && job.items ? (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm">Shopping list</h2>
                {done ? <Badge tone="green">Receipt uploaded</Badge> : null}
              </div>
              <ul className="space-y-2">
                {job.items.map((it) => (
                  <li key={it.name} className="flex items-center gap-2 text-sm">
                    <Icon
                      name="check"
                      className={`w-4 h-4 shrink-0 ${done ? "text-emerald-500" : "text-ink-300"}`}
                      strokeWidth={2.5}
                    />
                    <span className="flex-1 text-ink-600">{it.name}</span>
                    <span className="text-ink-400 text-xs">×{it.qty}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-ink-100 space-y-1 text-sm">
                <div className="flex justify-between text-ink-500">
                  <span>Shopping budget held</span>
                  <span>{money(job.shoppingBudget ?? 0)}</span>
                </div>
                <div className="flex justify-between text-ink-500">
                  <span>Runner fee</span>
                  <span>{money(accepted?.price ?? job.offer)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span>Total</span>
                  <span>
                    {money((job.shoppingBudget ?? 0) + (accepted?.price ?? job.offer))}
                  </span>
                </div>
              </div>
            </Card>
          ) : null}

          {done ? (
            <Card className="p-4">
              <h2 className="font-semibold text-sm">Rate this trip</h2>
              <div className="flex gap-2 mt-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    aria-label={`Rate ${n} stars`}
                    className="flex-1 aspect-square rounded-xl border border-ink-200 flex items-center justify-center text-ink-300 hover:text-brand-400 hover:border-brand-300 transition"
                  >
                    <Icon name="star" className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </Card>
          ) : (
            <Button variant="outline" full href="/support">
              <Icon name="shield" className="w-4 h-4" />
              Report a problem
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

function Leg({ dot, text }: { dot: string; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
      <span className="text-sm text-ink-700 truncate">{text}</span>
    </div>
  );
}
