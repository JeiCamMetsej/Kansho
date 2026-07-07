"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import MangaGrid from "./MangaGrid";
import SearchBar from "./SearchBar";
import SearchFilters from "./SearchFilters";
import UserSearchResults from "./UserSearchResults";
import type { MangaDexManga } from "@/lib/mangadex";
import type { SearchTab } from "./SearchBar";
import type { ReadStatus, PubStatus } from "./SearchFilters";

export default function MangaBrowser() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q");
  const tab = (searchParams.get("tab") as SearchTab) || "manga";
  const tagsParam = searchParams.get("tags") || "";
  const readStatusParam = (searchParams.get("readStatus") as ReadStatus) || "unread";
  const pubStatusParam = (searchParams.get("status") as PubStatus) || "all";
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
      setError(null);
      try {
        const params = new URLSearchParams({
          limit: "20",
          offset: String(newOffset),
          lang: "en",
        });
        if (query) params.set("q", query);
        if (tagsParam) params.set("tags", tagsParam);

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
    [query, tagsParam]
  );

  // Fetch manga on mount and when query/tags change
  useEffect(() => {
    setLoading(true);
    setManga([]);
    setOffset(0);
    fetchManga(0);
  }, [fetchManga]);

  // Fetch user's readlist statuses
  useEffect(() => {
    if (session) {
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
  }, [session]);

  // Apply read status and publication status filter client-side
  const filteredManga = useMemo(() => {
    let result = manga;

    // Filter by publication status
    if (pubStatusParam !== "all") {
      result = result.filter((m) => m.status === pubStatusParam);
    }

    // Filter by read status
    if (readStatusParam !== "all") {
      result = result.filter((m) => {
        const inReadlist = readlistStatuses[m.id] !== undefined;
        return readStatusParam === "read" ? inReadlist : !inReadlist;
      });
    }

    return result;
  }, [manga, readStatusParam, pubStatusParam, readlistStatuses]);

  const handleReadStatusChange = useCallback(
    (status: ReadStatus) => {
      const params = new URLSearchParams(searchParams.toString());
      if (status === "unread") {
        params.delete("readStatus");
      } else {
        params.set("readStatus", status);
      }
      router.replace(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleStatusChange = useCallback(
    (status: PubStatus) => {
      const params = new URLSearchParams(searchParams.toString());
      if (status === "all") {
        params.delete("status");
      } else {
        params.set("status", status);
      }
      router.replace(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleLoadMore = useCallback(() => {
    setLoadingMore(true);
    fetchManga(offset + 20, true);
  }, [offset, fetchManga]);

  const showMangaTab = !query || tab === "manga";
  const showUsersTab = !!query && tab === "users";

  return (
    <div className="space-y-6">
      <SearchBar />

      {/* Manga tab content */}
      {showMangaTab && (
        <>
          <SearchFilters
            onReadStatusChange={handleReadStatusChange}
            readStatus={readStatusParam}
            onStatusChange={handleStatusChange}
            pubStatus={pubStatusParam}
          />

          {error && (
            <div className="py-8 text-center">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchManga(0);
                }}
                className="mt-2 text-sm text-[var(--text-secondary)] underline transition-all duration-150 active:text-[var(--text-primary)]"
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 gap-y-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="aspect-[3/4] bg-[var(--bg-tertiary)] rounded-sm" />
                  <div className="h-3 bg-[var(--bg-tertiary)] rounded w-3/4" />
                  <div className="h-2 bg-[var(--bg-tertiary)] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredManga.length === 0 && !loading ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-[var(--text-tertiary)]">
                    {manga.length > 0
                      ? "No manga match your current filters."
                      : "No manga found. Try adjusting your filters."}
                  </p>
                </div>
              ) : (
                <MangaGrid
                  manga={filteredManga}
                  readlistStatuses={readlistStatuses}
                  onStatusChange={(mangaId, newStatus) =>
                    setReadlistStatuses((prev) => {
                      const next = { ...prev };
                      if (newStatus) {
                        next[mangaId] = newStatus;
                      } else {
                        delete next[mangaId];
                      }
                      return next;
                    })
                  }
                />
              )}

              {manga.length > 0 && offset + 20 < total && (
                <div className="flex justify-center pt-4 pb-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 h-12 text-sm font-semibold uppercase tracking-wider border border-[var(--border-primary)] text-[var(--text-secondary)] rounded-2xl transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Users tab content */}
      {showUsersTab && (
        <UserSearchResults />
      )}
    </div>
  );
}
