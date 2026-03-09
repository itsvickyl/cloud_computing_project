"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface TimedRedirectProps {
  to: string;
  seconds?: number;
}

export default function TimedRedirect({ to, seconds = 3 }: TimedRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(to);
    }, seconds * 1000);

    return () => clearTimeout(timer);
  }, [to, seconds, router]);

  return null;
}
