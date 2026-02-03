"use client";

import { cn } from "@/lib/utils";

export type BarChartItem = {
  label: string;
  value: number;
};

type SimpleBarChartProps = {
  data: BarChartItem[];
  /** Max value for scaling bars. Defaults to max value in data. */
  maxValue?: number;
  className?: string;
};

export function SimpleBarChart({
  data,
  maxValue,
  className,
}: SimpleBarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("space-y-3", className)}>
      {data.map((item) => (
        <div key={item.label} className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {item.label}
            </span>
            <span className="tabular-nums text-neutral-500 dark:text-neutral-400">
              {item.value}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
            <div
              className="h-full rounded-full bg-neutral-400 dark:bg-neutral-500"
              style={{
                width: `${Math.min(100, (item.value / max) * 100)}%`,
              }}
              role="presentation"
              aria-hidden
            />
          </div>
        </div>
      ))}
    </div>
  );
}
