"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  labelClassName?: string;
}

export function AnimatedCounter({
  value,
  label,
  prefix = "",
  suffix = "",
  className,
  labelClassName,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(v) {
        el.textContent = `${prefix}${Math.round(v).toLocaleString()}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, prefix, suffix]);

  return (
    <div className={className}>
      <span ref={ref} className="tabular-nums">
        {prefix}0{suffix}
      </span>
      <p className={labelClassName}>{label}</p>
    </div>
  );
}
