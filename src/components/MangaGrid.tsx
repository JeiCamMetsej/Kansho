"use client";

import MangaCard from "./MangaCard";
import type { MangaDexManga } from "@/lib/mangadex";

interface MangaGridProps {
  manga: MangaDexManga[];
  readlistStatuses?: Record<string, string>;
  onStatusChange?: (mangaId: string, newStatus: string | null) => void;
}

export default function MangaGrid({ manga, readlistStatuses, onStatusChange }: MangaGridProps) {
  if (manga.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-[var(--text-tertiary)]">
          No manga found.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
      {manga.map((item) => (
        <MangaCard
          key={item.id}
          manga={item}
          readlistStatus={readlistStatuses?.[item.id] ?? null}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
