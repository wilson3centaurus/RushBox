"use client";

import dynamic from "next/dynamic";

/**
 * three.js is ~600 KB, so the map loads on its own, only on the admin pages
 * that show it, and never during server rendering.
 */
export const SystemMap = dynamic(() => import("./SystemMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[360px] rounded-2xl bg-ink-100 animate-pulse flex items-center justify-center text-sm text-ink-400">
      Loading the 3D map…
    </div>
  ),
});
