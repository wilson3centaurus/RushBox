"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, LogoLockup } from "@/components/ui";
import { Icon } from "@/components/icons";
import { MobileShell } from "@/components/MobileShell";
import { useStore } from "@/lib/store";

const HOME_BY_ROLE = {
  customer: "/home",
  transporter: "/driver",
  ops: "/ops",
  admin: "/admin",
} as const;

export default function Welcome() {
  const { user, ready } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && user) router.replace(HOME_BY_ROLE[user.role]);
  }, [ready, user, router]);

  return (
    <MobileShell>
      <div className="brand-gradient min-h-dvh flex flex-col px-6 py-10 safe-top text-white relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/10" />
        <div className="absolute top-40 -left-24 w-72 h-72 rounded-full border border-white/10" />

        <div className="relative flex-1 flex flex-col justify-center animate-fade-up">
          <h1 className="sr-only">RushBox</h1>
          <LogoLockup width={224} />
          <p className="text-white/70 text-lg mt-5 leading-snug">
            Everything you need, delivered.
            <br />
            Everything you have, moved.
          </p>

          <div className="mt-10 space-y-3">
            <Feature
              icon="bag"
              title="Groceries & medicine in 30 min"
              body="Straight from our own RushBox stores near you."
            />
            <Feature
              icon="truck"
              title="Move anything, at your price"
              body="Post the job, drivers bid, you pick the best offer."
            />
            <Feature
              icon="receipt"
              title="Buy-for-me errands"
              body="Send someone to buy it and bring it to your door."
            />
          </div>
        </div>

        <div className="relative space-y-3 pb-2">
          <Button href="/login" variant="primary" size="lg" full>
            Get started
            <Icon name="chevron" className="w-4 h-4" />
          </Button>
          <Link
            href="/login"
            className="block text-center text-sm text-white/70 py-2"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </MobileShell>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: "bag" | "truck" | "receipt";
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3.5 items-start">
      <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-300 shrink-0">
        <Icon name={icon} />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-[15px] leading-tight">{title}</p>
        <p className="text-sm text-white/60 mt-0.5 leading-snug">{body}</p>
      </div>
    </div>
  );
}
