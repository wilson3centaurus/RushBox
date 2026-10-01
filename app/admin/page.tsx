"use client";

import Link from "next/link";
import { Badge, Button, Card, Stat } from "@/components/ui";
import { Icon } from "@/components/icons";
import { PageHead } from "@/components/DashShell";
import { BarList, TrendChart } from "@/components/charts";
import { money } from "@/lib/format";
import { DARK_STORES } from "@/lib/mock/data";
import { useStore } from "@/lib/store";
import { SystemMap } from "@/components/system-map";

const TREND = [
  { label: "Mon", groceries: 842, move: 310 },
  { label: "Tue", groceries: 918, move: 402 },
  { label: "Wed", groceries: 771, move: 356 },
  { label: "Thu", groceries: 1064, move: 498 },
  { label: "Fri", groceries: 1287, move: 640 },
  { label: "Sat", groceries: 1421, move: 712 },
  { label: "Sun", groceries: 963, move: 388 },
];

const AREAS = [
  { label: "Harare CBD", value: 284 },
  { label: "Avondale", value: 211 },
  { label: "Msasa", value: 176 },
  { label: "Borrowdale", value: 148 },
  { label: "Chitungwiza", value: 97 },
];

export default function AdminOverview() {
  const weekTotal = TREND.reduce((s, d) => s + d.groceries + d.move, 0);
  const { verifications } = useStore();
  const waiting = verifications.filter((v) => v.status === "pending").length;

  const ATTENTION = [
    {
      icon: "shield",
      label: waiting ? `${waiting} ID check${waiting === 1 ? "" : "s"} waiting for review` : "No ID checks waiting",
      href: "/admin/verifications",
      tone: waiting ? "amber" : "green",
    },
    { icon: "flag", label: "1 open Buy-for-me dispute", href: "/admin/disputes", tone: "red" },
    { icon: "store", label: "29 SKUs below reorder level", href: "/admin/inventory", tone: "amber" },
  ] as const;

  return (
    <div className="p-5 lg:p-8">
      <PageHead
        title="Overview"
        sub="All RushBox operations · last 7 days"
        action={
          <Button variant="outline" size="sm">
            <Icon name="receipt" className="w-4 h-4" />
            Export report
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="GMV this week" value={money(weekTotal)} icon="chart" delta="+14%" />
        <Stat label="Orders & jobs" value="1,204" icon="orders" tone="blue" delta="+9%" />
        <Stat label="Active customers" value="3,891" icon="users" tone="green" delta="+6%" />
        <Stat label="Verified transporters" value="128" icon="truck" tone="amber" delta="+11" />
      </div>

      <Card className="p-4 lg:p-5 mb-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="font-semibold">How RushBox works</h2>
            <p className="text-xs text-ink-500">
              Interactive 3D map — the players, a grocery order, a Move job, the money, the apps
            </p>
          </div>
          <Badge tone="brand">3D</Badge>
        </div>
        <SystemMap compact />
      </Card>

      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold">Revenue by service line</h2>
              <p className="text-xs text-ink-500 mt-0.5">
                Groceries is steadier; Move spikes on weekends
              </p>
            </div>
          </div>
          <TrendChart data={TREND} />
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-1">Needs attention</h2>
          <p className="text-xs text-ink-500 mb-4">Items waiting on the team</p>
          <div className="space-y-2">
            {ATTENTION.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-ink-100 hover:bg-ink-50"
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    a.tone === "red"
                      ? "bg-red-100 text-red-600"
                      : a.tone === "green"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  <Icon name={a.icon} className="w-4 h-4" />
                </span>
                <span className="text-xs text-ink-700 flex-1 leading-snug">
                  {a.label}
                </span>
                <Icon name="chevron" className="w-4 h-4 text-ink-300 shrink-0" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold mb-1">Top delivery areas</h2>
          <p className="text-xs text-ink-500 mb-4">Orders in the last 7 days</p>
          <BarList data={AREAS} />
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Dark stores</h2>
              <p className="text-xs text-ink-500 mt-0.5">Owned and operated by us</p>
            </div>
            <Badge tone="green">All online</Badge>
          </div>
          <div className="space-y-2">
            {DARK_STORES.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-ink-100"
              >
                <span className="w-9 h-9 rounded-lg bg-ink-100 text-ink-600 flex items-center justify-center shrink-0">
                  <Icon name="store" className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-[11px] text-ink-400">
                    {s.skus} SKUs · {s.lowStock} low
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold tabular-nums">{s.ordersToday}</p>
                  <p className="text-[10px] text-ink-400">orders today</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
