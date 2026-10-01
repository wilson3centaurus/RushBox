"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Logo } from "@/components/ui";
import { Icon } from "@/components/icons";
import { MobileShell } from "@/components/MobileShell";
import { useStore } from "@/lib/store";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-white" />}>
      <Verify />
    </Suspense>
  );
}

function Verify() {
  const params = useSearchParams();
  const router = useRouter();
  const { signIn } = useStore();
  const phone = params.get("phone") ?? "+263 77 123 4567";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(45);
  const [busy, setBusy] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const complete = code.every((d) => d !== "");

  function setDigit(i: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((c) => {
      const next = [...c];
      next[i] = digit;
      return next;
    });
    if (digit && i < 5) inputs.current[i + 1]?.focus();
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[i] && i > 0) inputs.current[i - 1]?.focus();
  }

  function onPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    setCode(Array.from({ length: 6 }, (_, i) => text[i] ?? ""));
    inputs.current[Math.min(text.length, 5)]?.focus();
  }

  function verify() {
    if (!complete) return;
    setBusy(true);
    // Any 6 digits is accepted until real OTP delivery is wired up.
    setTimeout(() => {
      signIn(phone, "customer");
      router.replace("/home");
    }, 700);
  }

  return (
    <MobileShell>
      <div className="min-h-dvh flex flex-col bg-white px-6 pt-6 safe-top">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="-ml-2 p-2 rounded-full hover:bg-ink-100 w-fit"
        >
          <Icon name="back" />
        </button>

        <div className="mt-6 animate-fade-up">
          <div className="flex flex-col items-center text-center">
            <Logo size="lg" />
            <h1 className="text-2xl font-bold mt-6">Enter the code</h1>
            <p className="text-ink-500 mt-1.5 text-sm">
              Sent to <span className="font-semibold text-ink-800">{phone}</span>
            </p>
          </div>

          <div className="flex gap-2 mt-7" onPaste={onPaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                value={digit}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                inputMode="numeric"
                autoFocus={i === 0}
                aria-label={`Digit ${i + 1}`}
                className={`flex-1 aspect-square min-w-0 text-center text-2xl font-bold rounded-xl border transition ${
                  digit
                    ? "border-brand-400 bg-brand-50 text-ink-900"
                    : "border-ink-200 text-ink-900"
                } focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent`}
              />
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-ink-50 border border-ink-100 px-4 py-3">
            <p className="text-xs text-ink-500">
              <span className="font-semibold text-ink-700">Demo mode:</span> SMS
              isn&apos;t wired up yet — any 6 digits will sign you in.
            </p>
          </div>

          <Button
            onClick={verify}
            disabled={!complete || busy}
            variant="primary"
            size="lg"
            full
            className="mt-5"
          >
            {busy ? "Verifying…" : "Verify & continue"}
          </Button>

          <p className="text-center text-sm text-ink-500 mt-5">
            {seconds > 0 ? (
              <>
                Resend code in{" "}
                <span className="font-semibold text-ink-800 tabular-nums">
                  0:{String(seconds).padStart(2, "0")}
                </span>
              </>
            ) : (
              <button
                onClick={() => setSeconds(45)}
                className="font-semibold text-brand-500 hover:underline"
              >
                Resend code
              </button>
            )}
          </p>
        </div>
      </div>
    </MobileShell>
  );
}
