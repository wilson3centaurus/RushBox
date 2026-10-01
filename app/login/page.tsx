"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Logo } from "@/components/ui";
import { Icon } from "@/components/icons";
import { MobileShell } from "@/components/MobileShell";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

const DEMO_ROLES: { role: Role; label: string; desc: string; href: string }[] = [
  { role: "transporter", label: "Transporter", desc: "Bid on jobs, earn", href: "/driver" },
  { role: "ops", label: "Dark store", desc: "Pick, pack, dispatch", href: "/ops" },
  { role: "admin", label: "Admin", desc: "Full control panel", href: "/admin" },
];

export default function Login() {
  const [local, setLocal] = useState("");
  const router = useRouter();
  const { signIn } = useStore();

  const digits = local.replace(/\D/g, "").replace(/^0+/, "").slice(0, 9);
  const valid = digits.length >= 9;
  const phone = `+263 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`.trim();

  function submit() {
    if (!valid) return;
    router.push(`/verify?phone=${encodeURIComponent(phone)}`);
  }

  function demoAs(role: Role, href: string) {
    signIn("+263 77 123 4567", role);
    router.push(href);
  }

  return (
    <MobileShell>
      <div className="min-h-dvh flex flex-col bg-white px-6 pt-6 safe-top">
        <button
          onClick={() => router.push("/")}
          aria-label="Go back"
          className="-ml-2 p-2 rounded-full hover:bg-ink-100 w-fit"
        >
          <Icon name="back" />
        </button>

        <div className="mt-6 animate-fade-up">
          <div className="flex flex-col items-center text-center">
            <Logo size="lg" />
            <h1 className="text-2xl font-bold mt-6">Enter your number</h1>
            <p className="text-ink-500 mt-1.5 text-sm">
              We&apos;ll text you a code to sign in. No password needed.
            </p>
          </div>

          <div className="mt-7 flex items-stretch rounded-2xl border border-ink-200 focus-within:ring-2 focus-within:ring-brand-400 focus-within:border-transparent overflow-hidden">
            <span className="flex items-center gap-1.5 px-4 bg-ink-50 border-r border-ink-200 font-semibold text-ink-700">
              🇿🇼 +263
            </span>
            <input
              type="tel"
              inputMode="numeric"
              autoFocus
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="77 123 4567"
              className="flex-1 min-w-0 px-4 py-4 text-lg tracking-wide outline-none"
            />
          </div>

          <Button
            onClick={submit}
            disabled={!valid}
            variant="primary"
            size="lg"
            full
            className="mt-5"
          >
            Continue
          </Button>

          <p className="text-[11px] text-ink-400 text-center mt-4 leading-relaxed">
            By continuing you agree to RushBox&apos;s Terms of Service and
            Privacy Policy.
          </p>
        </div>

        <div className="mt-auto pb-8">
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-ink-100" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
              Demo shortcuts
            </span>
            <div className="h-px flex-1 bg-ink-100" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => demoAs(r.role, r.href)}
                className="rounded-xl border border-ink-200 p-3 text-left hover:bg-ink-50 active:scale-[0.98] transition"
              >
                <p className="text-xs font-semibold text-ink-800">{r.label}</p>
                <p className="text-[10px] text-ink-400 mt-0.5 leading-tight">
                  {r.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
