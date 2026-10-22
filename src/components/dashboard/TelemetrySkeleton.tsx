"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

/**
 * Atomic polar skeleton box with shimmering scanline effect
 */
export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-white/[0.06] border border-white/[0.04] select-none",
        shimmer &&
          "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.07] before:to-transparent motion-reduce:before:hidden",
        className
      )}
      {...props}
    />
  );
}

/**
 * Text line skeleton placeholder
 */
export function SkeletonText({
  className,
  width = "w-full",
  height = "h-4",
}: {
  className?: string;
  width?: string;
  height?: string;
}) {
  return <Skeleton className={cn(height, width, "rounded", className)} />;
}

/**
 * Badge / Pill skeleton placeholder
 */
export function SkeletonBadge({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn("h-5 w-20 rounded-full bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20", className)}
    />
  );
}

/**
 * Telemetry Card Skeleton matching bezel-shell / bezel-core design
 */
export function SkeletonCard({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("bezel-shell p-0.5", className)}>
      <div className="bezel-core p-6 h-full flex flex-col justify-between space-y-4">
        {children ? (
          children
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-2 w-2 rounded-full bg-[var(--accent-primary)]/40" />
            </div>
            <div className="flex items-baseline gap-3 my-2">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-4 w-10" />
            </div>
            <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex justify-between">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Header Skeleton mirroring StationHeader / DomainHeader
 */
export function SkeletonHeader({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-theme pb-6 gap-4", className)}>
      <div className="space-y-2.5 w-full sm:w-auto">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-56 sm:w-72" />
          <SkeletonBadge />
        </div>
        <Skeleton className="h-3.5 w-48 sm:w-64" />
      </div>

      <div className="flex items-end sm:items-center gap-4 self-end sm:self-auto">
        <div className="space-y-1 text-right">
          <Skeleton className="h-2.5 w-24 ml-auto" />
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Metric KPI Cards Grid Skeleton
 */
export function SkeletonMetricGrid({ count = 3 }: { count?: number }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6",
        count === 2 && "sm:grid-cols-2",
        count === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        count >= 4 && "sm:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Detailed List Item Skeleton (e.g. Alerts, Generators, Sensors)
 */
export function SkeletonList({ items = 4 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="bezel-shell p-0.5"
        >
          <div className="bezel-core p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Skeleton className="w-2.5 h-2.5 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-4 w-3/4 max-w-xs" />
                <Skeleton className="h-3 w-1/2 max-w-[200px]" />
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Complete Full Dashboard Domain Page Skeleton
 */
export function DomainPageSkeleton({ kpiCount = 3 }: { kpiCount?: number }) {
  return (
    <div className="max-w-6xl mx-auto flex flex-col space-y-8 pb-12 w-full animate-in fade-in duration-300">
      <SkeletonHeader />
      <SkeletonMetricGrid count={kpiCount} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-20" />
          </div>
          <SkeletonList items={4} />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-4 w-32" />
          </div>
          <SkeletonCard className="h-64" />
        </div>
      </div>
    </div>
  );
}
