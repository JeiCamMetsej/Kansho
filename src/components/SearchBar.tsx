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

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();
    if (trimmed === lastNavigatedQuery.current) return;
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
      <form onSubmit={handleSubmit} className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search manga or users..."
          className="w-full h-12 px-4 pr-11 text-base bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
        />
        <button
          type="submit"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] transition-all duration-150 active:text-[var(--text-secondary)]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </form>

      {/* Search tabs (only visible when there's a query) */}
      {hasQuery && (
        <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] rounded-2xl p-1">
          <button
            onClick={() => handleTabChange("manga")}
            className={`h-9 flex-1 px-5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-150 active:scale-[0.97] ${
              activeTab === "manga"
                ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-tertiary)]"
            }`}
          >
            Manga
          </button>
          <button
            onClick={() => handleTabChange("users")}
            className={`h-9 flex-1 px-5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-150 active:scale-[0.97] ${
              activeTab === "users"
                ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-tertiary)]"
            }`}
          >
            Users
          </button>
        </div>
      )}
    </div>
  );
}
