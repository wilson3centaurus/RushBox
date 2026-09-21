"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Field,
  TopBar,
  inputClass,
  inputCompact,
} from "@/components/ui";
import { Icon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import { AREAS, SHOPS, VEHICLES } from "@/lib/mock/data";
import { Emoji } from "@/components/Emoji";
import type { ErrandItem, JobType, VehicleType } from "@/lib/types";

const COPY: Record<JobType, { title: string; sub: string; cta: string }> = {
  cargo: {
    title: "Move cargo",
    sub: "Pallets, furniture, building material",
    cta: "Get offers from drivers",
  },
  parcel: {
    title: "Send a parcel",
    sub: "Documents and small packages",
    cta: "Get offers from couriers",
  },
  errand: {
    title: "Buy for me",
    sub: "A runner buys it and brings it to you",
    cta: "Get offers from runners",
  },
};

const BASE_PRICE: Record<VehicleType, number> = {
  bike: 4,
  car: 7,
  van: 15,
  bakkie: 20,
  truck: 35,
};

const DEFAULT_VEHICLE: Record<JobType, VehicleType> = {
  cargo: "bakkie",
  parcel: "bike",
  errand: "car",
};

export default function NewJob({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: raw } = use(params);
  const type = (["cargo", "parcel", "errand"].includes(raw) ? raw : "cargo") as JobType;
  const router = useRouter();
  const { postJob } = useStore();

  const [pickup, setPickup] = useState(type === "errand" ? SHOPS[0] : "");
  const [dropoff, setDropoff] = useState("");
  const [description, setDescription] = useState("");
  const [vehicle, setVehicle] = useState<VehicleType>(DEFAULT_VEHICLE[type]);
  const [offer, setOffer] = useState(BASE_PRICE[DEFAULT_VEHICLE[type]]);
  const [budget, setBudget] = useState(50);
  const [items, setItems] = useState<ErrandItem[]>([{ name: "", qty: 1 }]);
  const [recipient, setRecipient] = useState("");
  const [photos, setPhotos] = useState(0);
  const [busy, setBusy] = useState(false);

  const suggested = useMemo(() => {
    const base = BASE_PRICE[vehicle];
    return { low: Math.round(base * 0.9), high: Math.round(base * 1.35) };
  }, [vehicle]);

  function pickVehicle(v: VehicleType) {
    setVehicle(v);
    setOffer(BASE_PRICE[v]);
  }

  const filledItems = items.filter((i) => i.name.trim());
  const valid =
    pickup.trim() &&
    dropoff.trim() &&
    offer > 0 &&
    (type !== "errand" || filledItems.length > 0);

  function submit() {
    if (!valid) return;
    setBusy(true);
    const job = postJob({
      type,
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
      description:
        description.trim() ||
        (type === "errand" ? "Buy the items on the list." : "No extra notes."),
      vehicle,
      offer,
      ...(type === "errand"
        ? { shop: pickup.trim(), items: filledItems, shoppingBudget: budget }
        : {}),
    });
    router.replace(`/move/${job.id}`);
  }

  return (
    <div>
      <TopBar title={COPY[type].title} subtitle={COPY[type].sub} back="/move" />

      <main className="px-5 py-5 space-y-4 pb-36">
        <Card className="p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            {type === "errand" ? "Shop & delivery" : "Route"}
          </p>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-ink-900" />
            <input
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              list={type === "errand" ? "shops" : "areas"}
              placeholder={
                type === "errand" ? "Which shop? e.g. Electrosales, Msasa" : "Pickup location"
              }
              className={`${inputClass} pl-9`}
            />
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-400" />
            <input
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              list="areas"
              placeholder="Drop-off address"
              className={`${inputClass} pl-9`}
            />
          </div>

          <datalist id="areas">
            {AREAS.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
          <datalist id="shops">
            {SHOPS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Card>

        {type === "errand" ? (
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                Shopping list
              </p>
              <button
                onClick={() => setItems((i) => [...i, { name: "", qty: 1 }])}
                className="text-xs font-semibold text-brand-600 flex items-center gap-1"
              >
                <Icon name="plus" className="w-3.5 h-3.5" strokeWidth={2.5} />
                Add item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={item.name}
                    onChange={(e) =>
                      setItems((list) =>
                        list.map((it, idx) =>
                          idx === i ? { ...it, name: e.target.value } : it,
                        ),
                      )
                    }
                    placeholder="e.g. Cement 50kg"
                    className={`${inputCompact} flex-1 min-w-0`}
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) =>
                      setItems((list) =>
                        list.map((it, idx) =>
                          idx === i
                            ? { ...it, qty: Math.max(1, Number(e.target.value)) }
                            : it,
                        ),
                      )
                    }
                    aria-label={`Quantity for item ${i + 1}`}
                    className={`${inputCompact} w-16 shrink-0 text-center`}
                  />
                  {items.length > 1 ? (
                    <button
                      onClick={() =>
                        setItems((list) => list.filter((_, idx) => idx !== i))
                      }
                      aria-label={`Remove item ${i + 1}`}
                      className="w-10 shrink-0 rounded-xl border border-ink-200 text-ink-400 flex items-center justify-center hover:bg-ink-50"
                    >
                      <Icon name="close" className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            <Field
              label="Shopping budget"
              hint="Held in your RushBox wallet and released to the runner against the receipt."
            >
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 font-semibold">
                  $
                </span>
                <input
                  type="number"
                  min={1}
                  value={budget}
                  onChange={(e) => setBudget(Math.max(1, Number(e.target.value)))}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </Field>
          </Card>
        ) : null}

        <Card className="p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            {type === "errand" ? "Notes for the runner" : "What are you moving?"}
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={
              type === "cargo"
                ? "e.g. 6 wood pallets and a box of fittings. Need help loading."
                : type === "parcel"
                  ? "e.g. A4 envelope with documents. Hand to reception."
                  : "e.g. Keep the receipt, call me if a size is out of stock."
            }
            className={`${inputClass} resize-none`}
          />

          {type === "parcel" ? (
            <Field label="Recipient">
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Name and phone number"
                className={inputClass}
              />
            </Field>
          ) : null}

          {type === "cargo" ? (
            <button
              onClick={() => setPhotos((p) => Math.min(p + 1, 3))}
              className="w-full flex items-center gap-3 rounded-xl border border-dashed border-ink-300 p-3 text-left hover:bg-ink-50"
            >
              <span className="w-10 h-10 rounded-lg bg-ink-100 text-ink-500 flex items-center justify-center shrink-0">
                <Icon name="camera" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink-700">
                  {photos ? `${photos} photo${photos === 1 ? "" : "s"} added` : "Add photos"}
                </span>
                <span className="block text-[11px] text-ink-400">
                  Drivers bid more accurately when they can see the load
                </span>
              </span>
            </button>
          ) : null}
        </Card>

        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-3">
            Vehicle needed
          </p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
            {VEHICLES.map((v) => (
              <button
                key={v.id}
                onClick={() => pickVehicle(v.id)}
                className={`shrink-0 w-28 rounded-xl border p-3 text-left transition ${
                  vehicle === v.id
                    ? "border-brand-400 bg-brand-50"
                    : "border-ink-200 hover:bg-ink-50"
                }`}
              >
                <Emoji char={v.emoji} className="w-7 h-7" />
                <p className="text-xs font-semibold mt-1.5">{v.label}</p>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-ink-500 mt-2.5">
            {VEHICLES.find((v) => v.id === vehicle)?.capacity}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Your offer
          </p>
          <p className="text-[11px] text-ink-500 mt-1">
            Name your price. Drivers can accept it or counter with their own.
          </p>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setOffer((o) => Math.max(1, o - 1))}
              aria-label="Lower offer"
              className="w-11 h-11 rounded-xl border border-ink-200 flex items-center justify-center active:scale-95 transition"
            >
              <Icon name="minus" strokeWidth={2.4} />
            </button>
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center">
                <span className="text-2xl font-bold text-ink-400">$</span>
                <input
                  type="number"
                  min={1}
                  value={offer}
                  onChange={(e) => setOffer(Math.max(1, Number(e.target.value)))}
                  aria-label="Your offer"
                  className="w-24 text-4xl font-bold text-center outline-none tabular-nums"
                />
              </div>
            </div>
            <button
              onClick={() => setOffer((o) => o + 1)}
              aria-label="Raise offer"
              className="w-11 h-11 rounded-xl border border-ink-200 flex items-center justify-center active:scale-95 transition"
            >
              <Icon name="plus" strokeWidth={2.4} />
            </button>
          </div>

          <div className="mt-3 rounded-xl bg-ink-50 px-3 py-2.5 flex items-center gap-2">
            <Icon name="zap" className="w-4 h-4 text-brand-500 shrink-0" />
            <p className="text-[11px] text-ink-600">
              Most {VEHICLES.find((v) => v.id === vehicle)?.label.toLowerCase()}{" "}
              drivers accept{" "}
              <span className="font-semibold">
                {money(suggested.low)}–{money(suggested.high)}
              </span>{" "}
              on this route
            </p>
          </div>

          {type === "errand" ? (
            <div className="mt-3 flex justify-between text-sm border-t border-ink-100 pt-3">
              <span className="text-ink-500">
                Budget {money(budget)} + service {money(offer)}
              </span>
              <span className="font-bold">{money(budget + offer)}</span>
            </div>
          ) : null}
        </Card>
      </main>

      <div className="fixed bottom-[68px] inset-x-0 z-40 mx-auto max-w-[520px] px-4">
        <Button
          onClick={submit}
          disabled={!valid || busy}
          variant="primary"
          size="lg"
          full
        >
          {busy ? "Posting…" : COPY[type].cta}
        </Button>
      </div>
    </div>
  );
}
