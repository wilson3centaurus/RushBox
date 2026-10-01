"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Field, inputClass } from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import { PageHead } from "@/components/DashShell";
import { DeliveryBill } from "@/components/DeliveryBill";
import { Emoji } from "@/components/Emoji";
import { money } from "@/lib/format";
import { VEHICLES } from "@/lib/mock/data";
import { useStore } from "@/lib/store";
import {
  describeDelivery,
  hourLabel,
  quoteDelivery,
  type DeliverySettings,
  type PricingSettings,
} from "@/lib/pricing";

const HOURS = Array.from({ length: 24 }, (_, h) => h);

function problems(p: PricingSettings): string[] {
  const d = p.delivery;
  const out: string[] = [];
  const numbers = [
    d.baseFee, d.freeThreshold, d.minimumOrder, d.smallBasketThreshold, d.smallBasketFee,
    d.nightFee, d.includedKm, d.perKmFee, d.maxRadiusKm, p.move.commissionPct, p.move.errandFeePct,
  ];
  if (numbers.some((n) => !Number.isFinite(n) || n < 0)) out.push("Amounts cannot be negative or blank.");
  if (d.freeOverEnabled && d.freeThreshold <= d.minimumOrder)
    out.push("The free-delivery amount should be above the minimum order.");
  if (d.maxRadiusKm < d.includedKm) out.push("The delivery radius cannot be smaller than the included distance.");
  if (d.nightFeeEnabled && d.nightStart === d.nightEnd) out.push("The late-night window starts and ends at the same hour.");
  return out;
}

