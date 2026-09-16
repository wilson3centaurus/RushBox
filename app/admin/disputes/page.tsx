"use client";

import { useState } from "react";
import { Avatar, Badge, Button, Card, Stat } from "@/components/ui";
import { Icon } from "@/components/icons";
import { PageHead } from "@/components/DashShell";
import { money } from "@/lib/format";
import { TimeAgo } from "@/components/TimeAgo";

type Dispute = {
  id: string;
  ref: string;
  kind: string;
  customer: string;
  initials: string;
  against: string;
  amount: number;
  summary: string;
  at: string;
  status: "open" | "resolved";
};

const INITIAL: Dispute[] = [
  {
    id: "d1",
    ref: "RB-J117",
    kind: "Buy for me",
    customer: "Tinashe Sedze",
    initials: "TS",
    against: "Grace Mutasa",
    amount: 12.5,
    summary:
      "Receipt total is $12.50 above the agreed budget. Runner says two items had gone up in price; customer wants the difference refunded.",
    at: new Date(Date.now() - 3 * 3600_000).toISOString(),
    status: "open",
  },
  {
    id: "d2",
    ref: "RB-4790",
    kind: "Groceries",
    customer: "Rodney Chikuni",
    initials: "RC",
    against: "RushBox Msasa",
    amount: 4.2,
    summary: "One item missing from the order — 2kg sugar not delivered.",
    at: new Date(Date.now() - 26 * 3600_000).toISOString(),
    status: "resolved",
  },
  {
    id: "d3",
    ref: "RB-J109",
    kind: "Cargo",
    customer: "Trevor Munjeri",
    initials: "TM",
    against: "Simba Nyoni",
    amount: 28,
    summary:
      "Driver asked for an extra $10 in cash on arrival, above the agreed bid.",
    at: new Date(Date.now() - 3 * 24 * 3600_000).toISOString(),
    status: "resolved",
  },
];

export default function AdminDisputes() {
  const [list, setList] = useState(INITIAL);
  const open = list.filter((d) => d.status === "open");

  return (
    <div className="p-5 lg:p-8">
      <PageHead title="Disputes" sub="Refunds, missing items and price disagreements" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label="Open" value={String(open.length)} icon="flag" tone="red" />
        <Stat label="Resolved this week" value="7" icon="check" tone="green" />
        <Stat label="Avg resolution" value="6h" icon="clock" tone="blue" />
        <Stat label="Refunded" value={money(84.3)} icon="wallet" />
      </div>

      <div className="space-y-3">
        {list.map((d) => (
          <Card key={d.id} className="p-5">
            <div className="flex items-start gap-3 flex-wrap">
              <Avatar initials={d.initials} className="w-11 h-11" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{d.customer}</p>
                  <Badge tone="grey">{d.kind}</Badge>
                  <Badge tone={d.status === "open" ? "red" : "green"}>
                    {d.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-ink-400 mt-0.5">
                  {d.ref} · against {d.against} · <TimeAgo iso={d.at} />
                </p>
                <p className="text-sm text-ink-600 mt-2.5 leading-relaxed">
                  {d.summary}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] uppercase tracking-wide font-semibold text-ink-400">
                  In question
                </p>
                <p className="text-lg font-bold">{money(d.amount)}</p>
              </div>
            </div>

            {d.status === "open" ? (
              <div className="flex gap-2 mt-4 pt-4 border-t border-ink-100 flex-wrap">
                <Button
                  onClick={() =>
                    setList((l) =>
                      l.map((x) =>
                        x.id === d.id ? { ...x, status: "resolved" } : x,
                      ),
                    )
                  }
                  variant="dark"
                  size="sm"
                >
                  Refund customer
                </Button>
                <Button
                  onClick={() =>
                    setList((l) =>
                      l.map((x) =>
                        x.id === d.id ? { ...x, status: "resolved" } : x,
                      ),
                    )
                  }
                  variant="outline"
                  size="sm"
                >
                  Side with transporter
                </Button>
                <Button variant="ghost" size="sm">
                  <Icon name="chat" className="w-4 h-4" />
                  Message both
                </Button>
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
