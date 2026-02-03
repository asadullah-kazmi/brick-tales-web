import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  /** Optional trend text (e.g. "+12%") */
  trend?: string;
  /** Optional icon or emoji */
  icon?: ReactNode;
  className?: string;
};

export function StatCard({
  label,
  value,
  trend,
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-neutral-900 dark:text-white sm:text-3xl">
            {value}
          </p>
          {trend && (
            <p className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">
              {trend} vs last period
            </p>
          )}
        </div>
        {icon && (
          <span className="text-2xl opacity-80 sm:text-3xl" aria-hidden>
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
