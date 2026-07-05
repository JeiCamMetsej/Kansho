import { Suspense } from "react";
import MangaBrowser from "@/components/MangaBrowser";

function LoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="w-full max-w-md h-9 bg-gray-100 dark:bg-gray-900 rounded-sm animate-pulse" />
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 gap-y-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 rounded-sm" />
            <div className="h-3 bg-gray-100 dark:bg-gray-900 rounded w-3/4" />
            <div className="h-2 bg-gray-100 dark:bg-gray-900 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-tight text-[var(--text-primary)]">
          Discover
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Browse trending manhwa and manga
        </p>
      </div>
      <Suspense fallback={<LoadingFallback />}>
        <MangaBrowser />
      </Suspense>
    </div>
  );
}
