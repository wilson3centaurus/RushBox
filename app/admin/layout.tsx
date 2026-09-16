"use client";

import { DashShell } from "@/components/DashShell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashShell
      product="Admin"
      user={{ name: "Wilson Sedze", initials: "WS", role: "Super admin" }}
      nav={[
        { href: "/admin", label: "Overview", icon: "chart" },
        { href: "/admin/orders", label: "Orders & jobs", icon: "orders" },
        { href: "/admin/transporters", label: "Transporters", icon: "truck" },
        { href: "/admin/users", label: "Customers", icon: "users" },
        { href: "/admin/inventory", label: "Inventory", icon: "store" },
        { href: "/admin/pricing", label: "Pricing & fees", icon: "tag" },
        { href: "/admin/disputes", label: "Disputes", icon: "flag" },
      ]}
    >
      {children}
    </DashShell>
  );
}
