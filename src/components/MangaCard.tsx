"use client";

import Link from "next/link";
import { useState } from "react";
import type { MangaDexManga } from "@/lib/mangadex";

const STATUS_BADGE: Record<string, string> = {
  plan_to_read: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  reading: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  dropped: "bg-red-500/15 text-red-700 dark:text-red-400",
};

interface MangaCardProps {
  manga: MangaDexManga;
  readlistStatus?: string | null;
}

export default function MangaCard({ manga, readlistStatus }: MangaCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/manga/${manga.id}`}
      className="group block"
    >
      <article className="space-y-2">
        {/* Cover Image */}
        <div className="aspect-[3/4] bg-[var(--bg-tertiary)] rounded-sm overflow-hidden">
          {manga.coverUrl && !imgError ? (
            <img
              src={manga.coverUrl}
              alt={manga.title}
              className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-2xl font-light text-[var(--text-tertiary)]">
                  ?
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
                  {manga.title}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-0.5">
          <h3 className="text-xs font-light text-[var(--text-primary)] leading-tight line-clamp-2">
            {manga.title}
          </h3>
          {manga.year && (
            <p className="text-[11px] text-[var(--text-tertiary)]">
              {manga.year}
            </p>
          )}
          {readlistStatus && (
            <span
              className={`inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-sm ${
                STATUS_BADGE[readlistStatus] || "text-[var(--text-tertiary)]"
              }`}
            >
              {readlistStatus.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
