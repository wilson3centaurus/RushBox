"use client";

import { useState } from "react";
import { Badge, Stat } from "@/components/ui";
import { PageHead, TableCard } from "@/components/DashShell";
import { money } from "@/lib/format";

type Row = {
  id: string;
  line: "Groceries" | "Cargo" | "Parcel" | "Buy for me";
  customer: string;
  route: string;
  value: number;
  status: string;
  tone: "brand" | "green" | "blue" | "red" | "grey";
};

const ROWS: Row[] = [
  { id: "RB-4832", line: "Groceries", customer: "Wilson S.", route: "Msasa → CBD", value: 18.4, status: "Packing", tone: "brand" },
  { id: "RB-J118", line: "Cargo", customer: "Trevor M.", route: "Msasa → Subway City", value: 20, status: "Bidding", tone: "brand" },
  { id: "RB-4831", line: "Groceries", customer: "Grace M.", route: "Msasa → Belvedere", value: 14.9, status: "Out for delivery", tone: "blue" },
  { id: "RB-J117", line: "Buy for me", customer: "Tinashe S.", route: "N. Richards → CBD", value: 67.5, status: "Shopping", tone: "blue" },
  { id: "RB-4829", line: "Groceries", customer: "Rodney C.", route: "Avondale → Eastlea", value: 22.1, status: "Delivered", tone: "green" },
  { id: "RB-J116", line: "Parcel", customer: "Thamu N.", route: "Avondale → Borrowdale", value: 5, status: "Delivered", tone: "green" },
  { id: "RB-4824", line: "Groceries", customer: "Blessing D.", route: "Mbare → Waterfalls", value: 9.8, status: "Cancelled", tone: "red" },
  { id: "RB-J112", line: "Cargo", customer: "Simba N.", route: "Graniteside → Chitungwiza", value: 28, status: "Delivered", tone: "green" },
];

const FILTERS = ["All", "Groceries", "Cargo", "Parcel", "Buy for me"];

export default function AdminOrders() {
  const [filter, setFilter] = useState("All");
  const rows = ROWS.filter((r) => filter === "All" || r.line === filter);

  return (
    <div className="p-5 lg:p-8">
      <PageHead title="Orders & jobs" sub="Everything moving across both service lines" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Live right now" value="34" icon="zap" />
        <Stat label="Completed today" value="219" icon="check" tone="green" />
        <Stat label="Avg order value" value={money(16.4)} icon="wallet" tone="blue" />
        <Stat label="Cancellations" value="2.1%" icon="close" tone="red" />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
              filter === f
                ? "bg-ink-900 text-white"
                : "bg-white border border-ink-200 text-ink-600 hover:bg-ink-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <TableCard head={["Ref", "Service", "Customer", "Route", "Value", "Status"]}>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-ink-50/60">
            <td className="px-4 py-3 font-medium whitespace-nowrap">{r.id}</td>
            <td className="px-4 py-3 text-ink-500 whitespace-nowrap">{r.line}</td>
            <td className="px-4 py-3 text-ink-600 whitespace-nowrap">{r.customer}</td>
            <td className="px-4 py-3 text-ink-500">{r.route}</td>
            <td className="px-4 py-3 font-medium tabular-nums">{money(r.value)}</td>
            <td className="px-4 py-3">
              <Badge tone={r.tone}>{r.status}</Badge>
            </td>
          </tr>
        ))}
      </TableCard>
    </div>
  );
}
