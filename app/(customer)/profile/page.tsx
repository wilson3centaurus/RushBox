"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Badge, Card, TopBar } from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import { STATUS_COPY } from "@/lib/verification";

const ACCOUNT: { href: string; icon: IconName; label: string; sub: string }[] = [
  { href: "/orders", icon: "orders", label: "Your orders", sub: "Groceries & medicine" },
  { href: "/move", icon: "truck", label: "Your trips", sub: "Cargo, parcels, errands" },
  { href: "/wallet", icon: "wallet", label: "Wallet & payments", sub: "EcoCash, cards, balance" },
  { href: "/addresses", icon: "pin", label: "Saved addresses", sub: "Home, work and more" },
  { href: "/support", icon: "chat", label: "Help & support", sub: "We reply in minutes" },
];

const STAFF: { href: string; icon: IconName; label: string; sub: string }[] = [
  { href: "/driver", icon: "truck", label: "Transporter app", sub: "Bid on jobs and earn" },
  { href: "/ops", icon: "store", label: "Dark store ops", sub: "Pick, pack and dispatch" },
  { href: "/admin", icon: "chart", label: "Admin dashboard", sub: "Full control panel" },
];

export default function Profile() {
  const { user, orders, jobs, signOut, verification } = useStore();
  const router = useRouter();
  const spent = orders.reduce((s, o) => s + o.total, 0);
  const status = verification?.status ?? "unverified";

  return (
    <div>
      <TopBar
        title="Account"
        right={
          user ? (
            <Link href="/profile/edit" className="text-sm font-semibold text-brand-600 px-2 py-1">
              Edit
            </Link>
          ) : null
        }
      />

      <main className="px-5 py-5 space-y-5">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <Link href="/profile/edit" className="relative shrink-0" aria-label="Edit profile">
              <Avatar
                initials={user?.initials ?? "G"}
                src={user?.avatar}
                className="w-16 h-16 text-lg"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white border border-ink-200 text-ink-600 flex items-center justify-center">
                <Icon name="camera" className="w-3.5 h-3.5" />
              </span>
            </Link>
            <div className="min-w-0">
              <p className="font-bold text-lg leading-tight truncate">
                {user?.name ?? "Guest"}
              </p>
              <p className="text-sm text-ink-500">
                {user?.phone ?? "Not signed in"}
              </p>
              <Link href="/profile/verify" className="inline-block mt-1.5">
                {status === "verified" ? (
                  <Badge tone="green">
                    <Icon name="shield" className="w-3 h-3" />
                    Verified
                  </Badge>
                ) : status === "unverified" ? (
                  <Badge tone="brand">Verify your ID →</Badge>
                ) : (
                  <Badge tone={STATUS_COPY[status].tone}>ID: {STATUS_COPY[status].label}</Badge>
                )}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-ink-100 text-center">
            <Metric value={String(orders.length)} label="Orders" />
            <Metric value={String(jobs.length)} label="Trips" />
            <Metric value={money(spent)} label="Spent" />
          </div>
        </Card>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2 px-1">
            Your details
          </h2>
          <Card className="divide-y divide-ink-100 overflow-hidden">
            <Row href="/profile/edit" icon="edit" label="Edit profile" sub="Name, photo and email" />
            <Row href="/profile/phone" icon="phone" label="Phone number" sub={user?.phone ?? "—"} />
            <Row
              href="/profile/verify"
              icon="id"
              label="Identity verification"
              sub={status === "unverified" ? "Optional · unlocks cash on delivery" : STATUS_COPY[status].label}
            />
          </Card>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2 px-1">
            Your activity
          </h2>
          <Card className="divide-y divide-ink-100 overflow-hidden">
            {ACCOUNT.map((r) => (
              <Row key={r.href} {...r} />
            ))}
          </Card>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2 px-1">
            Staff & partner apps
          </h2>
          <Card className="divide-y divide-ink-100 overflow-hidden">
            {STAFF.map((r) => (
              <Row key={r.href} {...r} />
            ))}
          </Card>
          <p className="text-[11px] text-ink-400 mt-2 px-1 leading-relaxed">
            Visible here during the demo. In production these are gated by role
            and never shown to a customer account.
          </p>
        </section>

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

        <p className="text-center text-[11px] text-ink-300">
          RushBox v0.2.0 ·{" "}
          <Link href="/credits" className="underline">
            Photo credits
          </Link>
        </p>
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

function Row({
  href,
  icon,
  label,
  sub,
}: {
  href: string;
  icon: IconName;
  label: string;
  sub: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 p-4 hover:bg-ink-50">
      <span className="w-9 h-9 rounded-xl bg-ink-100 text-ink-600 flex items-center justify-center shrink-0">
        <Icon name={icon} className="w-[18px] h-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-[11px] text-ink-400">{sub}</span>
      </span>
      <Icon name="chevron" className="w-4 h-4 text-ink-300 shrink-0" />
    </Link>
  );
}
