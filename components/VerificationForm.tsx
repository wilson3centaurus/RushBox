"use client";

import { useRef, useState } from "react";
import { Badge, Button, Card, Field, inputClass } from "@/components/ui";
import { Icon } from "@/components/icons";
import { Emoji } from "@/components/Emoji";
import { useStore } from "@/lib/store";
import { compressImage } from "@/lib/image";
import { VEHICLES } from "@/lib/mock/data";
import {
  DOC_INFO,
  STATUS_COPY,
  docsFor,
  missingDocs,
  type DocKind,
  type Verification,
} from "@/lib/verification";
import type { VehicleType } from "@/lib/types";

/**
 * Upload ID (and, for transporters, licence and vehicle) photos and send them
 * for review. Customers use it by choice; transporters cannot bid without it.
 */
export function VerificationForm({ submitLabel = "Submit for review" }: { submitLabel?: string }) {
  const { verification, saveDoc, removeDoc, setVehicle, submitVerification } = useStore();
  const [consent, setConsent] = useState(false);

  if (!verification) return null;
  const v = verification;
  const isDriver = v.role === "transporter";
  const docs = docsFor(v.role);
  const missing = missingDocs(v);
  const needsVehicle = isDriver && !(v.vehicle?.plate && v.vehicle.model);
  const canSubmit =
    (v.status === "unverified" || v.status === "rejected") && !missing.length && !needsVehicle && consent;

  return (
    <div className="space-y-4">
      <StatusCard v={v} />

      {isDriver ? <VehicleCard v={v} onChange={setVehicle} /> : null}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Documents</p>
          <p className="text-[11px] text-ink-400">
            {docs.filter((d) => v.docs[d.kind]).length} of {docs.length} added
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {docs.map((d) => (
            <DocTile
              key={d.kind}
              kind={d.kind}
              required={d.required}
              image={v.docs[d.kind]?.image}
              onSave={(img) => saveDoc(d.kind, img)}
              onRemove={() => removeDoc(d.kind)}
            />
          ))}
        </div>
      </Card>

      <Card className="p-4 bg-ink-50 border-ink-200">
        <div className="flex gap-3">
          <Icon name="shield" className="w-5 h-5 text-ink-500 shrink-0 mt-0.5" />
          <p className="text-xs text-ink-600 leading-relaxed">
            Your documents are private. Only RushBox&apos;s verification team can
            open them, they are never shown to drivers or customers, and you can
            delete them before they are reviewed.
          </p>
        </div>
      </Card>

      {v.status === "unverified" || v.status === "rejected" ? (
        <>
          <label className="flex items-start gap-3 px-1 text-sm text-ink-600">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-brand-500 shrink-0"
            />
            These are my own documents, and I agree to RushBox checking them.
          </label>
          <Button onClick={submitVerification} disabled={!canSubmit} variant="primary" size="lg" full>
            {missing.length
              ? `Add ${missing.length} more photo${missing.length === 1 ? "" : "s"}`
              : needsVehicle
                ? "Add your vehicle details"
                : submitLabel}
          </Button>
        </>
      ) : null}
    </div>
  );
}

