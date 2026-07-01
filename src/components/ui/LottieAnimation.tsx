"use client";

import { useEffect, useState } from "react";
import Lottie from "lottie-react";

type Props = {
  src: string;
  className?: string;
  loop?: boolean;
  fallback?: React.ReactNode;
};

export function LottieAnimation({ src, className, loop = false, fallback = null }: Props) {
  const [data, setData] = useState<object | null>(null);
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (reduced) return fallback;
  if (!data) return fallback;

  return (
    <Lottie
      animationData={data}
      loop={loop}
      className={className}
      aria-hidden
    />
  );
}
