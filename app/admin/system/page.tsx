"use client";

import { PageHead } from "@/components/DashShell";
import { SystemMap } from "@/components/system-map";

export default function SystemPage() {
  return (
    <div className="p-5 lg:p-8">
      <PageHead
        title="How RushBox works"
        sub="An interactive map of everyone involved, every flow of goods and money, and the apps they use"
      />
      <SystemMap />
    </div>
  );
}
