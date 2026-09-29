"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, Logo } from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";
import { useStore } from "@/lib/store";

export type NavLink = { href: string; label: string; icon: IconName };

export function DashShell({
  nav,
  product,
  user,
  children,
}: {
  nav: NavLink[];
  product: string;
  user: { name: string; initials: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useStore();
  const [open, setOpen] = useState(false);

  const links = (
    <nav className="space-y-1">
      {nav.map((l) => {
        const active =
          l.href === pathname ||
          (l.href !== nav[0].href && pathname.startsWith(`${l.href}/`));
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              active
                ? "bg-brand-400 text-ink-900"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon name={l.icon} className="w-[18px] h-[18px]" />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-ink-50 lg:flex">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-ink-900 p-4 sticky top-0 h-dvh">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <Logo size="sm" />
          <div className="min-w-0">
            <p className="text-white font-bold leading-tight">RushBox</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
              {product}
            </p>
          </div>
        </div>
        <div className="mt-6 flex-1">{links}</div>
        <div className="border-t border-white/10 pt-3 mt-3">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <Avatar initials={user.initials} className="w-9 h-9" />
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-white/40 truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => {
              signOut();
              router.replace("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10"
          >
            <Icon name="logout" className="w-[18px] h-[18px]" />
            Sign out
          </button>
        </div>
      </aside>

      <header className="lg:hidden sticky top-0 z-40 bg-ink-900 text-white safe-top">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="-ml-2 p-2 rounded-lg hover:bg-white/10"
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
          <Logo size="sm" />
          <div className="min-w-0 flex-1">
            <p className="font-bold leading-tight">RushBox</p>
            <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
              {product}
            </p>
          </div>
          <Avatar initials={user.initials} className="w-9 h-9" />
        </div>
        {open ? (
          <div className="px-4 pb-4 border-t border-white/10 pt-3">{links}</div>
        ) : null}
      </header>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

export function PageHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {sub ? <p className="text-sm text-ink-500 mt-0.5">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function TableCard({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/60">
              {head.map((h) => (
                <th
                  key={h}
                  className="text-left font-semibold text-[11px] uppercase tracking-wide text-ink-500 px-4 py-3 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
