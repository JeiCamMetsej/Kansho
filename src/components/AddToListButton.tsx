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

export default function AddToListButton({
  manga,
  currentStatus,
  currentRating,
}: AddToListButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [status, setStatus] = useState<string | null>(currentStatus ?? null);
  const [rating, setRating] = useState<number | null>(currentRating ?? null);
  const [loading, setLoading] = useState(false);

  const handleAddToList = useCallback(
    async (newStatus: StatusOption) => {
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
            status: newStatus,
          }),
        });

        if (res.ok) {
          setStatus(newStatus);
          setShowMenu(false);
          router.refresh();
        }
      } finally {
        setLoading(false);
      }
    },
    [session, manga, router]
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
        setShowMenu(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }, [manga.id, router]);

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

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (!session) {
            router.push("/login");
            return;
          }
          setShowMenu(!showMenu);
        }}
        disabled={loading}
        className="w-full h-9 text-xs font-medium uppercase tracking-wider bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {status ? STATUS_LABELS[status as StatusOption] || "In List" : "Add to List"}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute left-0 top-full mt-1 z-20 w-44 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm shadow-sm">
            {(Object.entries(STATUS_LABELS) as [StatusOption, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleAddToList(key)}
                  className={`block w-full text-left px-4 py-2 text-xs transition-colors ${
                    status === key
                      ? "text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {label}
                </button>
              )
            )}

            {status && (
              <>
                <div className="border-t border-gray-100 dark:border-gray-800" />
                <div className="px-4 py-2">
                  <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">
                    Rating
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRate(star)}
                        className={`text-sm transition-colors ${
                          rating && star <= rating
                            ? "text-gray-900 dark:text-gray-100"
                            : "text-gray-200 dark:text-gray-800"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800" />
                <button
                  onClick={handleRemove}
                  className="block w-full text-left px-4 py-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  Remove from list
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
