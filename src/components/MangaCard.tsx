"use client";

import Link from "next/link";
import type { MangaDexManga } from "@/lib/mangadex";
import QuickAddButton from "./QuickAddButton";
import CoverImage from "./CoverImage";

const STATUS_BADGE: Record<string, string> = {
  plan_to_read: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  reading: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  dropped: "bg-red-500/15 text-red-700 dark:text-red-400",
};

interface MangaCardProps {
  manga: MangaDexManga;
  readlistStatus?: string | null;
  onStatusChange?: (mangaId: string, newStatus: string | null) => void;
}

export default function MangaCard({ manga, readlistStatus, onStatusChange }: MangaCardProps) {

  return (
    <Link
      href={`/manga/${manga.id}`}
      className="block active:scale-[0.97] transition-transform duration-150"
    >
      <article className="space-y-1.5">
        {/* Cover Image */}
        <div className="relative aspect-[3/4] bg-[var(--bg-tertiary)] rounded-xl overflow-hidden shadow-sm">
          <CoverImage
            src={manga.coverUrl}
            alt={manga.title}
            fallback={
              <div className="text-center p-4">
                <div className="text-2xl font-light text-[var(--text-tertiary)]">?</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">{manga.title}</div>
              </div>
            }
          />

          {/* Quick add button */}
          <div className="absolute top-1.5 right-1.5">
            <QuickAddButton
              manga={manga}
              currentStatus={readlistStatus}
              onStatusChange={onStatusChange}
            />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-0.5 px-0.5">
          <h3 className="text-[11px] font-light text-[var(--text-primary)] leading-tight line-clamp-2">
            {manga.title}
          </h3>
          {(manga.year || manga.status) && (
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
              {manga.year && <span>{manga.year}</span>}
              {manga.status && (
                <span className={`inline-flex items-center gap-1 ${
                  manga.status === "completed" ? "text-emerald-600 dark:text-emerald-400" :
                  manga.status === "hiatus" ? "text-amber-600 dark:text-amber-400" :
                  manga.status === "cancelled" ? "text-red-600 dark:text-red-400" :
                  "text-sky-600 dark:text-sky-400"
                }`}>
                  <span className={`w-1 h-1 rounded-full ${
                    manga.status === "completed" ? "bg-emerald-500" :
                    manga.status === "hiatus" ? "bg-amber-500" :
                    manga.status === "cancelled" ? "bg-red-500" :
                    "bg-sky-500"
                  }`} />
                  {manga.status.charAt(0).toUpperCase() + manga.status.slice(1)}
                </span>
              )}
            </div>
          )}
          {readlistStatus && (
            <span
              className={`inline-block px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-md ${
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
