"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Badge, Card, Rating, TopBar } from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";

const ROWS: { href: string; icon: IconName; label: string; sub: string }[] = [
  { href: "/driver/earnings", icon: "wallet", label: "Earnings & payouts", sub: "Cash out to EcoCash" },
  { href: "/driver/onboarding", icon: "shield", label: "Documents", sub: "Verification status" },
  { href: "/driver/active", icon: "truck", label: "Current job", sub: "Navigate and update status" },
  { href: "/support", icon: "chat", label: "Support", sub: "Get help with a trip" },
];

export default function DriverProfile() {
  const { signOut } = useStore();
  const router = useRouter();

  return (
    <div>
      <TopBar title="Account" />

      <main className="px-5 py-5 space-y-5">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <Avatar initials="TM" className="w-16 h-16 text-lg" />
            <div className="min-w-0">
              <p className="font-bold text-lg leading-tight">Tendai Moyo</p>
              <p className="text-sm text-ink-500">+263 77 234 5566</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge tone="green">
                  <Icon name="check" className="w-3 h-3" strokeWidth={3} />
                  Verified
                </Badge>
                <Rating value={4.8} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-ink-100 text-center">
            <Metric value="212" label="Trips" />
            <Metric value={money(1840)} label="Earned" />
            <Metric value="92%" label="Acceptance" />
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-ink-50 flex items-center justify-center text-xl shrink-0">
            🛻
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Toyota Hilux</p>
            <p className="text-xs text-ink-500">Bakkie · up to 1 tonne · AEB 4821</p>
          </div>
          <button className="text-xs font-semibold text-brand-600 shrink-0">
            Change
          </button>
        </Card>

        <Card className="divide-y divide-ink-100 overflow-hidden">
          {ROWS.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="flex items-center gap-3 p-4 hover:bg-ink-50"
            >
              <span className="w-9 h-9 rounded-xl bg-ink-100 text-ink-600 flex items-center justify-center shrink-0">
                <Icon name={r.icon} className="w-[18px] h-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{r.label}</span>
                <span className="block text-[11px] text-ink-400">{r.sub}</span>
              </span>
              <Icon name="chevron" className="w-4 h-4 text-ink-300 shrink-0" />
            </Link>
          ))}
        </Card>

        <button
          onClick={() => {
            signOut();
            router.replace("/");
          }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-ink-200 text-sm font-semibold text-red-500 hover:bg-red-50"
        >
          <Icon name="logout" className="w-4 h-4" />
          Sign out
        </button>
      </main>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-bold text-lg tabular-nums">{value}</p>
      <p className="text-[11px] text-ink-400">{label}</p>
    </div>
  );
}
