/**
 * Delivery and marketplace pricing rules, and the one function that turns them
 * into a fee. Admin edits the rules; the cart, checkout and order all quote
 * through `quoteDelivery`, so they can never disagree with each other.
 *
 * The quote here is for display. Once orders are written to the database, the
 * fee must be recomputed server-side from `app_settings` — a price the browser
 * sends is a price the customer can edit.
 */

import { moneyShort } from "@/lib/format";

export type DeliverySettings = {
  /** Standard fee on an express grocery order. */
  baseFee: number;

  /** Waive the fee once the basket reaches `freeThreshold`. */
  freeOverEnabled: boolean;
  freeThreshold: number;

  /** Waive the fee on a customer's first order. */
  firstOrderFree: boolean;

  /** Free delivery for everyone until this date (inclusive), e.g. a launch week. */
  promoFreeUntil: string | null;

  /** Orders below this cannot be placed at all. */
  minimumOrder: number;

  /** Baskets below `smallBasketThreshold` pay `smallBasketFee` on top. */
  smallBasketThreshold: number;
  smallBasketFee: number;

  /** Extra charge between `nightStart` and `nightEnd` (24h clock, may wrap midnight). */
  nightFeeEnabled: boolean;
  nightFee: number;
  nightStart: number;
  nightEnd: number;

  /** First `includedKm` are covered by the base fee; each km after costs `perKmFee`. */
  includedKm: number;
  perKmFee: number;
  /** Beyond this, the store does not deliver. */
  maxRadiusKm: number;
};

export type MoveSettings = {
  /** Share of the agreed price RushBox keeps, in percent. */
  commissionPct: number;
  /** Buy-For-Me service fee, as a percent of the shopping budget. */
  errandFeePct: number;
};

export type PricingSettings = {
  delivery: DeliverySettings;
  move: MoveSettings;
};

export const DEFAULT_PRICING: PricingSettings = {
  delivery: {
    baseFee: 1.5,
    freeOverEnabled: true,
    freeThreshold: 20,
    firstOrderFree: true,
    promoFreeUntil: null,
    minimumOrder: 2,
    smallBasketThreshold: 5,
    smallBasketFee: 0.5,
    nightFeeEnabled: true,
    nightFee: 1,
    nightStart: 21,
    nightEnd: 6,
    includedKm: 3,
    perKmFee: 0.3,
    maxRadiusKm: 7,
  },
  move: {
    commissionPct: 12,
    errandFeePct: 10,
  },
};

/**
 * Fill gaps from the defaults. Stored settings may predate a field, and a
 * missing number must never become NaN in a price.
 */
export function withDefaults(raw: unknown): PricingSettings {
  const r = (raw ?? {}) as Partial<PricingSettings>;
  return {
    delivery: { ...DEFAULT_PRICING.delivery, ...(r.delivery ?? {}) },
    move: { ...DEFAULT_PRICING.move, ...(r.move ?? {}) },
  };
}

export type FeeLine = { label: string; amount: number };

export type DeliveryQuote = {
  /** Everything the customer pays on top of the items. */
  fee: number;
  lines: FeeLine[];
  /** Why the delivery fee is waived, if it is. */
  freeReason: string | null;
  /** Spend this much more to get free delivery. */
  amountToFree: number | null;
  /** The basket is under the minimum by this much; checkout is blocked. */
  belowMinimum: number | null;
  /** The address is outside the delivery radius; checkout is blocked. */
  outOfRange: boolean;
};

export type QuoteContext = {
  now: Date;
  distanceKm: number;
  isFirstOrder: boolean;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export function isNight(hour: number, start: number, end: number) {
  if (start === end) return false;
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}

function promoActive(until: string | null, now: Date) {
  if (!until) return false;
  // Inclusive of the whole end day, in local time.
  const end = new Date(`${until}T23:59:59`);
  return !Number.isNaN(end.getTime()) && now <= end;
}

export function quoteDelivery(
  subtotal: number,
  s: DeliverySettings,
  ctx: QuoteContext,
): DeliveryQuote {
  const lines: FeeLine[] = [];

  const freeReason = promoActive(s.promoFreeUntil, ctx.now)
    ? "Launch offer"
    : s.firstOrderFree && ctx.isFirstOrder
      ? "First order"
      : s.freeOverEnabled && subtotal >= s.freeThreshold
        ? `Orders over ${moneyShort(s.freeThreshold)}`
        : null;

  const extraKm = Math.max(0, ctx.distanceKm - s.includedKm);
  const distanceFee = round2(Math.ceil(extraKm) * s.perKmFee);

  // A free delivery waives the delivery itself, distance included.
  lines.push({ label: "Delivery fee", amount: freeReason ? 0 : s.baseFee });
  if (!freeReason && distanceFee > 0) {
    lines.push({ label: `Distance (${extraKm.toFixed(1)} km extra)`, amount: distanceFee });
  }

  if (subtotal < s.smallBasketThreshold && s.smallBasketFee > 0) {
    lines.push({ label: "Small basket fee", amount: s.smallBasketFee });
  }

  // Late-night riders cost more whether or not delivery is free.
  if (s.nightFeeEnabled && s.nightFee > 0 && isNight(ctx.now.getHours(), s.nightStart, s.nightEnd)) {
    lines.push({ label: "Late-night fee", amount: s.nightFee });
  }

  const fee = round2(lines.reduce((sum, l) => sum + l.amount, 0));

  return {
    fee,
    lines,
    freeReason,
    amountToFree:
      !freeReason && s.freeOverEnabled && subtotal < s.freeThreshold
        ? round2(s.freeThreshold - subtotal)
        : null,
    belowMinimum: subtotal < s.minimumOrder ? round2(s.minimumOrder - subtotal) : null,
    outOfRange: ctx.distanceKm > s.maxRadiusKm,
  };
}

/** Plain-language summary of the rules, for the product page and the admin preview. */
export function describeDelivery(s: DeliverySettings): string[] {
  const out: string[] = [];
  out.push(`Delivery costs ${moneyShort(s.baseFee)} within ${s.includedKm} km`);
  if (s.freeOverEnabled) out.push(`Free delivery on orders over ${moneyShort(s.freeThreshold)}`);
  if (s.firstOrderFree) out.push("Free delivery on your first order");
  if (s.smallBasketFee > 0)
    out.push(`${moneyShort(s.smallBasketFee)} extra on baskets under ${moneyShort(s.smallBasketThreshold)}`);
  if (s.nightFeeEnabled)
    out.push(`${moneyShort(s.nightFee)} late-night fee from ${hourLabel(s.nightStart)} to ${hourLabel(s.nightEnd)}`);
  return out;
}

export function hourLabel(h: number) {
  const hh = ((h % 24) + 24) % 24;
  const suffix = hh < 12 ? "am" : "pm";
  const twelve = hh % 12 === 0 ? 12 : hh % 12;
  return `${twelve}${suffix}`;
}
