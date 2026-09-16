"use client";

import { useState } from "react";
import { Avatar, Badge, Button, Card, Rating, Stat } from "@/components/ui";
import { Icon } from "@/components/icons";
import { PageHead, TableCard } from "@/components/DashShell";
import { money } from "@/lib/format";
import { TRANSPORTERS } from "@/lib/mock/data";
import type { Transporter } from "@/lib/types";

export default function AdminTransporters() {
  const [list, setList] = useState<Transporter[]>(TRANSPORTERS);
  const pending = list.filter((t) => t.status === "pending");
  const verified = list.filter((t) => t.status === "verified");

  function decide(id: string, status: Transporter["status"]) {
    setList((l) => l.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  return (
    <div className="p-5 lg:p-8">
      <PageHead
        title="Transporters"
        sub="Drivers and runners on the Move marketplace"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Verified" value={String(verified.length)} icon="shield" tone="green" />
        <Stat label="Awaiting review" value={String(pending.length)} icon="bell" tone="amber" />
        <Stat label="Avg rating" value="4.7" icon="star" />
        <Stat label="Paid out this week" value={money(3420)} icon="wallet" tone="blue" />
      </div>

      {pending.length ? (
        <section className="mb-6">
          <h2 className="font-semibold mb-3">Verification queue</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {pending.map((t) => (
              <Card key={t.id} className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar initials={t.initials} className="w-11 h-11" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{t.name}</p>
                    <p className="text-[11px] text-ink-400">
                      {t.vehicleLabel} · applied {t.joinedAt}
                    </p>
                  </div>
                  <Badge tone="amber">Pending</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  {["National ID", "Licence", "Reg book", "Insurance"].map((d) => (
                    <div
                      key={d}
                      className="flex items-center gap-1.5 text-[11px] text-ink-600 bg-ink-50 rounded-lg px-2 py-1.5"
                    >
                      <Icon
                        name="check"
                        className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                        strokeWidth={3}
                      />
                      {d}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={() => decide(t.id, "verified")}
                    variant="dark"
                    size="sm"
                    className="flex-1"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => decide(t.id, "suspended")}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <h2 className="font-semibold mb-3">All transporters</h2>
      <TableCard head={["Name", "Vehicle", "Rating", "Trips", "Earned", "Status", ""]}>
        {list.map((t) => (
          <tr key={t.id} className="hover:bg-ink-50/60">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Avatar initials={t.initials} className="w-8 h-8 text-xs" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{t.name}</p>
                  <p className="text-[11px] text-ink-400">{t.phone}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-ink-500 whitespace-nowrap">
              {t.vehicleLabel}
            </td>
            <td className="px-4 py-3">
              <Rating value={t.rating} />
            </td>
            <td className="px-4 py-3 tabular-nums">{t.trips}</td>
            <td className="px-4 py-3 tabular-nums font-medium">
              {money(t.earnings)}
            </td>
            <td className="px-4 py-3">
              <Badge
                tone={
                  t.status === "verified"
                    ? "green"
                    : t.status === "pending"
                      ? "amber"
                      : "red"
                }
              >
                {t.status}
              </Badge>
            </td>
            <td className="px-4 py-3 text-right">
              <button className="text-xs font-semibold text-brand-600 hover:underline">
                View
              </button>
            </td>
          </tr>
        ))}
      </TableCard>
    </div>
  );
}
