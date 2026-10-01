import type { Role, VehicleType } from "@/lib/types";

/** Mirrors the `doc_kind` enum in supabase/migrations/0004_accounts_pricing.sql. */
export type DocKind =
  | "id_front"
  | "id_back"
  | "licence"
  | "vehicle_photo"
  | "vehicle_reg"
  | "insurance";

export type VerifyStatus = "unverified" | "pending" | "verified" | "rejected";

export type StoredDoc = {
  /** In demo mode a compressed data URL; live, a path in the private bucket. */
  image: string;
  uploadedAt: string;
};

export type Verification = {
  userId: string;
  name: string;
  phone: string;
  role: Role;
  status: VerifyStatus;
  docs: Partial<Record<DocKind, StoredDoc>>;
  vehicle?: { type: VehicleType; model: string; plate: string };
  submittedAt?: string;
  reviewedAt?: string;
  /** Reviewer's reason when rejected. */
  note?: string;
};

export const DOC_INFO: Record<DocKind, { label: string; hint: string }> = {
  id_front: { label: "National ID — front", hint: "All four corners in frame, no glare" },
  id_back: { label: "National ID — back", hint: "The side with the fingerprint" },
  licence: { label: "Driver's licence", hint: "Valid, not expired, name matching your ID" },
  vehicle_photo: { label: "Vehicle photo", hint: "Whole vehicle, number plate readable" },
  vehicle_reg: { label: "Registration book", hint: "In your name, or with the owner's affidavit" },
  insurance: { label: "Insurance certificate", hint: "Third party or better" },
};

/** Customers verify by choice; transporters cannot bid until every required item is approved. */
export function docsFor(role: Role): { kind: DocKind; required: boolean }[] {
  if (role === "transporter") {
    return [
      { kind: "id_front", required: true },
      { kind: "id_back", required: true },
      { kind: "licence", required: true },
      { kind: "vehicle_photo", required: true },
      { kind: "vehicle_reg", required: true },
      { kind: "insurance", required: false },
    ];
  }
  return [
    { kind: "id_front", required: true },
    { kind: "id_back", required: true },
  ];
}

export function missingDocs(v: Verification): DocKind[] {
  return docsFor(v.role)
    .filter((d) => d.required && !v.docs[d.kind])
    .map((d) => d.kind);
}

export function emptyVerification(user: {
  id: string;
  name: string;
  phone: string;
  role: Role;
}): Verification {
  return {
    userId: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    status: "unverified",
    docs: {},
  };
}

export const STATUS_COPY: Record<VerifyStatus, { label: string; tone: "grey" | "amber" | "green" | "red" }> = {
  unverified: { label: "Not verified", tone: "grey" },
  pending: { label: "Under review", tone: "amber" },
  verified: { label: "Verified", tone: "green" },
  rejected: { label: "Needs attention", tone: "red" },
};
