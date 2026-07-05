"use client";

import { useSession } from "next-auth/react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { MangaDexManga } from "@/lib/mangadex";

interface AddToListButtonProps {
  manga: MangaDexManga;
  currentStatus?: string | null;
  currentRating?: number | null;
}

type StatusOption = "plan_to_read" | "reading" | "completed" | "dropped";

const STATUS_LABELS: Record<StatusOption, string> = {
  plan_to_read: "Plan to Read",
  reading: "Reading",
  completed: "Completed",
  dropped: "Dropped",
};

const STATUS_ORDER: StatusOption[] = [
  "plan_to_read",
  "reading",
  "completed",
  "dropped",
];

export default function AddToListButton({
  manga,
  currentStatus,
  currentRating,
}: AddToListButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(currentStatus ?? null);
  const [rating, setRating] = useState<number | null>(currentRating ?? null);
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleAdd = useCallback(async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
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
        }),
      });

      if (res.ok) {
        setStatus("plan_to_read");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }, [session, manga, router]);

  const handleCycleStatus = useCallback(async () => {
    if (!status) return;
    const currentIndex = STATUS_ORDER.indexOf(status as StatusOption);
    const nextStatus = STATUS_ORDER[(currentIndex + 1) % STATUS_ORDER.length];

    setLoading(true);
    try {
      const res = await fetch("/api/readlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mangaId: manga.id,
          status: nextStatus,
        }),
      });

      if (res.ok) {
        setStatus(nextStatus);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }, [status, manga.id, router]);

  const handleStatusChange = useCallback(
    async (newStatus: StatusOption) => {
      setLoading(true);
      try {
        const res = await fetch("/api/readlist", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mangaId: manga.id,
            status: newStatus,
          }),
        });

        if (res.ok) {
          setStatus(newStatus);
          setShowOptions(false);
          router.refresh();
        }
      } finally {
        setLoading(false);
      }
    },
    [manga.id, router]
  );

  const handleRate = useCallback(
    async (newRating: number) => {
      if (!status) return;
      setLoading(true);
      try {
        const res = await fetch("/api/readlist", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mangaId: manga.id,
            rating: newRating,
          }),
        });

        if (res.ok) {
          setRating(newRating);
          router.refresh();
        }
      } finally {
        setLoading(false);
      }
    },
    [manga.id, status, router]
  );

  const handleRemove = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/readlist?mangaId=${manga.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setStatus(null);
        setRating(null);
        setShowOptions(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }, [manga.id, router]);

  if (!session) return null;

  return (
    <div>
      {!status ? (
        <button
          onClick={handleAdd}
          disabled={loading}
          className="h-8 px-4 text-xs font-medium uppercase tracking-wider bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-80 transition-opacity disabled:opacity-50 rounded-sm"
        >
          {loading ? "..." : "Add to List"}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOptions(!showOptions)}
              disabled={loading}
              className="h-8 px-4 text-xs font-medium uppercase tracking-wider bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-80 transition-opacity disabled:opacity-50 rounded-sm"
            >
              {STATUS_LABELS[status as StatusOption] || "In List"}
            </button>
          </div>

          {showOptions && (
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap gap-1">
                {(Object.entries(STATUS_LABELS) as [StatusOption, string][]).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      onClick={() => handleStatusChange(key)}
                      disabled={loading}
                      className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-sm transition-colors ${
                        status === key
                          ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
                          : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:border-[var(--text-tertiary)]"
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                  Rating:
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(star)}
                      disabled={loading}
                      className={`text-sm transition-colors ${
                        rating && star <= rating
                          ? "text-[var(--text-primary)]"
                          : "text-[var(--border-primary)]"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleRemove}
                disabled={loading}
                className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
