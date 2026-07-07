"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { MangaDexManga } from "@/lib/mangadex";
import AddToListButton from "./AddToListButton";
import StarRating from "./StarRating";
import CoverImage from "./CoverImage";

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
  const [currentReview, setCurrentReview] = useState<string | null>(null);

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const res = await fetch(`/api/manga/${id}`);
        if (!res.ok) throw new Error("Manga not found");
        const data = await res.json();
        // Request larger 512px cover for the detail view
        if (data.coverUrl) {
          data.coverUrl = data.coverUrl.includes("?")
            ? data.coverUrl.replace(/size=\d+/, "size=512")
            : `${data.coverUrl}?size=512`;
        }
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
        .then((item: { status: string; rating: number | null; review: string | null } | null) => {
          if (item) {
            setCurrentStatus(item.status);
            setCurrentRating(item.rating);
            setCurrentReview(item.review);
          }
        })
        .catch(() => {});
    }
  }, [session, id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-[3/4] max-w-[180px] bg-[var(--bg-tertiary)] rounded-xl shrink-0" />
            <div className="space-y-3">
              <div className="h-6 bg-[var(--bg-tertiary)] rounded-xl w-2/3" />
              <div className="h-4 bg-[var(--bg-tertiary)] rounded-xl w-1/3" />
              <div className="h-3 bg-[var(--bg-tertiary)] rounded-xl w-full" />
              <div className="h-3 bg-[var(--bg-tertiary)] rounded-xl w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          {error || "Manga not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Cover - full width on mobile */}
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-5">
        <div className="w-36 sm:w-48 shrink-0">
          <div className="aspect-[3/4] bg-[var(--bg-tertiary)] rounded-xl overflow-hidden shadow-sm relative">
            <CoverImage
              src={manga.coverUrl || ""}
              alt={manga.title}
              priority
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h1 className="text-lg sm:text-2xl font-light tracking-tight text-[var(--text-primary)]">
            {manga.title}
          </h1>

          {(manga.year || manga.status) && (
            <div className="mt-1 flex items-center justify-center sm:justify-start gap-2 text-sm text-[var(--text-tertiary)]">
              {manga.year && <span>{manga.year}</span>}
              {manga.status && (
                <>
                  {manga.year && <span className="text-[var(--text-tertiary)]">·</span>}
                  <span className={`inline-flex items-center gap-1 ${
                    manga.status === "completed" ? "text-emerald-600 dark:text-emerald-400" :
                    manga.status === "hiatus" ? "text-amber-600 dark:text-amber-400" :
                    manga.status === "cancelled" ? "text-red-600 dark:text-red-400" :
                    "text-sky-600 dark:text-sky-400"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      manga.status === "completed" ? "bg-emerald-500" :
                      manga.status === "hiatus" ? "bg-amber-500" :
                      manga.status === "cancelled" ? "bg-red-500" :
                      "bg-sky-500"
                    }`} />
                    {manga.status.charAt(0).toUpperCase() + manga.status.slice(1)}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Tags */}
          {manga.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-1.5">
              {manga.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-[10px] uppercase tracking-wider bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* User's current status for this manga */}
          {session && currentStatus && (
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-[var(--text-secondary)]">
                <span className="text-[var(--text-tertiary)] uppercase tracking-wider">
                  {currentStatus.replace(/_/g, " ")}
                </span>
                {currentRating && (
                  <StarRating rating={currentRating} size="sm" />
                )}
              </div>
              {currentReview && (
                <p className="text-[11px] text-[var(--text-tertiary)] italic leading-relaxed text-center sm:text-left">
                  &ldquo;{currentReview}&rdquo;
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {session && (
        <div className="mt-6 border-t border-[var(--border-primary)] pt-5">
          <AddToListButton
            manga={manga}
            currentStatus={currentStatus}
            currentRating={currentRating}
            currentReview={currentReview}
          />
        </div>
      )}

      {/* Description */}
      {manga.description && (
        <div className="mt-6">
          <h2 className="text-xs font-light uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
            Description
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
            {manga.description}
          </p>
        </div>
      )}

      {/* Not logged in prompt */}
      {!session && (
        <div className="mt-6 pt-4 border-t border-[var(--border-primary)] text-center">
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
  );
}
