"use client";

import { BottomNav, MobileShell } from "@/components/MobileShell";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileShell>
      <div className="pb-24 min-h-dvh">{children}</div>
      <BottomNav
        items={[
          { href: "/driver", label: "Jobs", icon: "zap" },
          { href: "/driver/active", label: "Active", icon: "truck" },
          { href: "/driver/earnings", label: "Earnings", icon: "wallet" },
          { href: "/driver/onboarding", label: "Verify", icon: "shield" },
          { href: "/driver/profile", label: "Account", icon: "user" },
        ]}
      />
    </MobileShell>
  );
}
