"use client";

import { useSession } from "next-auth/react";
import { useState, useCallback } from "react";
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

const STATUS_CONFIG: Record<StatusOption, { label: string; color: string }> = {
  plan_to_read: {
    label: "Plan to Read",
    color: "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  reading: {
    label: "Reading",
    color: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  dropped: {
    label: "Dropped",
    color: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30",
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
      // Nothing to save / clear — just close
      if (!status && newRating === null && newReview === null) {
        setShowRateModal(false);
        return;
      }

      if (!status) {
        // Auto-add with plan_to_read before rating/review
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
      {/* Status buttons — always visible */}
      <div className="flex flex-wrap gap-1">
        {(Object.entries(STATUS_CONFIG) as [StatusOption, typeof STATUS_CONFIG[StatusOption]][]).map(
          ([key, config]) => (
            <button
              key={key}
              onClick={() => handleStatusChange(key)}
              disabled={loading}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all duration-150 active:brightness-75 ${
                status === key
                  ? `${config.color} border`
                  : "bg-transparent text-[var(--text-secondary)] border border-[var(--border-primary)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)]"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {config.label}
            </button>
          )
        )}
      </div>

      {/* Rate button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowRateModal(true)}
          disabled={loading}
          className={`h-12 px-6 text-sm font-semibold uppercase tracking-wider rounded-sm transition-all duration-150 active:brightness-75 disabled:opacity-40 disabled:cursor-not-allowed ${
            hasRateOrReview
              ? "bg-transparent border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)]"
              : "bg-[var(--text-primary)] text-[var(--bg-primary)] border border-transparent hover:brightness-110"
          }`}
        >
          {hasRateOrReview ? (
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {rating !== null ? `${rating % 1 === 0 ? rating : rating.toFixed(1)}` : "Rated"}
            </span>
          ) : (
            "Rate"
          )}
        </button>
        {review && review.trim().length > 0 && (
          <button
            onClick={() => setShowRateModal(true)}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors duration-150 line-clamp-1 max-w-[200px]"
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
          className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] transition-colors duration-150 hover:text-[var(--text-secondary)] active:text-[var(--text-primary)] disabled:opacity-40"
        >
          Remove from list
        </button>
      )}
    </div>
  );
}
