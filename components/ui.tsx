"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-20 h-20" }[size];
  const icon = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" }[size];
  return (
    <div className={`${box} relative shrink-0`}>
      <div className="absolute inset-0 rounded-[28%] bg-brand-300 rotate-12" />
      <div className="absolute inset-0 rounded-[28%] bg-brand-400 flex items-center justify-center text-ink-900 shadow-lg shadow-brand-400/30">
        <Icon name="zap" className={icon} />
      </div>
    </div>
  );
}

export function Button({
  children,
  onClick,
  href,
  variant = "primary",
  size = "md",
  disabled,
  type = "button",
  className = "",
  full,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "dark" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  full?: boolean;
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2.5 text-sm rounded-xl",
    lg: "px-5 py-3.5 text-base rounded-2xl",
  }[size];

  const variants = {
    primary:
      "bg-brand-400 text-ink-900 font-semibold hover:bg-brand-300 active:scale-[0.98] shadow-sm shadow-brand-400/30",
    dark: "bg-ink-900 text-white font-semibold hover:bg-ink-800 active:scale-[0.98]",
    ghost: "text-ink-700 font-medium hover:bg-ink-100 active:scale-[0.98]",
    outline:
      "border border-ink-200 bg-white text-ink-800 font-medium hover:bg-ink-50 active:scale-[0.98]",
    danger: "bg-red-500 text-white font-semibold hover:bg-red-600 active:scale-[0.98]",
  }[variant];

  const cls = `inline-flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none ${sizes} ${variants} ${full ? "w-full" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-ink-100 ${onClick ? "cursor-pointer active:scale-[0.99] transition-transform" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

const TONES = {
  brand: "bg-brand-100 text-brand-700",
  green: "bg-emerald-100 text-emerald-700",
  blue: "bg-sky-100 text-sky-700",
  grey: "bg-ink-100 text-ink-600",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-700",
};

export function Badge({
  children,
  tone = "grey",
  className = "",
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function TopBar({
  title,
  subtitle,
  back,
  right,
  dark,
}: {
  title: string;
  subtitle?: React.ReactNode;
  back?: boolean | string;
  right?: React.ReactNode;
  dark?: boolean;
}) {
  const router = useRouter();
  return (
    <header
      className={`sticky top-0 z-30 safe-top ${dark ? "bg-ink-900 text-white" : "bg-white/95 backdrop-blur border-b border-ink-100 text-ink-900"}`}
    >
      <div className="flex items-center gap-3 px-4 h-14">
        {back ? (
          <button
            onClick={() =>
              typeof back === "string" ? router.push(back) : router.back()
            }
            aria-label="Go back"
            className={`-ml-2 p-2 rounded-full ${dark ? "hover:bg-white/10" : "hover:bg-ink-100"}`}
          >
            <Icon name="back" />
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold leading-tight truncate">{title}</h1>
          {subtitle ? (
            <p
              className={`text-xs truncate ${dark ? "text-white/60" : "text-ink-500"}`}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {right}
      </div>
    </header>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center px-8 py-16">
      <div className="w-16 h-16 rounded-2xl bg-ink-100 text-ink-400 flex items-center justify-center mb-4">
        <Icon name={icon} className="w-7 h-7" />
      </div>
      <h3 className="font-semibold text-ink-800">{title}</h3>
      <p className="text-sm text-ink-500 mt-1 max-w-xs">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink-700">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-ink-400">{hint}</span> : null}
    </label>
  );
}

const inputCore =
  "rounded-xl border border-ink-200 bg-white text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition";

export const inputClass = `w-full px-4 py-3 ${inputCore}`;

/** No width or vertical padding, so callers can size it inside a flex row. */
export const inputCompact = `px-3 py-2.5 ${inputCore}`;

export function Stat({
  label,
  value,
  delta,
  icon,
  tone = "brand",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: IconName;
  tone?: keyof typeof TONES;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <span className={`p-2 rounded-lg ${TONES[tone]}`}>
          <Icon name={icon} className="w-4 h-4" />
        </span>
        {delta ? (
          <span className="text-xs font-semibold text-emerald-600">{delta}</span>
        ) : null}
      </div>
      <p className="text-2xl font-bold text-ink-900 mt-3 tabular-nums">{value}</p>
      <p className="text-xs text-ink-500 mt-0.5">{label}</p>
    </Card>
  );
}

export function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-700">
      <Icon name="star" className="w-3.5 h-3.5 text-brand-400" />
      {value.toFixed(1)}
    </span>
  );
}

export function Avatar({
  initials,
  className = "w-10 h-10",
}: {
  initials: string;
  className?: string;
}) {
  return (
    <div
      className={`${className} rounded-full bg-ink-900 text-white font-semibold flex items-center justify-center text-sm shrink-0`}
    >
      {initials}
    </div>
  );
}
