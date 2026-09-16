"use client";

import { useState } from "react";
import { Avatar, Badge, Stat } from "@/components/ui";
import { Icon } from "@/components/icons";
import { PageHead, TableCard } from "@/components/DashShell";
import { money } from "@/lib/format";

const USERS = [
  { id: "u1", name: "Wilson Sedze", initials: "WS", phone: "+263 77 123 4567", area: "Harare CBD", orders: 42, spent: 612.4, joined: "2025-08-14", status: "active" },
  { id: "u2", name: "Trevor Munjeri", initials: "TM", phone: "+263 71 908 2211", area: "Msasa", orders: 18, spent: 288.1, joined: "2026-01-09", status: "active" },
  { id: "u3", name: "Tinashe Sedze", initials: "TS", phone: "+263 78 442 1180", area: "Avondale", orders: 31, spent: 471.9, joined: "2025-11-22", status: "active" },
  { id: "u4", name: "Grace Mutasa", initials: "GM", phone: "+263 77 220 3345", area: "Borrowdale", orders: 7, spent: 98.5, joined: "2026-06-30", status: "active" },
  { id: "u5", name: "Rodney Chikuni", initials: "RC", phone: "+263 73 551 7788", area: "Chitungwiza", orders: 2, spent: 24, joined: "2026-09-01", status: "new" },
  { id: "u6", name: "Blessing Dube", initials: "BD", phone: "+263 71 664 0091", area: "Waterfalls", orders: 0, spent: 0, joined: "2026-09-12", status: "dormant" },
];

const TONE = { active: "green", new: "blue", dormant: "grey" } as const;

export default function AdminUsers() {
  const [q, setQ] = useState("");
  const rows = USERS.filter((u) =>
    `${u.name} ${u.phone} ${u.area}`.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <div className="p-5 lg:p-8">
      <PageHead title="Customers" sub="Everyone ordering on RushBox" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Total customers" value="3,891" icon="users" delta="+6%" />
        <Stat label="Ordered this week" value="1,102" icon="orders" tone="green" />
        <Stat label="Avg lifetime value" value={money(184)} icon="wallet" tone="blue" />
        <Stat label="Repeat rate" value="63%" icon="check" tone="amber" />
      </div>

      <div className="flex items-center gap-2 bg-white border border-ink-200 rounded-xl px-3 py-2 mb-4 max-w-md">
        <Icon name="search" className="w-4 h-4 text-ink-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, number or area…"
          className="flex-1 min-w-0 text-sm outline-none"
        />
      </div>

      <TableCard head={["Customer", "Area", "Orders", "Spent", "Joined", "Status", ""]}>
        {rows.map((u) => (
          <tr key={u.id} className="hover:bg-ink-50/60">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Avatar initials={u.initials} className="w-8 h-8 text-xs" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{u.name}</p>
                  <p className="text-[11px] text-ink-400">{u.phone}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-ink-500 whitespace-nowrap">{u.area}</td>
            <td className="px-4 py-3 tabular-nums">{u.orders}</td>
            <td className="px-4 py-3 tabular-nums font-medium">{money(u.spent)}</td>
            <td className="px-4 py-3 text-ink-500 whitespace-nowrap">{u.joined}</td>
            <td className="px-4 py-3">
              <Badge tone={TONE[u.status as keyof typeof TONE]}>{u.status}</Badge>
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
