"use client";

import { Card, TopBar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { VerificationForm } from "@/components/VerificationForm";
import { useStore } from "@/lib/store";

const STEPS = [
  { title: "National ID", body: "Front and back, so we know who is carrying customers' goods." },
  { title: "Driver's licence", body: "Valid for the vehicle you drive." },
  { title: "Your vehicle", body: "A photo with the plate showing, and the registration book." },
];

export default function Onboarding() {
  const { verification } = useStore();
  const status = verification?.status ?? "unverified";

  return (
    <div>
      <TopBar
        title="Get verified"
        subtitle={status === "verified" ? "You can bid on jobs" : "Required before you can bid"}
      />

      <main className="px-5 py-5 space-y-4 pb-10">
        {status === "unverified" ? (
          <Card className="p-4">
            <p className="text-sm font-semibold">Three checks, about five minutes</p>
            <ol className="mt-3 space-y-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-ink-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm">
                    <span className="font-medium">{s.title}</span>
                    <span className="block text-xs text-ink-500">{s.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        ) : null}

        <VerificationForm />

        {status === "pending" ? (
          <Card className="p-4 flex gap-3 bg-sky-50 border-sky-200">
            <Icon name="bell" className="w-5 h-5 text-sky-600 shrink-0" />
            <p className="text-xs text-sky-900 leading-relaxed">
              Demo: approve yourself from the admin dashboard under
              <span className="font-semibold"> Verifications</span>.
            </p>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