export default function AdminPricing() {
  const { pricing, pricingSource, savePricing, discardLocalPricing } = useStore();
  const [draft, setDraft] = useState<PricingSettings>(pricing);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Follow the stored settings until the admin starts editing.
  useEffect(() => {
    if (!touched) setDraft(pricing);
  }, [pricing, touched]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(pricing);
  const errors = problems(draft);

  const setDelivery = <K extends keyof DeliverySettings>(key: K, value: DeliverySettings[K]) => {
    setTouched(true);
    setMessage(null);
    setDraft((d) => ({ ...d, delivery: { ...d.delivery, [key]: value } }));
  };

  const setMove = (key: keyof PricingSettings["move"], value: number) => {
    setTouched(true);
    setMessage(null);
    setDraft((d) => ({ ...d, move: { ...d.move, [key]: value } }));
  };

  async function save() {
    setSaving(true);
    const result = await savePricing(draft);
    setSaving(false);
    setTouched(false);
    setMessage(
      result.published
        ? { ok: true, text: "Published. Every customer now sees these prices." }
        : { ok: false, text: result.reason },
    );
  }

  const d = draft.delivery;

  return (
    <div className="p-5 pb-24 lg:p-8">
      <PageHead
        title="Pricing & delivery"
        sub="What customers pay for delivery, and what RushBox keeps on Move jobs"
        action={
          <Button variant="primary" size="sm" onClick={save} disabled={!dirty || saving || errors.length > 0}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <SourceNote
        source={pricingSource}
        message={message}
        onDiscard={() => {
          discardLocalPricing();
          setTouched(false);
          setMessage(null);
        }}
      />

      {errors.length ? (
        <Card className="p-4 mb-4 bg-red-50 border-red-200">
          {errors.map((e) => (
            <p key={e} className="text-sm text-red-800">
              {e}
            </p>
          ))}
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_380px] items-start">
        <div className="grid gap-4 lg:grid-cols-2">
          <Section icon="truck" title="Delivery fee" tint="bg-sky-100 text-sky-700">
            <MoneyField label="Standard delivery fee" value={d.baseFee} onChange={(v) => setDelivery("baseFee", v)} step={0.25} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="Included distance" suffix="km" value={d.includedKm} onChange={(v) => setDelivery("includedKm", v)} />
              <MoneyField label="Each extra km" value={d.perKmFee} onChange={(v) => setDelivery("perKmFee", v)} step={0.05} />
            </div>
            <NumberField
              label="Delivery radius"
              suffix="km"
              hint="Addresses further than this from the store cannot order."
              value={d.maxRadiusKm}
              onChange={(v) => setDelivery("maxRadiusKm", v)}
            />
          </Section>

          <Section icon="tag" title="When delivery is free" tint="bg-emerald-100 text-emerald-700">
            <Toggle
              label="Free over a basket size"
              hint="Pushes customers to add a few more items."
              on={d.freeOverEnabled}
              onChange={(v) => setDelivery("freeOverEnabled", v)}
            >
              <MoneyField label="Free from" value={d.freeThreshold} onChange={(v) => setDelivery("freeThreshold", v)} />
            </Toggle>
            <Toggle
              label="Free on a customer's first order"
              hint="Pays for itself if they come back."
              on={d.firstOrderFree}
              onChange={(v) => setDelivery("firstOrderFree", v)}
            />
            <Toggle
              label="Free for everyone until a date"
              hint="Launch week, a holiday, a new area opening."
              on={d.promoFreeUntil !== null}
              onChange={(v) =>
                setDelivery("promoFreeUntil", v ? new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10) : null)
              }
            >
              <Field label="Last free day">
                <input
                  type="date"
                  value={d.promoFreeUntil ?? ""}
                  onChange={(e) => setDelivery("promoFreeUntil", e.target.value || null)}
                  className={inputClass}
                />
              </Field>
            </Toggle>
          </Section>

          <Section icon="bag" title="Small orders" tint="bg-amber-100 text-amber-700">
            <MoneyField
              label="Minimum order"
              hint="Below this, checkout is blocked."
              value={d.minimumOrder}
              onChange={(v) => setDelivery("minimumOrder", v)}
            />
            <div className="grid grid-cols-2 gap-3">
              <MoneyField label="Small basket under" value={d.smallBasketThreshold} onChange={(v) => setDelivery("smallBasketThreshold", v)} />
              <MoneyField label="Adds a fee of" value={d.smallBasketFee} onChange={(v) => setDelivery("smallBasketFee", v)} step={0.25} />
            </div>
          </Section>

          <Section icon="clock" title="Late-night fee" tint="bg-indigo-100 text-indigo-700">
            <Toggle
              label="Charge extra at night"
              hint="Riders working late are paid more. Applies even when delivery is free."
              on={d.nightFeeEnabled}
              onChange={(v) => setDelivery("nightFeeEnabled", v)}
            >
              <MoneyField label="Late-night fee" value={d.nightFee} onChange={(v) => setDelivery("nightFee", v)} step={0.25} />
              <div className="grid grid-cols-2 gap-3">
                <HourField label="From" value={d.nightStart} onChange={(v) => setDelivery("nightStart", v)} />
                <HourField label="Until" value={d.nightEnd} onChange={(v) => setDelivery("nightEnd", v)} />
              </div>
            </Toggle>
          </Section>

          <Section icon="truck" title="Move marketplace" tint="bg-brand-100 text-brand-700" wide>
            <div className="grid gap-4 lg:grid-cols-2">
              <Slider
                label="Platform commission"
                hint="Taken from the agreed price before the transporter is paid."
                value={draft.move.commissionPct}
                min={5}
                max={25}
                onChange={(v) => setMove("commissionPct", v)}
              />
              <Slider
                label="Buy-For-Me service fee"
                hint="Charged on top of the shopping budget."
                value={draft.move.errandFeePct}
                min={0}
                max={25}
                onChange={(v) => setMove("errandFeePct", v)}
              />
            </div>
            <div className="rounded-xl bg-ink-50 p-3.5 text-sm space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">
                On a {money(50)} job
              </p>
              <div className="flex justify-between text-ink-600">
                <span>Customer pays</span>
                <span className="font-medium">{money(50)}</span>
              </div>
              <div className="flex justify-between text-ink-600">
                <span>RushBox keeps</span>
                <span className="font-medium">{money((50 * draft.move.commissionPct) / 100)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1.5 border-t border-ink-200">
                <span>Transporter receives</span>
                <span className="text-emerald-600">{money(50 * (1 - draft.move.commissionPct / 100))}</span>
              </div>
            </div>
          </Section>

          <Card className="p-5 lg:col-span-2">
            <h2 className="font-semibold mb-1">Suggested price bands</h2>
            <p className="text-xs text-ink-500 mb-4">
              Shown to customers as &ldquo;most drivers accept $X–$Y&rdquo; when they set their offer.
            </p>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {VEHICLES.map((v) => (
                <div key={v.id} className="rounded-xl border border-ink-100 p-3.5">
                  <div className="flex items-center gap-2">
                    <Emoji char={v.emoji} className="w-6 h-6" />
                    <p className="text-sm font-semibold">{v.label}</p>
                  </div>
                  <p className="text-[11px] text-ink-400 mt-1.5 leading-tight">{v.capacity}</p>
                  <Badge tone="grey" className="mt-2.5">
                    {{ bike: "$3–6", car: "$6–10", van: "$13–21", bakkie: "$18–27", truck: "$31–48" }[v.id]}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Preview settings={d} />
      </div>

      {/* On a phone the Save button scrolls away; keep one in reach while there are changes. */}
      {dirty ? (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-ink-100 px-4 py-3 flex items-center gap-3">
          <p className="text-sm text-ink-600 flex-1">Unsaved changes</p>
          <Button variant="primary" size="sm" onClick={save} disabled={saving || errors.length > 0}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function SourceNote({
  source,
  message,
  onDiscard,
}: {
  source: "published" | "device" | "default";
  message: { ok: boolean; text: string } | null;
  onDiscard: () => void;
}) {
  if (message) {
    return (
      <Card className={`p-3.5 mb-4 flex items-start gap-3 ${message.ok ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
        <Icon name={message.ok ? "check" : "bell"} className={`w-5 h-5 shrink-0 ${message.ok ? "text-emerald-600" : "text-amber-600"}`} />
        <p className={`text-sm ${message.ok ? "text-emerald-900" : "text-amber-900"}`}>{message.text}</p>
      </Card>
    );
  }
  if (source === "device") {
    return (
      <Card className="p-3.5 mb-4 flex items-center gap-3 bg-amber-50 border-amber-200">
        <Icon name="bell" className="w-5 h-5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-900 flex-1">
          These prices are saved on this device only. Other customers still see the published ones.
        </p>
        <button onClick={onDiscard} className="text-xs font-semibold text-amber-800 underline shrink-0">
          Discard
        </button>
      </Card>
    );
  }
  return null;
}

/** What a customer would pay, for any basket, distance and time of day. */
function Preview({ settings }: { settings: DeliverySettings }) {
  const [basket, setBasket] = useState(12);
  const [km, setKm] = useState(2.4);
  const [hour, setHour] = useState(14);
  const [firstOrder, setFirstOrder] = useState(false);

  const quote = useMemo(() => {
    const now = new Date();
    now.setHours(hour, 0, 0, 0);
    return quoteDelivery(basket, settings, { now, distanceKm: km, isFirstOrder: firstOrder });
  }, [basket, km, hour, firstOrder, settings]);

  return (
    <Card className="p-5 xl:sticky xl:top-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon name="receipt" className="w-5 h-5 text-ink-500" />
        <h2 className="font-semibold">Try it</h2>
      </div>
      <p className="text-xs text-ink-500 mb-4">What a customer pays with these settings.</p>

      <div className="space-y-3">
        <Slider label="Basket" value={basket} min={0} max={40} step={0.5} format={money} onChange={setBasket} />
        <Slider label="Distance from store" value={km} min={0} max={10} step={0.1} format={(v) => `${v.toFixed(1)} km`} onChange={setKm} />
        <div className="grid grid-cols-2 gap-3 items-end">
          <HourField label="Time" value={hour} onChange={setHour} />
          <label className="flex items-center gap-2 text-sm pb-3">
            <input type="checkbox" checked={firstOrder} onChange={(e) => setFirstOrder(e.target.checked)} className="w-4 h-4 accent-brand-500" />
            First order
          </label>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-ink-50 p-3.5">
        <DeliveryBill subtotal={basket} quote={quote} />
        {quote.outOfRange ? (
          <p className="text-xs font-semibold text-red-600 mt-2">Outside the delivery radius — cannot order.</p>
        ) : quote.belowMinimum !== null ? (
          <p className="text-xs font-semibold text-amber-700 mt-2">Under the minimum order — cannot check out.</p>
        ) : null}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mt-5 mb-2">
        What customers are told
      </p>
      <ul className="space-y-1.5">
        {describeDelivery(settings).map((line) => (
          <li key={line} className="flex gap-2 text-sm text-ink-600">
            <Icon name="check" className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.4} />
            {line}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Section({
  icon,
  title,
  tint,
  wide,
  children,
}: {
  icon: IconName;
  title: string;
  tint: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className={`p-5 ${wide ? "lg:col-span-2" : ""}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${tint}`}>
          <Icon name={icon} className="w-4 h-4" />
        </span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

function Toggle({
  label,
  hint,
  on,
  onChange,
  children,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onChange: (on: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink-100 p-3.5">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className="w-full flex items-start gap-3 text-left"
      >
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium text-ink-800">{label}</span>
          {hint ? <span className="block text-[11px] text-ink-400 mt-0.5">{hint}</span> : null}
        </span>
        <span className={`mt-0.5 w-10 h-6 rounded-full p-0.5 transition shrink-0 ${on ? "bg-brand-500" : "bg-ink-200"}`}>
          <span className={`block w-5 h-5 rounded-full bg-white shadow transition ${on ? "translate-x-4" : ""}`} />
        </span>
      </button>
      {on && children ? <div className="mt-3 space-y-3">{children}</div> : null}
    </div>
  );
}

function MoneyField({
  label,
  hint,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 font-semibold">$</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? NaN : Number(e.target.value))}
          className={`${inputClass} pl-8`}
        />
      </div>
    </Field>
  );
}

function NumberField({
  label,
  hint,
  suffix,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  suffix: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={0.5}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? NaN : Number(e.target.value))}
          className={`${inputClass} pr-12`}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm font-semibold">{suffix}</span>
      </div>
    </Field>
  );
}

function HourField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))} className={inputClass}>
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {hourLabel(h)}
          </option>
        ))}
      </select>
    </Field>
  );
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  step = 1,
  format = (v: number) => `${v}%`,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-brand-500"
        />
        <span className="w-16 text-right font-bold tabular-nums">{format(value)}</span>
      </div>
    </Field>
  );
}
