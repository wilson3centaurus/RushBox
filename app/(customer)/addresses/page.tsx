"use client";

import { Badge, Button, Card, TopBar } from "@/components/ui";
import { Icon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { Emoji } from "@/components/Emoji";

const SAVED = [
  { id: "a1", label: "Home", address: "14 Fife Ave, Harare CBD", note: "Flat 3B, blue gate", emoji: "🏠" },
  { id: "a2", label: "Work", address: "27 Kelvin Road North, Graniteside", note: "Ask for reception", emoji: "🏢" },
  { id: "a3", label: "Mum's place", address: "Chitungwiza, Unit L", note: "", emoji: "📍" },
];

export default function Addresses() {
  const { address, setAddress } = useStore();

  return (
    <div>
      <TopBar title="Saved addresses" back="/profile" />

      <main className="px-5 py-5 space-y-4">
        <Button variant="outline" full size="lg">
          <Icon name="plus" className="w-4 h-4" strokeWidth={2.4} />
          Add a new address
        </Button>

        <div className="space-y-2">
          {SAVED.map((a) => {
            const active = a.address === address;
            return (
              <Card
                key={a.id}
                onClick={() => setAddress(a.address)}
                className={`p-4 flex items-start gap-3 ${active ? "border-brand-300 bg-brand-50/60" : ""}`}
              >
                <span className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center shrink-0">
                  <Emoji char={a.emoji} className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{a.label}</p>
                    {active ? <Badge tone="brand">Delivering here</Badge> : null}
                  </div>
                  <p className="text-xs text-ink-500 mt-0.5">{a.address}</p>
                  {a.note ? (
                    <p className="text-[11px] text-ink-400 mt-0.5">{a.note}</p>
                  ) : null}
                </div>
                <button
                  aria-label={`Edit ${a.label}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 shrink-0"
                >
                  <Icon name="settings" className="w-4 h-4" />
                </button>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
