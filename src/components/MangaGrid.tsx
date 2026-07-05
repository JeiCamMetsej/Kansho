"use client";

import MangaCard from "./MangaCard";
import type { MangaDexManga } from "@/lib/mangadex";

interface MangaGridProps {
  manga: MangaDexManga[];
  readlistStatuses?: Record<string, string>;
}

export default function MangaGrid({ manga, readlistStatuses }: MangaGridProps) {
  if (manga.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-gray-400 dark:text-gray-600">
          No manga found.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 gap-y-6">
      {manga.map((item) => (
        <MangaCard
          key={item.id}
          manga={item}
          readlistStatus={readlistStatuses?.[item.id] ?? null}
        />
      ))}
    </div>
  );
}
