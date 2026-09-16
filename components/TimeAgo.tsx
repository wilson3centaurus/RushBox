"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/format";

/**
 * Relative times are computed after mount: the server and the client evaluate
 * Date.now() at different moments, which otherwise renders a hydration mismatch.
 */
export function TimeAgo({ iso }: { iso: string }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(timeAgo(iso));
    const t = setInterval(() => setText(timeAgo(iso)), 30_000);
    return () => clearInterval(t);
  }, [iso]);

  return <span suppressHydrationWarning>{text ?? "…"}</span>;
}
