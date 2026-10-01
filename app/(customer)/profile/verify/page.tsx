"use client";

import { Card, TopBar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { VerificationForm } from "@/components/VerificationForm";
import { useStore } from "@/lib/store";

const PERKS = [
  "Pay cash on delivery for bigger orders",
  "Use Buy-For-Me and pay the runner in cash",
  "A verified badge drivers can see on your orders",
  "Faster help if something goes wrong",
];

export default function VerifyIdentity() {
  const { verification } = useStore();

  return (
    <div>
      <TopBar title="Verify your identity" back="/profile" />

      <main className="px-5 py-5 space-y-4 pb-10">
        {verification?.status !== "verified" ? (
          <Card className="p-4">
            <p className="text-sm font-semibold">Why verify?</p>
            <ul className="mt-2.5 space-y-2">
              {PERKS.map((perk) => (
                <li key={perk} className="flex gap-2.5 text-sm text-ink-600">
                  <Icon name="check" className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.4} />
                  {perk}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        <VerificationForm />
      </main>
    </div>
  );
}
