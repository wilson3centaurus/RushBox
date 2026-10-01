"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Badge, Card } from "@/components/ui";
import { Icon } from "@/components/icons";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import { createEngine, type Engine } from "./engine";
import {
  APPS,
  CASH_STEPS,
  CHAPTERS,
  EARNINGS,
  FLOWS,
  GROCERY_STEPS,
  PLAYERS,
  moneyDetail,
  moneySlices,
  moveSteps,
  type AppId,
  type ChapterId,
  type Detail,
  type FlowKind,
  type PlayerId,
  type Step,
} from "./content";

const STEP_MS = 4200;

/** Pixels the overlays cover, so the camera frames the scene in the space left. */
function insetsFor(chapter: ChapterId) {
  const stepped = chapter === "grocery" || chapter === "move" || chapter === "cash";
  return { top: 52, bottom: stepped ? 112 : chapter === "players" ? 56 : 16 };
}

export default function SystemMap({ compact = false }: { compact?: boolean }) {
  const { pricing } = useStore();
  const holder = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const [chapter, setChapter] = useState<ChapterId>("players");
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [filter, setFilter] = useState<Record<FlowKind, boolean>>({ orders: true, goods: true, money: true });
  const [hint, setHint] = useState(true);
  const [failed, setFailed] = useState(false);
  const [asText, setAsText] = useState(false);

  const steps: Step[] | null = useMemo(
    () => (chapter === "grocery" ? GROCERY_STEPS : chapter === "move" ? moveSteps(pricing) : chapter === "cash" ? CASH_STEPS : null),
    [chapter, pricing],
  );

  // One engine per mount. Chapter, step and selection are pushed into it below;
  // the refs let a re-created engine (after the text view) pick up where it was.
  const latest = useRef({ chapter, step, filter });
  useEffect(() => {
    latest.current = { chapter, step, filter };
  });
  useEffect(() => {
    if (!holder.current || asText) return;
    let e: Engine;
    try {
      e = createEngine(holder.current, {
        pricing,
        onSelect: setSelected,
        onInteract: () => setHint(false),
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
    } catch {
      setFailed(true);
      return;
    }
    engine.current = e;
    e.setInsets(insetsFor(latest.current.chapter));
    e.setChapter(latest.current.chapter);
    e.setStep(latest.current.step);
    e.setFilter(latest.current.filter);
    return () => {
      e.dispose();
      engine.current = null;
    };
  }, [pricing, asText]);

  useEffect(() => {
    engine.current?.setInsets(insetsFor(chapter));
    engine.current?.setChapter(chapter);
    setStep(0);
    setSelected(null);
    setPlaying(false);
  }, [chapter]);

  useEffect(() => engine.current?.setStep(step), [step]);
  useEffect(() => engine.current?.select(selected), [selected]);
  useEffect(() => engine.current?.setFilter(filter), [filter]);

  useEffect(() => {
    if (!playing || !steps) return;
    if (step >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [playing, step, steps]);

  const intro = CHAPTERS.find((c) => c.id === chapter)!;
  const textOnly = failed || asText;

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setChapter(c.id)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              chapter === c.id ? "bg-ink-900 text-white" : "bg-white border border-ink-200 text-ink-600 hover:bg-ink-50"
            }`}
          >
            <span className="opacity-50 mr-1">{i + 1}</span>
            {c.label}
          </button>
        ))}
      </div>

      <div className={compact ? "space-y-3" : "grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] items-start"}>
        {textOnly ? (
          <TextVersion chapter={chapter} failed={failed} onShow3d={failed ? undefined : () => setAsText(false)} />
        ) : (
          <div
            className={`relative overflow-hidden rounded-2xl border border-ink-100 bg-[#f3f6fa] ${
              compact ? "h-[420px] lg:h-[400px]" : "h-[70vh] min-h-[460px] max-h-[780px]"
            }`}
          >
            <div ref={holder} className="absolute inset-0" />

            {hint ? (
              <div className="absolute top-3 left-3 pointer-events-none rounded-full bg-white/90 shadow px-3 py-1.5 text-[11px] font-medium text-ink-600">
                <span className="sm:hidden">Drag · pinch · tap</span>
                <span className="hidden sm:inline">Drag to turn · pinch to zoom · tap for details</span>
              </div>
            ) : null}

            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => setAsText(true)}
                className="rounded-full bg-white/90 shadow px-3 py-1.5 text-[11px] font-semibold text-ink-700 hover:bg-white"
              >
                Text version
              </button>
              <button
                onClick={() => {
                  setSelected(null);
                  engine.current?.resetView();
                }}
                aria-label="Reset view"
                className="w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-ink-700 hover:bg-white"
              >
                <Icon name="layers" className="w-4 h-4" />
              </button>
            </div>

            {chapter === "players" ? (
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                {(Object.keys(FLOWS) as FlowKind[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setFilter((f) => ({ ...f, [k]: !f[k] }))}
                    aria-pressed={filter[k]}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow transition ${
                      filter[k] ? "bg-white text-ink-800" : "bg-white/60 text-ink-400 line-through"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: FLOWS[k].color }} />
                    {FLOWS[k].label}
                  </button>
                ))}
              </div>
            ) : null}

            {steps ? (
              <StepBar
                steps={steps}
                step={step}
                playing={playing}
                onStep={(i) => {
                  setPlaying(false);
                  setStep(i);
                }}
                onPlay={() => {
                  if (step >= steps.length - 1) setStep(0);
                  setPlaying((p) => !p);
                }}
              />
            ) : null}
          </div>
        )}

        <Panel chapter={chapter} intro={intro.intro} steps={steps} step={step} selected={selected} compact={compact} />
      </div>

      {compact ? (
        <Link
          href="/admin/system"
          className="flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
        >
          Open the full system map
          <Icon name="chevron" className="w-4 h-4" />
        </Link>
      ) : null}
    </div>
  );
}

function StepBar({
  steps,
  step,
  playing,
  onStep,
  onPlay,
}: {
  steps: Step[];
  step: number;
  playing: boolean;
  onStep: (i: number) => void;
  onPlay: () => void;
}) {
  return (
    <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/95 shadow-lg px-3 py-2.5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onStep(Math.max(0, step - 1))}
          disabled={step === 0}
          aria-label="Previous step"
          className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center disabled:opacity-30"
        >
          <Icon name="back" className="w-4 h-4" />
        </button>
        <button
          onClick={onPlay}
          className="h-8 px-3 rounded-full bg-brand-400 text-ink-900 text-xs font-bold flex items-center gap-1.5 shrink-0"
        >
          {playing ? "Pause" : step >= steps.length - 1 ? "Replay" : "Play"}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">
            Step {step + 1} of {steps.length}
            {steps[step].time ? ` · ${steps[step].time}` : ""}
          </p>
          <p className="text-sm font-semibold truncate">{steps[step].title}</p>
        </div>
        <button
          onClick={() => onStep(Math.min(steps.length - 1, step + 1))}
          disabled={step >= steps.length - 1}
          aria-label="Next step"
          className="w-8 h-8 rounded-full bg-ink-900 text-white flex items-center justify-center disabled:opacity-30"
        >
          <Icon name="chevron" className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-1 mt-2">
        {steps.map((s, i) => (
          <button
            key={s.title}
            onClick={() => onStep(i)}
            aria-label={`Step ${i + 1}: ${s.title}`}
            className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-brand-400" : "bg-ink-200"}`}
          />
        ))}
      </div>
    </div>
  );
}

