"use client";

import { DashShell } from "@/components/DashShell";

export default function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashShell
      product="Store ops"
      user={{ name: "Tinashe S.", initials: "TS", role: "RushBox Msasa" }}
      nav={[
        { href: "/ops", label: "Fulfilment", icon: "package" },
        { href: "/ops/inventory", label: "Inventory", icon: "store" },
        { href: "/ops/riders", label: "Riders", icon: "bike" },
      ]}
    >
      {children}
    </DashShell>
  );
}
