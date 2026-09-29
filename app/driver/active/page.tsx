"use client";

import { useState } from "react";
import { Avatar, Badge, Button, Card, TopBar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { MapView, Timeline } from "@/components/MapView";
import { money } from "@/lib/format";

const STEPS = [
  { label: "Heading to pickup", sub: "Electrosales Hardware, Msasa" },
  { label: "Load collected", sub: "Confirm with the customer" },
  { label: "In transit", sub: "On the way to drop-off" },
  { label: "Delivered", sub: "Subway City, Harare" },
];

const ACTIONS = [
  "I've arrived at pickup",
  "Load collected — start trip",
  "Mark as delivered",
  "Trip complete",
];

export default function DriverActive() {
  const [step, setStep] = useState(0);
  const done = step >= 3;

  return (
    <div>
      <TopBar title="Active job" subtitle="RB-J1 · Cargo" />

      <MapView
        from="Electrosales Hardware, Msasa"
        to="Subway City, Harare"
        progress={step / 3}
      />

      <main className="px-5 py-5 space-y-4 pb-36">
        <Card className="p-4 flex items-center gap-3">
          <Avatar initials="WS" className="w-11 h-11" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Wilson Sedze</p>
            <p className="text-xs text-ink-500">Customer</p>
          </div>
          <button
            aria-label="Call customer"
            className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"
          >
            <Icon name="phone" className="w-[18px] h-[18px]" />
          </button>
          <button
            aria-label="Message customer"
            className="w-10 h-10 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center shrink-0"
          >
            <Icon name="chat" className="w-[18px] h-[18px]" />
          </button>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-500">Agreed price</span>
            <span className="text-xl font-bold">{money(20)}</span>
          </div>
          <div className="flex items-center justify-between mt-1.5 pt-3 border-t border-ink-100">
            <span className="text-sm text-ink-500">You keep</span>
            <span className="font-semibold text-emerald-600">{money(17)}</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm">Progress</h2>
            {done ? <Badge tone="green">Complete</Badge> : null}
          </div>
          <Timeline steps={STEPS} current={step} />
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold text-sm mb-3">Navigation</h2>
          <Button variant="outline" full>
            <Icon name="pin" className="w-4 h-4" />
            Open in Google Maps
          </Button>
        </Card>
      </main>

      <div className="fixed bottom-[68px] inset-x-0 z-40 mx-auto max-w-[520px] px-4">
        <Button
          onClick={() => setStep((s) => Math.min(s + 1, 3))}
          disabled={done}
          variant={done ? "outline" : "primary"}
          size="lg"
          full
        >
          {ACTIONS[step]}
        </Button>
      </div>
    </div>
  );
}
