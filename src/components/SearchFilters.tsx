"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { MangaDexTag } from "@/lib/mangadex";

export type ReadStatus = "all" | "unread" | "read";

interface SearchFiltersProps {
  onReadStatusChange: (status: ReadStatus) => void;
  readStatus: ReadStatus;
}

export default function SearchFilters({
  onReadStatusChange,
  readStatus,
}: SearchFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tags, setTags] = useState<MangaDexTag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const tagsParam = searchParams.get("tags");
    return tagsParam ? tagsParam.split(",").filter(Boolean) : [];
  });
  const [showFilters, setShowFilters] = useState(false);

  // Sync selected tags from URL on mount and external changes
  useEffect(() => {
    const tagsParam = searchParams.get("tags");
    const urlTags = tagsParam ? tagsParam.split(",").filter(Boolean) : [];
    setSelectedTags(urlTags);
  }, [searchParams]);

  // Fetch tags from API
  useEffect(() => {
    fetch("/api/manga", { method: "POST" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: MangaDexTag[]) => setTags(data))
      .catch(() => {})
      .finally(() => setLoadingTags(false));
  }, []);

  const updateUrlTags = useCallback(
    (newTags: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newTags.length > 0) {
        params.set("tags", newTags.join(","));
      } else {
        params.delete("tags");
      }
      // Preserve other params like q, tab
      router.replace(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleTagToggle = useCallback(
    (tagId: string) => {
      setSelectedTags((prev) => {
        const next = prev.includes(tagId)
          ? prev.filter((id) => id !== tagId)
          : [...prev, tagId];
        updateUrlTags(next);
        return next;
      });
    },
    [updateUrlTags]
  );

  const handleClearFilters = useCallback(() => {
    setSelectedTags([]);
    updateUrlTags([]);
    onReadStatusChange("all");
  }, [updateUrlTags, onReadStatusChange]);

  const hasActiveFilters = selectedTags.length > 0 || readStatus !== "all";
  const activeFilterCount =
    selectedTags.length + (readStatus !== "all" ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Toggle button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-10 inline-flex items-center gap-2 px-4 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-150 active:scale-95 ${
            hasActiveFilters
              ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              : "bg-transparent text-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-secondary)]"
          }`}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              showFilters ? "rotate-90" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
            />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)]">
              {activeFilterCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-secondary)] transition-all duration-150 active:scale-95"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg space-y-4">
          {/* Read status */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
              Read Status
            </h3>
            <div className="flex gap-1.5">
              {(
                [
                  { value: "all", label: "All" },
                  { value: "unread", label: "Unread" },
                  { value: "read", label: "Read" },
                ] as { value: ReadStatus; label: string }[]
              ).map((option) => (
                <button
                  key={option.value}
                  onClick={() => onReadStatusChange(option.value)}
                  className={`h-9 px-4 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-150 active:scale-95 ${
                    readStatus === option.value
                      ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Genre tags */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
              Genre / Theme
            </h3>
            {loadingTags ? (
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-16 bg-[var(--bg-tertiary)] rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`h-8 px-3 text-xs font-medium rounded-lg transition-all duration-150 active:scale-95 border ${
                      selectedTags.includes(tag.id)
                        ? "bg-[var(--text-primary)] text-[var(--bg-primary)] border-[var(--text-primary)]"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-transparent hover:border-[var(--border-primary)]"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
