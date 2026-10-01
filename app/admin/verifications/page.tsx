"use client";

import { useState } from "react";
import { Avatar, Badge, Button, Card, EmptyState } from "@/components/ui";
import { Icon } from "@/components/icons";
import { PageHead } from "@/components/DashShell";
import { TimeAgo } from "@/components/TimeAgo";
import { useStore, initialsOf } from "@/lib/store";
import { vehicleById } from "@/lib/mock/data";
import {
  DOC_INFO,
  STATUS_COPY,
  docsFor,
  missingDocs,
  type Verification,
  type VerifyStatus,
} from "@/lib/verification";

const TABS: { id: VerifyStatus | "all"; label: string }[] = [
  { id: "pending", label: "To review" },
  { id: "verified", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

const REASONS = [
  "the photo is blurry or cut off",
  "the name doesn't match the ID",
  "the document has expired",
  "the plate doesn't match the registration book",
];

/** What a reviewer should confirm before approving, by role. */
const CHECKS = {
  customer: ["Face and name readable on the ID", "Front and back are the same card"],
  transporter: [
    "Name matches across ID and licence",
    "Licence valid for this vehicle class",
    "Plate in the photo matches the registration book",
  ],
};

export default function Verifications() {
  const { verifications } = useStore();
  const [tab, setTab] = useState<VerifyStatus | "all">("pending");
  const [zoom, setZoom] = useState<{ src: string; label: string } | null>(null);

  const list = verifications
    .filter((v) => v.status !== "unverified")
    .filter((v) => tab === "all" || v.status === tab)
    .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));
  const waiting = verifications.filter((v) => v.status === "pending").length;

  return (
    <div className="p-5 lg:p-8">
      <PageHead
        title="Verifications"
        sub={`${waiting} waiting · drivers cannot bid until approved; customers verify by choice`}
      />

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              tab === t.id ? "bg-ink-900 text-white" : "bg-white border border-ink-200 text-ink-600 hover:bg-ink-50"
            }`}
          >
            {t.label}
            {t.id === "pending" && waiting ? ` (${waiting})` : ""}
          </button>
        ))}
      </div>

      {list.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {list.map((v) => (
            <Submission key={v.userId} v={v} onZoom={setZoom} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="shield"
          title="Nothing here"
          body={tab === "pending" ? "No documents are waiting for review." : "No submissions in this list yet."}
        />
      )}

      {zoom ? (
        <button
          onClick={() => setZoom(null)}
          aria-label="Close"
          className="fixed inset-0 z-50 bg-ink-900/90 flex flex-col items-center justify-center p-4"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
          <img src={zoom.src} alt={zoom.label} className="max-w-full max-h-[80dvh] rounded-xl" />
          <p className="text-white text-sm mt-3">{zoom.label} · tap to close</p>
        </button>
      ) : null}
    </div>
  );
}

function Submission({
  v,
  onZoom,
}: {
  v: Verification;
  onZoom: (z: { src: string; label: string }) => void;
}) {
  const { reviewVerification } = useStore();
  const [rejecting, setRejecting] = useState(false);
  const missing = missingDocs(v);
  const isDriver = v.role === "transporter";
  const vehicle = v.vehicle ? vehicleById(v.vehicle.type) : undefined;
  const copy = STATUS_COPY[v.status];

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar initials={initialsOf(v.name)} className="w-11 h-11" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold">{v.name}</p>
            <Badge tone={isDriver ? "blue" : "grey"}>{isDriver ? "Driver" : "Customer"}</Badge>
            <Badge tone={copy.tone}>{copy.label}</Badge>
          </div>
          <p className="text-xs text-ink-500 mt-0.5">
            {v.phone}
            {v.submittedAt ? (
              <>
                {" · sent "}
                <TimeAgo iso={v.submittedAt} />
              </>
            ) : null}
          </p>
          {isDriver && v.vehicle ? (
            <p className="text-xs text-ink-600 mt-1">
              {vehicle?.emoji} {v.vehicle.model} · {vehicle?.label} ·{" "}
              <span className="font-semibold">{v.vehicle.plate}</span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 xl:grid-cols-3 gap-2 mt-4">
        {docsFor(v.role).map(({ kind, required }) => {
          const doc = v.docs[kind];
          const label = DOC_INFO[kind].label;
          return (
            <div key={kind}>
              {doc?.image ? (
                <button
                  onClick={() => onZoom({ src: doc.image, label })}
                  className="block w-full aspect-[4/3] rounded-lg overflow-hidden bg-ink-100 border border-ink-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
                  <img src={doc.image} alt={label} className="w-full h-full object-cover" />
                </button>
              ) : (
                <div
                  className={`w-full aspect-[4/3] rounded-lg flex items-center justify-center text-center p-1 ${
                    doc ? "bg-ink-100 text-ink-400" : "border border-dashed border-ink-300 text-ink-300"
                  }`}
                >
                  <span className="text-[9px] font-semibold leading-tight">
                    {doc ? "Sample — no file" : required ? "Missing" : "Not given"}
                  </span>
                </div>
              )}
              <p className="text-[10px] text-ink-500 mt-1 leading-tight">{label}</p>
            </div>
          );
        })}
      </div>

      {v.status === "pending" ? (
        <>
          <ul className="mt-4 space-y-1">
            {CHECKS[isDriver ? "transporter" : "customer"].map((c) => (
              <li key={c} className="flex gap-2 text-xs text-ink-600">
                <Icon name="check" className="w-3.5 h-3.5 text-ink-300 shrink-0 mt-0.5" />
                {c}
              </li>
            ))}
          </ul>

          {missing.length ? (
            <p className="text-xs text-red-600 mt-3">
              Missing: {missing.map((k) => DOC_INFO[k].label).join(", ")}
            </p>
          ) : null}

          {rejecting ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-ink-600">Why? The applicant sees this.</p>
              {REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => reviewVerification(v.userId, "rejected", r)}
                  className="w-full text-left text-sm rounded-lg border border-ink-200 px-3 py-2 hover:bg-red-50 hover:border-red-200"
                >
                  {r[0].toUpperCase() + r.slice(1)}
                </button>
              ))}
              <Button onClick={() => setRejecting(false)} variant="ghost" size="sm" full>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button onClick={() => setRejecting(true)} variant="outline" size="sm">
                Reject
              </Button>
              <Button
                onClick={() => reviewVerification(v.userId, "verified")}
                disabled={missing.length > 0}
                variant="primary"
                size="sm"
              >
                Approve
              </Button>
            </div>
          )}
        </>
      ) : v.status === "rejected" && v.note ? (
        <p className="text-xs text-red-700 mt-3">Rejected: {v.note}</p>
      ) : null}
    </Card>
  );
}
