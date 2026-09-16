"use client";

import { useState } from "react";
import { money } from "@/lib/format";

export const SERIES = {
  groceries: "#2a78d6",
  move: "#eb6834",
};

type Point = { label: string; groceries: number; move: number };

/**
 * Two-series line chart with a hover crosshair. Series colours are the validated
 * categorical slots 1 and 2; all text stays on ink tokens so identity is carried
 * by the marks and the legend, never by coloured type.
 */
export function TrendChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 640;
  const H = 220;
  const PAD = { top: 16, right: 16, bottom: 28, left: 44 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const max = Math.max(...data.flatMap((d) => [d.groceries, d.move])) * 1.15;
  const x = (i: number) => PAD.left + (i / (data.length - 1)) * plotW;
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;

  const path = (key: "groceries" | "move") =>
    data.map((d, i) => `${i ? "L" : "M"}${x(i)} ${y(d[key])}`).join(" ");

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const active = hover ?? data.length - 1;

  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        {(
          [
            ["groceries", "Groceries"],
            ["move", "Move"],
          ] as const
        ).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: SERIES[key] }}
            />
            <span className="text-xs font-medium text-ink-600">{label}</span>
          </span>
        ))}
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          onMouseLeave={() => setHover(null)}
          role="img"
          aria-label="Daily revenue by service line"
        >
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                y1={y(t)}
                x2={W - PAD.right}
                y2={y(t)}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 8}
                y={y(t) + 4}
                textAnchor="end"
                className="fill-ink-400"
                fontSize="10"
              >
                ${t}
              </text>
            </g>
          ))}

          {data.map((d, i) => (
            <text
              key={d.label}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-ink-400"
              fontSize="10"
            >
              {d.label}
            </text>
          ))}

          {hover !== null ? (
            <line
              x1={x(hover)}
              y1={PAD.top}
              x2={x(hover)}
              y2={PAD.top + plotH}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ) : null}

          <path
            d={path("groceries")}
            fill="none"
            stroke={SERIES.groceries}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={path("move")}
            fill="none"
            stroke={SERIES.move}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {(["groceries", "move"] as const).map((key) => (
            <circle
              key={key}
              cx={x(active)}
              cy={y(data[active][key])}
              r="5"
              fill={SERIES[key]}
              stroke="#fff"
              strokeWidth="2"
            />
          ))}

          {data.map((_, i) => (
            <rect
              key={i}
              x={x(i) - plotW / (data.length - 1) / 2}
              y={PAD.top}
              width={plotW / (data.length - 1)}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>

        <div className="flex items-center justify-center gap-5 mt-2 text-xs">
          <span className="text-ink-500">{data[active].label}</span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: SERIES.groceries }}
            />
            <span className="font-semibold text-ink-800 tabular-nums">
              {money(data[active].groceries)}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: SERIES.move }}
            />
            <span className="font-semibold text-ink-800 tabular-nums">
              {money(data[active].move)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/** Single-series magnitude-by-identity bars — direct-labelled, so no legend. */
export function BarList({
  data,
  unit = "",
}: {
  data: { label: string; value: number }[];
  unit?: string;
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-xs text-ink-600 truncate">
            {d.label}
          </span>
          <div className="flex-1 h-5 rounded bg-ink-100 overflow-hidden">
            <div
              className="h-full rounded"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: SERIES.groceries,
              }}
            />
          </div>
          <span className="w-14 shrink-0 text-right text-xs font-semibold text-ink-800 tabular-nums">
            {unit}
            {d.value}
          </span>
        </div>
      ))}
    </div>
  );
}
