"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";

export type SearchTab = "manga" | "users";

const DEBOUNCE_MS = 300;

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const tabFromUrl = (searchParams.get("tab") as SearchTab) || "manga";

  const [query, setQuery] = useState(queryFromUrl);
  const [activeTab, setActiveTab] = useState<SearchTab>(tabFromUrl);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastNavigatedQuery = useRef(queryFromUrl);

  // Sync local state with URL (browser back/forward, initial load)
  // Note: intentionally does NOT update lastNavigatedQuery — that ref tracks
  // the last query the debounce committed, and is used to distinguish external
  // URL changes (browser nav) from user typing.
  useEffect(() => {
    setQuery(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const navigate = useCallback(
    (q: string, tab: SearchTab, replace: boolean = false) => {
      const params = new URLSearchParams();
      if (q.trim()) {
        params.set("q", q.trim());
        params.set("tab", tab);
      }
      const url = `/search?${params.toString()}`;
      if (replace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [router]
  );

  // Debounced search on every keystroke
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();
    // Already up to date
    if (trimmed === lastNavigatedQuery.current) return;
    // URL was changed externally (browser back/forward) — don't fight it
    if (queryFromUrl !== lastNavigatedQuery.current) return;

    debounceRef.current = setTimeout(() => {
      lastNavigatedQuery.current = trimmed;
      navigate(query, activeTab, true);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, activeTab, queryFromUrl, navigate]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      navigate(query, activeTab);
    },
    [query, activeTab, navigate]
  );

  const handleTabChange = useCallback(
    (tab: SearchTab) => {
      setActiveTab(tab);
      if (query.trim()) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        navigate(query, tab);
      }
    },
    [query, navigate]
  );

  const hasQuery = query.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative w-full max-w-md">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search manga or users..."
          className="w-full h-12 pl-4 pr-10 text-base bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-all duration-150 active:brightness-75"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </form>

      {/* Search tabs (only visible when there's a query) */}
      {hasQuery && (
        <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] rounded-lg p-1">
          <button
            onClick={() => handleTabChange("manga")}
            className={`h-9 flex-1 px-5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all duration-150 active:scale-95 ${
              activeTab === "manga"
                ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Manga
          </button>
          <button
            onClick={() => handleTabChange("users")}
            className={`h-9 flex-1 px-5 text-xs font-semibold uppercase tracking-wider rounded-md transition-all duration-150 active:scale-95 ${
              activeTab === "users"
                ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
            }`}
          >
            Users
          </button>
        </div>
      )}
    </div>
  );
}
