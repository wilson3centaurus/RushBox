"use client";

import { CustomerNav, MobileShell } from "@/components/MobileShell";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileShell>
      <div className="pb-24 min-h-dvh">{children}</div>
      <CustomerNav />
    </MobileShell>
  );
}
