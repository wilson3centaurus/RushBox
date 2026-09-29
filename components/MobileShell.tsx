"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
import { useStore } from "@/lib/store";

export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[520px] bg-ink-50 shadow-xl shadow-black/5">
      {children}
    </div>
  );
}

type NavItem = { href: string; label: string; icon: IconName; badge?: number };

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 mx-auto max-w-[520px] border-t border-ink-100 bg-white/95 backdrop-blur safe-bottom">
      <div className="grid grid-cols-5 pt-1.5">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1.5 transition-colors ${active ? "text-brand-500" : "text-ink-400"}`}
            >
              <span className="relative">
                <Icon
                  name={item.icon}
                  className="w-[22px] h-[22px]"
                  strokeWidth={active ? 2.1 : 1.7}
                />
                {item.badge ? (
                  <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                ) : null}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function CustomerNav() {
  const { cartCount } = useStore();
  return (
    <BottomNav
      items={[
        { href: "/home", label: "Home", icon: "home" },
        { href: "/groceries", label: "Shop", icon: "bag" },
        { href: "/move", label: "Move", icon: "truck" },
        { href: "/cart", label: "Cart", icon: "cart", badge: cartCount },
        { href: "/profile", label: "Account", icon: "user" },
      ]}
    />
  );
}
