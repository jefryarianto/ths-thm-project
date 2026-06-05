"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendIndicatorProps {
  /** Percentage change value (e.g., 12.5 for +12.5%, -5.3 for -5.3%) */
  value: number;
  /** Optional label shown after the percentage */
  label?: string;
  /** Show compact version (smaller text) */
  compact?: boolean;
  /** Invert colors (green for decrease, red for increase) — useful for cost metrics */
  invert?: boolean;
}

export function TrendIndicator({
  value,
  label,
  compact = false,
  invert = false,
}: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  // Determine color
  const colorClass = invert
    ? isPositive
      ? "text-red-600 dark:text-red-500"
      : isNegative
        ? "text-green-600 dark:text-green-500"
        : "text-muted-foreground"
    : isPositive
      ? "text-green-600 dark:text-green-500"
      : isNegative
        ? "text-red-600 dark:text-red-500"
        : "text-muted-foreground";

  // Icon
  const Icon = isPositive
    ? TrendingUp
    : isNegative
      ? TrendingDown
      : Minus;

  const formattedValue = `${isPositive ? "+" : ""}${value.toFixed(1)}%`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium",
        colorClass,
        compact ? "text-[11px]" : "text-xs",
      )}
    >
      <Icon className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
      <span>{formattedValue}</span>
      {label && (
        <span className="text-muted-foreground ml-0.5">{label}</span>
      )}
    </span>
  );
}

/**
 * Calculate percentage change between current and previous value.
 * Returns 0 if both are 0. Returns ±100 if previous is 0.
 */
export function calcTrend(current: number, previous: number): number {
  if (previous === 0) {
    if (current === 0) return 0;
    return current > 0 ? 100 : -100;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Mini sparkline drawn as an inline SVG bar.
 * Accepts an array of numbers and renders small bars.
 */
export function MiniSparkline({
  data,
  className,
}: {
  data: number[];
  className?: string;
}) {
  if (data.length === 0) return null;

  const max = Math.max(...data, 1);
  const height = 24;
  const width = 48;
  const barWidth = Math.max(2, Math.floor(width / data.length) - 1);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0", className)}
    >
      {data.map((val, i) => {
        const barHeight = (val / max) * height;
        return (
          <rect
            key={i}
            x={i * (barWidth + 1)}
            y={height - barHeight}
            width={barWidth}
            height={Math.max(barHeight, 1)}
            className="fill-current"
            opacity={0.6 + (i / data.length) * 0.4}
            rx={1}
          />
        );
      })}
    </svg>
  );
}