function Panel({
  chapter,
  intro,
  steps,
  step,
  selected,
  compact,
}: {
  chapter: ChapterId;
  intro: string;
  steps: Step[] | null;
  step: number;
  selected: string | null;
  compact: boolean;
}) {
  const { pricing } = useStore();
  let detail: Detail | null = null;
  let extra: React.ReactNode = null;

  if (steps) {
    const s = steps[step];
    detail = { ...s, tag: s.who };
  } else if (chapter === "players") {
    detail = selected && selected in PLAYERS ? PLAYERS[selected as PlayerId] : null;
  } else if (chapter === "apps") {
    detail = selected && selected in APPS ? APPS[selected as AppId] : null;
  } else if (chapter === "money") {
    const m = moneySlices(pricing);
    if (selected === "grocery" || selected === "move") {
      const slices = selected === "grocery" ? m.grocery : m.move;
      const total = selected === "grocery" ? m.groceryTotal : m.moveTotal;
      detail = {
        title: selected === "grocery" ? "A $20 grocery basket" : "The pallet job",
        tag: `Customer pays ${money(total)}`,
        body: selected === "grocery" ? "Where the money from one typical order ends up." : "One Move job, from the customer's payment to the driver's pocket.",
      };
      extra = (
        <ul className="mt-3 divide-y divide-ink-100">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center gap-2.5 py-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
              <span className="flex-1 min-w-0">
                {s.label}
                <span className="block text-[11px] text-ink-400">{s.who}</span>
              </span>
              <span className={`font-semibold tabular-nums ${s.label === "RushBox profit" ? "text-emerald-600" : ""}`}>
                {money(s.amount)}
              </span>
            </li>
          ))}
        </ul>
      );
    } else {
      detail = moneyDetail(pricing);
      extra = <DetailBlock detail={EARNINGS} />;
    }
  }

  return (
    <Card className={`p-4 ${compact ? "" : "lg:sticky lg:top-6"}`}>
      {detail ? (
        <>
          <DetailBlock detail={detail} />
          {extra}
        </>
      ) : (
        <>
          <p className="text-sm text-ink-600 leading-relaxed">{intro}</p>
          {chapter === "players" ? (
            <ul className="mt-3 grid grid-cols-2 gap-1.5">
              {(Object.keys(PLAYERS) as PlayerId[]).map((id) => (
                <li key={id} className="text-xs text-ink-600 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${id === "hq" || id === "darkstores" || id === "team" ? "bg-brand-400" : "bg-ink-300"}`} />
                  {PLAYERS[id].label}
                </li>
              ))}
            </ul>
          ) : null}
          {chapter === "apps" ? (
            <ul className="mt-3 space-y-2">
              {(["customer", "partner", "store", "admin"] as AppId[]).map((id) => (
                <li key={id} className="text-sm">
                  <span className="font-semibold">{APPS[id].label}</span>
                  <span className="text-ink-500"> — {APPS[id].sub}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-[11px] text-ink-400 mt-3">Tap anything in the map to see who it is and what they do.</p>
        </>
      )}
    </Card>
  );
}

function DetailBlock({ detail }: { detail: Detail }) {
  return (
    <div className="[&+&]:mt-5 [&+&]:pt-4 [&+&]:border-t [&+&]:border-ink-100">
      <div className="flex items-start gap-2 flex-wrap">
        <h3 className="font-semibold leading-snug">{detail.title}</h3>
        {detail.tag ? <Badge tone="brand">{detail.tag}</Badge> : null}
      </div>
      <p className="text-sm text-ink-600 mt-1.5 leading-relaxed">{detail.body}</p>
      {detail.bullets?.length ? (
        <ul className="mt-2.5 space-y-1.5">
          {detail.bullets.map((b) => (
            <li key={b} className="flex gap-2 text-sm text-ink-600">
              <Icon name="check" className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.4} />
              {b}
            </li>
          ))}
        </ul>
      ) : null}
      {detail.app ? (
        <p className="mt-3 text-xs text-ink-500">
          App: <span className="font-semibold text-ink-700">{detail.app}</span>
        </p>
      ) : null}
    </div>
  );
}

/** Same content without WebGL: for old phones, screen readers, or anyone who prefers reading. */
function TextVersion({ chapter, failed, onShow3d }: { chapter: ChapterId; failed: boolean; onShow3d?: () => void }) {
  const { pricing } = useStore();
  const items: Detail[] =
    chapter === "players"
      ? Object.values(PLAYERS)
      : chapter === "grocery"
        ? GROCERY_STEPS.map((s, i) => ({ ...s, title: `${i + 1}. ${s.title}`, tag: s.time ? `${s.who} · ${s.time}` : s.who }))
        : chapter === "move"
          ? moveSteps(pricing).map((s, i) => ({ ...s, title: `${i + 1}. ${s.title}`, tag: s.who }))
          : chapter === "cash"
            ? CASH_STEPS.map((s, i) => ({ ...s, title: `${i + 1}. ${s.title}`, tag: s.who }))
            : chapter === "apps"
              ? Object.values(APPS)
              : [moneyDetail(pricing), EARNINGS];

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-ink-500">
          {failed ? "This device can't show the 3D map, so here it is as text." : "Text version"}
        </p>
        {onShow3d ? (
          <button onClick={onShow3d} className="text-xs font-semibold text-brand-600">
            Back to 3D
          </button>
        ) : null}
      </div>
      {items.map((d) => (
        <DetailBlock key={d.title} detail={d} />
      ))}
    </Card>
  );
}
