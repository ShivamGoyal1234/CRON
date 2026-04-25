"use client";

import { useEffect, useMemo, useState } from "react";

function computeRemaining(interval: number, offset: number, lastRunAt?: string | Date | null) {
  const now = Date.now();
  const stepMs = interval * 60 * 1000;
  const anchor = lastRunAt ? new Date(lastRunAt).getTime() : 0;
  const nextBase = anchor > 0 ? anchor + stepMs : Math.ceil(now / stepMs) * stepMs;
  const next = nextBase + offset * 1000;
  return Math.max(0, Math.floor((next - now) / 1000));
}

export function CountdownTimer({
  interval,
  offset,
  lastRunAt,
}: {
  interval: number;
  offset: number;
  lastRunAt?: string | Date | null;
}) {
  const [remaining, setRemaining] = useState(() =>
    computeRemaining(interval, offset, lastRunAt),
  );

  const pretty = useMemo(() => {
    const min = Math.floor(remaining / 60);
    const sec = remaining % 60;
    return `${min}:${String(sec).padStart(2, "0")}`;
  }, [remaining]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(computeRemaining(interval, offset, lastRunAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [interval, offset, lastRunAt]);

  return <span className="text-sm text-gray-600">Next run in {pretty}</span>;
}
