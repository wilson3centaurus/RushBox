"use client";

import { Card } from "@/components/ui";
import { Icon } from "@/components/icons";
import { money } from "@/lib/format";
import type { DeliveryQuote } from "@/lib/pricing";

/** Item total, each delivery charge on its own line, and what to pay. */
export function DeliveryBill({
  subtotal,
  quote,
}: {
  subtotal: number;
  quote: DeliveryQuote;
}) {
  return (
    <div>
      <Row label="Item total" value={money(subtotal)} />
      {quote.lines.map((line) => {
        const waived = line.label === "Delivery fee" && quote.freeReason;
        return (
          <Row
            key={line.label}
            label={line.label}
            sub={waived ? quote.freeReason ?? undefined : undefined}
            value={waived ? "FREE" : money(line.amount)}
            highlight={Boolean(waived)}
          />
        );
      })}
      {quote.amountToFree !== null ? (
        <p className="text-[11px] text-brand-600 font-medium mt-1">
          Add {money(quote.amountToFree)} more for free delivery
        </p>
      ) : null}
      <div className="border-t border-ink-100 mt-3 pt-3 flex justify-between font-bold">
        <span>To pay</span>
        <span>{money(subtotal + quote.fee)}</span>
      </div>
    </div>
  );
}

/** Why the order cannot go through yet, if it cannot. */
export function DeliveryBlocker({ quote }: { quote: DeliveryQuote }) {
  if (quote.outOfRange) {
    return (
      <Card className="p-4 flex gap-3 bg-red-50 border-red-200">
        <Icon name="pin" className="w-5 h-5 text-red-600 shrink-0" />
        <p className="text-sm text-red-900">
          This address is outside our delivery area. Choose an address closer to
          a RushBox store.
        </p>
      </Card>
    );
  }
  if (quote.belowMinimum !== null) {
    return (
      <Card className="p-4 flex gap-3 bg-amber-50 border-amber-200">
        <Icon name="bag" className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="text-sm text-amber-900">
          Add {money(quote.belowMinimum)} more to reach the minimum order.
        </p>
      </Card>
    );
  }
  return null;
}

function Row({
  label,
  sub,
  value,
  highlight,
}: {
  label: string;
  sub?: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 text-sm py-1">
      <span className="text-ink-500">
        {label}
        {sub ? <span className="block text-[11px] text-emerald-600">{sub}</span> : null}
      </span>
      <span
        className={`shrink-0 ${highlight ? "font-semibold text-emerald-600" : "text-ink-800"}`}
      >
        {value}
      </span>
    </div>
  );
}
