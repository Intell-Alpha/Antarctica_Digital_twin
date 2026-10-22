"use client";

import { PolarErrorBoundary } from "@/components/PolarErrorBoundary";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PolarErrorBoundary error={error} reset={reset} isRoot />;
}
