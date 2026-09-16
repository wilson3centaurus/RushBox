"use client";

import { useState } from "react";
import { Badge, Button, Card, Field, TopBar, inputClass } from "@/components/ui";
import { Icon } from "@/components/icons";
import { VEHICLES } from "@/lib/mock/data";
import type { VehicleType } from "@/lib/types";

const DOCS = [
  { id: "id", label: "National ID", sub: "Front and back", done: true },
  { id: "licence", label: "Driver's licence", sub: "Valid, not expired", done: true },
  { id: "reg", label: "Vehicle registration book", sub: "In your name or with an affidavit", done: false },
  { id: "insurance", label: "Insurance certificate", sub: "Third party minimum", done: false },
  { id: "photo", label: "Photo of your vehicle", sub: "Clear shot showing the plate", done: false },
];

export default function Onboarding() {
  const [vehicle, setVehicle] = useState<VehicleType>("bakkie");
  const [docs, setDocs] = useState(DOCS);
  const uploaded = docs.filter((d) => d.done).length;
  const complete = uploaded === docs.length;

  return (
    <div>
      <TopBar title="Get verified" subtitle="Required before you can bid" />

      <main className="px-5 py-5 space-y-4 pb-32">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">
              {uploaded} of {docs.length} documents
            </p>
            <Badge tone={complete ? "green" : "amber"}>
              {complete ? "Ready to review" : "In progress"}
            </Badge>
          </div>
          <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
            <div
              className="h-full bg-brand-400 transition-all"
              style={{ width: `${(uploaded / docs.length) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-ink-400 mt-2">
            Most transporters are approved within 24 hours.
          </p>
        </Card>

        <Card className="p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            About you
          </p>
          <Field label="Full name">
            <input defaultValue="Tendai Moyo" className={inputClass} />
          </Field>
          <Field label="Phone number">
            <input defaultValue="+263 77 234 5566" className={inputClass} />
          </Field>
          <Field label="Base area" hint="Where you usually start your day">
            <input defaultValue="Msasa, Harare" className={inputClass} />
          </Field>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-3">
            Your vehicle
          </p>
          <div className="grid grid-cols-3 gap-2">
            {VEHICLES.map((v) => (
              <button
                key={v.id}
                onClick={() => setVehicle(v.id)}
                className={`rounded-xl border p-3 text-center transition ${
                  vehicle === v.id
                    ? "border-brand-400 bg-brand-50"
                    : "border-ink-200 hover:bg-ink-50"
                }`}
              >
                <span className="text-2xl">{v.emoji}</span>
                <p className="text-[11px] font-semibold mt-1">{v.label}</p>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-ink-500 mt-3">
            {VEHICLES.find((v) => v.id === vehicle)?.capacity}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-3">
            Documents
          </p>
          <div className="space-y-2">
            {docs.map((d) => (
              <button
                key={d.id}
                onClick={() =>
                  setDocs((list) =>
                    list.map((x) => (x.id === d.id ? { ...x, done: true } : x)),
                  )
                }
                className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                  d.done
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-dashed border-ink-300 hover:bg-ink-50"
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    d.done
                      ? "bg-emerald-500 text-white"
                      : "bg-ink-100 text-ink-400"
                  }`}
                >
                  <Icon
                    name={d.done ? "check" : "camera"}
                    className="w-4 h-4"
                    strokeWidth={d.done ? 3 : 1.7}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{d.label}</span>
                  <span className="block text-[11px] text-ink-400">{d.sub}</span>
                </span>
                <span className="text-[11px] font-semibold text-ink-400 shrink-0">
                  {d.done ? "Uploaded" : "Upload"}
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-ink-50 border-ink-200">
          <div className="flex gap-3">
            <Icon name="shield" className="w-5 h-5 text-ink-500 shrink-0" />
            <p className="text-xs text-ink-600 leading-relaxed">
              Verification protects customers and keeps prices fair. Unverified
              transporters can browse jobs but cannot place bids.
            </p>
          </div>
        </Card>
      </main>

      <div className="fixed bottom-[68px] inset-x-0 z-40 mx-auto max-w-[520px] px-4">
        <Button disabled={!complete} variant="primary" size="lg" full>
          {complete ? "Submit for review" : `Upload ${docs.length - uploaded} more`}
        </Button>
      </div>
    </div>
  );
}
