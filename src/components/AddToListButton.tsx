"use client";

import { useSession } from "next-auth/react";
import { useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { MangaDexManga } from "@/lib/mangadex";
import RateModal from "./RateModal";

interface AddToListButtonProps {
  manga: MangaDexManga;
  currentStatus?: string | null;
  currentRating?: number | null;
  currentReview?: string | null;
}

type StatusOption = "plan_to_read" | "reading" | "completed" | "dropped";

const STATUS_CONFIG: Record<StatusOption, { label: string; color: string; icon: ReactNode }> = {
  plan_to_read: {
    label: "Plan to Read",
    color: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  reading: {
    label: "Reading",
    color: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  dropped: {
    label: "Dropped",
    color: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

export default function AddToListButton({
  manga,
  currentStatus,
  currentRating,
  currentReview,
}: AddToListButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(currentStatus ?? null);
  const [rating, setRating] = useState<number | null>(currentRating ?? null);
  const [review, setReview] = useState<string | null>(currentReview ?? null);
  const [loading, setLoading] = useState(false);
  const [actionText, setActionText] = useState<string | null>(null);
  const [showRateModal, setShowRateModal] = useState(false);

  const withLoading = useCallback(
    async (text: string, fn: () => Promise<void>) => {
      setLoading(true);
      setActionText(text);
      await Promise.all([fn(), new Promise((r) => setTimeout(r, 500))]);
      setLoading(false);
      setActionText(null);
    },
    []
  );

  const handleStatusChange = useCallback(
    async (newStatus: StatusOption) => {
      const isNew = !status;
      await withLoading(isNew ? "Adding…" : "Saving…", async () => {
        const res = await fetch("/api/readlist", {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mangaId: manga.id,
            ...(isNew && {
              title: manga.title,
              coverUrl: manga.coverUrl,
              description: manga.description,
              year: manga.year,
            }),
            status: newStatus,
          }),
        });
        if (res.ok) {
          setStatus(newStatus);
          router.refresh();
        }
      });
    },
    [manga, status, router, withLoading]
  );

  const handleRateSave = useCallback(
    async (newRating: number | null, newReview: string | null) => {
      if (!status && newRating === null && newReview === null) {
        setShowRateModal(false);
        return;
      }

      if (!status) {
        await withLoading("Adding…", async () => {
          const res = await fetch("/api/readlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mangaId: manga.id,
              title: manga.title,
              coverUrl: manga.coverUrl,
              description: manga.description,
              year: manga.year,
              status: "plan_to_read",
              rating: newRating,
              review: newReview,
            }),
          });
          if (res.ok) {
            setStatus("plan_to_read");
            setRating(newRating);
            setReview(newReview);
            setShowRateModal(false);
            router.refresh();
          }
        });
        return;
      }

      await withLoading("Saving…", async () => {
        const res = await fetch("/api/readlist", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mangaId: manga.id,
            rating: newRating,
            review: newReview,
          }),
        });
        if (res.ok) {
          setRating(newRating);
          setReview(newReview);
          setShowRateModal(false);
          router.refresh();
        }
      });
    },
    [manga, status, router, withLoading]
  );

  const handleRemove = useCallback(async () => {
    await withLoading("Removing…", async () => {
      const res = await fetch(`/api/readlist?mangaId=${manga.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStatus(null);
        setRating(null);
        setReview(null);
        router.refresh();
      }
    });
  }, [manga.id, router, withLoading]);

  const hasRateOrReview = rating !== null || (review && review.trim().length > 0);

  if (!session) return null;

  return (
    <div className="space-y-3">
      {/* Status buttons */}
      <div className="flex flex-wrap gap-2.5">
        {(Object.entries(STATUS_CONFIG) as [StatusOption, typeof STATUS_CONFIG[StatusOption]][]).map(
          ([key, config]) => (
            <button
              key={key}
              onClick={() => handleStatusChange(key)}
              disabled={loading}
              className={`h-12 px-5 text-xs font-semibold uppercase tracking-wider rounded-2xl transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2.5 ${
                status === key
                  ? `${config.color} border`
                  : "bg-transparent text-[var(--text-secondary)] border border-[var(--border-primary)]"
              }`}
            >
              {config.icon}
              <span>{config.label}</span>
            </button>
          )
        )}
      </div>

      {/* Rate & Review button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowRateModal(true)}
          disabled={loading}
          className={`h-12 px-6 text-sm font-semibold uppercase tracking-wider rounded-2xl transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2.5 ${
            hasRateOrReview
              ? "bg-transparent border border-[var(--border-primary)] text-[var(--text-secondary)]"
              : "bg-[var(--text-primary)] text-[var(--bg-primary)] border border-transparent"
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {hasRateOrReview ? (
            rating !== null ? `${rating % 1 === 0 ? rating : rating.toFixed(1)}` : "Rated"
          ) : (
            "Rate & Review"
          )}
        </button>
        {review && review.trim().length > 0 && (
          <button
            onClick={() => setShowRateModal(true)}
            className="text-xs text-[var(--text-tertiary)] transition-colors duration-150 line-clamp-1 max-w-[200px]"
          >
            &ldquo;{review}&rdquo;
          </button>
        )}
      </div>

      {/* Rate Modal */}
      {showRateModal && (
        <RateModal
          currentRating={rating}
          currentReview={review}
          onSave={handleRateSave}
          onClose={() => setShowRateModal(false)}
          loading={loading}
        />
      )}

      {/* Loading feedback */}
      {actionText && (
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)] italic">
          <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)] animate-pulse" />
          {actionText}
        </div>
      )}

      {/* Remove */}
      {status && (
        <button
          onClick={handleRemove}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[var(--text-tertiary)] transition-all duration-150 active:text-[var(--text-secondary)] disabled:opacity-40 active:scale-[0.97]"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          Remove from list
        </button>
      )}
    </div>
  );
}