function StatusCard({ v }: { v: Verification }) {
  const copy = STATUS_COPY[v.status];
  const isDriver = v.role === "transporter";
  const body = {
    unverified: isDriver
      ? "Add your ID, licence and vehicle. You can browse jobs now; bidding opens once you're approved."
      : "Optional. A verified account can pay cash on delivery for bigger orders and use Buy-For-Me with cash.",
    pending: "We're checking your documents — usually within 24 hours. You can still replace a photo.",
    verified: isDriver
      ? "You're verified. Changing your vehicle or replacing a document sends it back for a quick re-check."
      : "Your identity is confirmed. Drivers see a verified badge on your orders.",
    rejected: v.note
      ? `We couldn't approve this: ${v.note}. Replace the photo and submit again.`
      : "We couldn't approve this. Replace the photo and submit again.",
  }[v.status];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            v.status === "verified"
              ? "bg-emerald-100 text-emerald-600"
              : v.status === "rejected"
                ? "bg-red-100 text-red-600"
                : v.status === "pending"
                  ? "bg-amber-100 text-amber-600"
                  : "bg-ink-100 text-ink-500"
          }`}
        >
          <Icon name={v.status === "verified" ? "check" : "id"} className="w-5 h-5" strokeWidth={v.status === "verified" ? 2.6 : 1.7} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{isDriver ? "Driver verification" : "Identity"}</p>
            <Badge tone={copy.tone}>{copy.label}</Badge>
          </div>
          <p className="text-xs text-ink-500 mt-1 leading-relaxed">{body}</p>
        </div>
      </div>
    </Card>
  );
}

function VehicleCard({
  v,
  onChange,
}: {
  v: Verification;
  onChange: (vehicle: NonNullable<Verification["vehicle"]>) => void;
}) {
  const current = v.vehicle ?? { type: "bike" as VehicleType, model: "", plate: "" };
  const [draft, setDraft] = useState(current);
  const changed =
    draft.type !== current.type || draft.model !== current.model || draft.plate !== current.plate;

  return (
    <Card className="p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Your vehicle</p>
      <div className="grid grid-cols-3 gap-2">
        {VEHICLES.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setDraft((d) => ({ ...d, type: opt.id }))}
            className={`rounded-xl border p-2.5 text-center transition ${
              draft.type === opt.id ? "border-brand-400 bg-brand-50" : "border-ink-200 hover:bg-ink-50"
            }`}
          >
            <Emoji char={opt.emoji} className="w-7 h-7 mx-auto" />
            <p className="text-[11px] font-semibold mt-1">{opt.label}</p>
          </button>
        ))}
      </div>
      <p className="text-[11px] text-ink-500">
        {VEHICLES.find((o) => o.id === draft.type)?.capacity}
        {draft.type === "bike" ? " · Grocery deliveries use motorbikes and scooters." : ""}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Make & model">
          <input
            value={draft.model}
            onChange={(e) => setDraft((d) => ({ ...d, model: e.target.value }))}
            placeholder="Honda 125"
            className={inputClass}
          />
        </Field>
        <Field label="Number plate">
          <input
            value={draft.plate}
            onChange={(e) => setDraft((d) => ({ ...d, plate: e.target.value.toUpperCase() }))}
            placeholder="AEX 1234"
            autoCapitalize="characters"
            className={inputClass}
          />
        </Field>
      </div>
      {changed ? (
        <Button
          onClick={() => onChange({ ...draft, model: draft.model.trim(), plate: draft.plate.trim() })}
          disabled={!draft.model.trim() || !draft.plate.trim()}
          variant="dark"
          size="sm"
          full
        >
          Save vehicle
        </Button>
      ) : null}
    </Card>
  );
}

function DocTile({
  kind,
  required,
  image,
  onSave,
  onRemove,
}: {
  kind: DocKind;
  required: boolean;
  image?: string;
  onSave: (image: string) => void;
  onRemove: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const info = DOC_INFO[kind];

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onSave(await compressImage(file, { maxSize: 1280, quality: 0.72 }));
    } catch {
      setError("Couldn't read that photo. Try a JPG or PNG.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {image ? (
        <div className="relative rounded-xl overflow-hidden border border-emerald-200 bg-ink-100 aspect-[4/3]">
          {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
          <img src={image} alt={info.label} className="absolute inset-0 w-full h-full object-cover" />
          <span className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Icon name="check" className="w-3.5 h-3.5" strokeWidth={3} />
          </span>
          <div className="absolute inset-x-0 bottom-0 flex">
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="flex-1 py-1.5 text-[11px] font-semibold text-white bg-ink-900/70 backdrop-blur"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${info.label}`}
              className="px-2.5 py-1.5 text-white bg-red-600/80"
            >
              <Icon name="trash" className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="w-full rounded-xl border border-dashed border-ink-300 bg-white aspect-[4/3] flex flex-col items-center justify-center gap-1.5 hover:bg-ink-50 active:scale-[0.98] transition"
        >
          <Icon name="camera" className="w-6 h-6 text-ink-400" />
          <span className="text-[11px] font-semibold text-ink-600">{busy ? "Processing…" : "Add photo"}</span>
        </button>
      )}
      <p className="text-xs font-medium mt-1.5 leading-tight">
        {info.label}
        {required ? null : <span className="text-ink-400 font-normal"> · optional</span>}
      </p>
      <p className="text-[10px] text-ink-400 leading-tight mt-0.5">{error ?? info.hint}</p>
    </div>
  );
}
