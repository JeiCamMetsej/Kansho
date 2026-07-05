"use client";

import Link from "next/link";
import { useState } from "react";
import type { MangaDexManga } from "@/lib/mangadex";

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
        <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 rounded-sm overflow-hidden">
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
                <div className="text-2xl font-light text-gray-300 dark:text-gray-700">
                  ?
                </div>
                <div className="text-xs text-gray-300 dark:text-gray-700 mt-1 line-clamp-2">
                  {manga.title}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-0.5">
          <h3 className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">
            {manga.title}
          </h3>
          {manga.year && (
            <p className="text-[11px] text-gray-400 dark:text-gray-600">
              {manga.year}
            </p>
          )}
          {readlistStatus && (
            <span className="inline-block text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-600">
              {readlistStatus.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
