import { Suspense } from "react";
import MangaBrowser from "@/components/MangaBrowser";

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-lg font-light tracking-tight text-[var(--text-primary)]">
          Search
        </h1>
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
          Find manga, manhwa, and users
        </p>
      </div>

      <Suspense fallback={null}>
        <MangaBrowser />
      </Suspense>
    </div>
  );
}
