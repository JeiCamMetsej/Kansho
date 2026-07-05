import { Suspense } from "react";
import MangaBrowser from "@/components/MangaBrowser";

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-tight text-[var(--text-primary)]">
          Search
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Find manga, manhwa, and users
        </p>
      </div>

      <Suspense fallback={null}>
        <MangaBrowser />
      </Suspense>
    </div>
  );
}
