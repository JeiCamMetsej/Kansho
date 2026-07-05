"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import MangaGrid from "./MangaGrid";
import SearchBar from "./SearchBar";
import type { MangaDexManga } from "@/lib/mangadex";

export default function MangaBrowser() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const { data: session } = useSession();

  const [manga, setManga] = useState<MangaDexManga[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [readlistStatuses, setReadlistStatuses] = useState<
    Record<string, string>
  >({});

  const fetchManga = useCallback(
    async (newOffset: number, append: boolean = false) => {
      try {
        const params = new URLSearchParams({
          limit: "20",
          offset: String(newOffset),
        });
        if (query) params.set("q", query);

        const res = await fetch(`/api/manga?${params}`);
        if (!res.ok) throw new Error("Failed to fetch manga");

        const data = await res.json();
        if (append) {
          setManga((prev) => [...prev, ...data.manga]);
        } else {
          setManga(data.manga);
        }
        setTotal(data.total);
        setOffset(newOffset);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load manga");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [query]
  );

  // Fetch manga on mount and when query changes
  useEffect(() => {
    setLoading(true);
    setManga([]);
    setOffset(0);
    fetchManga(0);
  }, [fetchManga]);

  // Fetch user's readlist statuses
  useEffect(() => {
    if (session && manga.length > 0) {
      fetch("/api/readlist")
        .then((res) => (res.ok ? res.json() : []))
        .then((items: Array<{ mangaId: string; status: string }>) => {
          const statuses: Record<string, string> = {};
          items.forEach((item) => {
            statuses[item.mangaId] = item.status;
          });
          setReadlistStatuses(statuses);
        })
        .catch(() => {});
    }
  }, [session, manga.length]);

  const handleLoadMore = useCallback(() => {
    setLoadingMore(true);
    fetchManga(offset + 20, true);
  }, [offset, fetchManga]);

  return (
    <div className="space-y-6">
      <SearchBar />

      {error && (
        <div className="py-8 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchManga(0);
            }}
            className="mt-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 gap-y-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 rounded-sm" />
              <div className="h-3 bg-gray-100 dark:bg-gray-900 rounded w-3/4" />
              <div className="h-2 bg-gray-100 dark:bg-gray-900 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <MangaGrid
            manga={manga}
            readlistStatuses={readlistStatuses}
          />

          {manga.length > 0 && offset + 20 < total && (
            <div className="flex justify-center pt-4 pb-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 h-9 text-xs font-medium uppercase tracking-wider border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
