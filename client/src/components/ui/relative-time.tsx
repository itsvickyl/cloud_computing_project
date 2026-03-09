"use client";

import { useState, useEffect } from "react";
import { formatRelativeTime } from "@/utils/format/relative-time";

interface RelativeTimeProps {
  date: Date;
  className?: string;
}

/**
 * Client component that displays relative time (e.g., "2h ago")
 * Prevents hydration mismatches by only rendering on the client
 */
export function RelativeTime({ date, className }: RelativeTimeProps) {
  const [mounted, setMounted] = useState(false);
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    setMounted(true);
    setTimeString(formatRelativeTime(date));

    // Update every minute to keep the time fresh
    const interval = setInterval(() => {
      setTimeString(formatRelativeTime(date));
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [date]);

  // During SSR and initial render, show a skeleton to prevent hydration mismatch
  if (!mounted) {
    return <span className={className}>...</span>;
  }

  return <span className={className}>{timeString}</span>;
}
