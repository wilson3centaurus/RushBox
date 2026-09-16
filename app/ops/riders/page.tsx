"use client";

import { Badge, Button, Card, Rating, Stat } from "@/components/ui";
import { Avatar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { PageHead } from "@/components/DashShell";

const RIDERS = [
  { id: "r1", name: "Thamu Ncube", initials: "TN", vehicle: "Honda 125", status: "delivering", order: "RB-4821", rating: 4.7, today: 11 },
  { id: "r2", name: "Farai Chibaya", initials: "FC", vehicle: "Honda 125", status: "idle", order: null, rating: 4.9, today: 8 },
  { id: "r3", name: "Panashe Zimba", initials: "PZ", vehicle: "Bicycle", status: "delivering", order: "RB-4827", rating: 4.5, today: 6 },
  { id: "r4", name: "Kuda Mhere", initials: "KM", vehicle: "Honda 125", status: "returning", order: null, rating: 4.8, today: 13 },
  { id: "r5", name: "Ropafadzo N.", initials: "RN", vehicle: "Scooter", status: "offline", order: null, rating: 4.6, today: 0 },
  { id: "r6", name: "Tapiwa Moyo", initials: "TM", vehicle: "Honda 125", status: "idle", order: null, rating: 4.4, today: 9 },
];

const TONE = {
  delivering: "brand",
  idle: "green",
  returning: "blue",
  offline: "grey",
} as const;

export default function OpsRiders() {
  const active = RIDERS.filter((r) => r.status !== "offline").length;

  return (
    <div className="p-5 lg:p-8">
      <PageHead
        title="Riders"
        sub="RushBox Msasa delivery team"
        action={
          <Button variant="primary" size="sm">
            <Icon name="plus" className="w-4 h-4" strokeWidth={2.4} />
            Add rider
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="On shift" value={String(active)} icon="bike" tone="green" />
        <Stat label="Delivering now" value="2" icon="truck" />
        <Stat label="Deliveries today" value="47" icon="check" tone="blue" />
        <Stat label="Avg delivery" value="22 min" icon="clock" />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {RIDERS.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center gap-3">
              <Avatar initials={r.initials} className="w-11 h-11" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{r.name}</p>
                <p className="text-[11px] text-ink-400">{r.vehicle}</p>
              </div>
              <Badge tone={TONE[r.status as keyof typeof TONE]}>
                {r.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100">
              <Rating value={r.rating} />
              <span className="text-xs text-ink-500">
                {r.today} deliveries today
              </span>
            </div>

            {r.order ? (
              <div className="mt-3 rounded-lg bg-brand-50 border border-brand-200 px-3 py-2 flex items-center gap-2">
                <Icon name="package" className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="text-xs font-medium text-brand-900">
                  Carrying {r.order}
                </span>
              </div>
            ) : (
              <button
                disabled={r.status === "offline"}
                className="w-full mt-3 py-2 rounded-lg border border-ink-200 text-xs font-semibold text-ink-600 hover:bg-ink-50 disabled:opacity-40"
              >
                Assign next order
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
