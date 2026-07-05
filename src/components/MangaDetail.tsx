"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { MangaDexManga } from "@/lib/mangadex";
import AddToListButton from "./AddToListButton";

interface MangaDetailProps {
  id: string;
}

export default function MangaDetail({ id }: MangaDetailProps) {
  const { data: session } = useSession();
  const [manga, setManga] = useState<MangaDexManga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const res = await fetch(`/api/manga/${id}`);
        if (!res.ok) throw new Error("Manga not found");
        const data = await res.json();
        setManga(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load manga");
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, [id]);

  useEffect(() => {
    if (session) {
      fetch(`/api/readlist?mangaId=${id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((item: { status: string; rating: number | null } | null) => {
          if (item) {
            setCurrentStatus(item.status);
            setCurrentRating(item.rating);
          }
        })
        .catch(() => {});
    }
  }, [session, id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="flex gap-6">
            <div className="w-48 aspect-[3/4] bg-gray-100 dark:bg-gray-900 rounded-sm shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-100 dark:bg-gray-900 rounded w-2/3" />
              <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded w-1/3" />
              <div className="h-3 bg-gray-100 dark:bg-gray-900 rounded w-full" />
              <div className="h-3 bg-gray-100 dark:bg-gray-900 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          {error || "Manga not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Cover */}
        <div className="w-40 sm:w-48 shrink-0">
          <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 rounded-sm overflow-hidden">
            {manga.coverUrl && !imgError ? (
              <img
                src={manga.coverUrl}
                alt={manga.title}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl font-light text-gray-300 dark:text-gray-700">
                  ?
                </span>
              </div>
            )}
          </div>

          <div className="mt-3">
            <AddToListButton
              manga={manga}
              currentStatus={currentStatus}
              currentRating={currentRating}
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-light tracking-tight text-[var(--text-primary)]">
            {manga.title}
          </h1>

          {manga.year && (
            <p className="mt-1 text-sm text-[var(--text-tertiary)]">
              {manga.year}
            </p>
          )}

          {/* Tags */}
          {manga.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {manga.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-gray-100 dark:bg-gray-900 text-[var(--text-tertiary)] rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Status badges */}
          <div className="mt-4 space-y-1.5">
            {currentStatus && (
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <span className="text-[var(--text-tertiary)]">Status:</span>
                <span className="font-medium">
                  {currentStatus.replace(/_/g, " ")}
                </span>
              </div>
            )}
            {currentRating && (
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <span className="text-[var(--text-tertiary)]">Rating:</span>
                <span className="font-medium">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={
                        i < currentRating
                          ? "text-[var(--text-primary)]"
                          : "text-[var(--border-primary)]"
                      }
                    >
                      ★
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {manga.description && (
            <div className="mt-6">
              <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
                Description
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {manga.description}
              </p>
            </div>
          )}

          {/* Not logged in prompt */}
          {!session && (
            <div className="mt-6 pt-4 border-t border-[var(--border-primary)]">
              <p className="text-xs text-[var(--text-tertiary)]">
                <a
                  href="/login"
                  className="text-[var(--text-primary)] underline underline-offset-2"
                >
                  Sign in
                </a>{" "}
                to add this to your reading list and rate it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
