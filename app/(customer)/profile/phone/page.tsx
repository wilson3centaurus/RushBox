"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, TopBar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { useStore } from "@/lib/store";

function formatZw(digits: string) {
  return `+263 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`.trim();
}

/**
 * Two steps, like sign-in: the new number has to receive a code before it
 * replaces the old one, or a typo would lock the user out of their account.
 *
 * Demo mode accepts any six digits. With Supabase phone auth this becomes
 * auth.updateUser({ phone }) and then verifyOtp({ type: "phone_change" }).
 */
export default function ChangePhone() {
  const { user, updateProfile } = useStore();
  const router = useRouter();
  const [local, setLocal] = useState("");
  const [step, setStep] = useState<"number" | "code" | "done">("number");
  const [code, setCode] = useState("");

  const digits = local.replace(/\D/g, "").replace(/^0+/, "").slice(0, 9);
  const phone = formatZw(digits);
  const same = user?.phone.replace(/\D/g, "") === `263${digits}`;
  const validNumber = digits.length === 9 && !same;

  function confirm() {
    if (code.length !== 6) return;
    updateProfile({ phone });
    setStep("done");
    setTimeout(() => router.push("/profile/edit"), 900);
  }

  return (
    <div>
      <TopBar title="Change number" back="/profile/edit" />

      <main className="px-5 py-6 space-y-5">
        {step === "number" ? (
          <>
            <div>
              <h1 className="text-xl font-bold">Your new number</h1>
              <p className="text-sm text-ink-500 mt-1">
                Currently <span className="font-semibold text-ink-800">{user?.phone}</span>. We&apos;ll
                text a code to the new number to confirm it&apos;s yours.
              </p>
            </div>
            <div className="flex items-stretch rounded-2xl border border-ink-200 bg-white focus-within:ring-2 focus-within:ring-brand-400 focus-within:border-transparent overflow-hidden">
              <span className="flex items-center gap-1.5 px-4 bg-ink-50 border-r border-ink-200 font-semibold text-ink-700">
                🇿🇼 +263
              </span>
              <input
                type="tel"
                inputMode="numeric"
                autoFocus
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && validNumber && setStep("code")}
                placeholder="77 123 4567"
                className="flex-1 min-w-0 px-4 py-4 text-lg tracking-wide outline-none"
              />
            </div>
            {same ? <p className="text-xs text-amber-700">That&apos;s already your number.</p> : null}
            <Button onClick={() => setStep("code")} disabled={!validNumber} variant="primary" size="lg" full>
              Send code
            </Button>
          </>
        ) : step === "code" ? (
          <>
            <div>
              <h1 className="text-xl font-bold">Enter the code</h1>
              <p className="text-sm text-ink-500 mt-1">
                Sent to <span className="font-semibold text-ink-800">{phone}</span>.{" "}
                <button onClick={() => setStep("number")} className="font-semibold text-brand-600">
                  Wrong number?
                </button>
              </p>
            </div>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && confirm()}
              placeholder="••••••"
              className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-4 text-center text-2xl tracking-[0.5em] font-semibold outline-none focus:ring-2 focus:ring-brand-400"
            />
            <p className="text-[11px] text-ink-400 text-center">Demo: any 6 digits work.</p>
            <Button onClick={confirm} disabled={code.length !== 6} variant="primary" size="lg" full>
              Confirm new number
            </Button>
          </>
        ) : (
          <Card className="p-6 text-center">
            <span className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center">
              <Icon name="check" className="w-7 h-7" strokeWidth={2.6} />
            </span>
            <p className="font-semibold mt-3">Number updated</p>
            <p className="text-sm text-ink-500 mt-1">Sign in with {phone} from now on.</p>
          </Card>
        )}
      </main>
    </div>
  );
}
