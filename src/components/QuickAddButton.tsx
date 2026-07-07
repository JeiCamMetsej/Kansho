"use client";

import { useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { MangaDexManga } from "@/lib/mangadex";

const CYCLE_ORDER = ["completed", "reading", "plan_to_read", "dropped"] as const;
type CycleStatus = (typeof CYCLE_ORDER)[number];

interface StatusStyle {
  bg: string;
  icon: ReactNode;
}

const STATUS_ICONS: Record<CycleStatus, StatusStyle> = {
  completed: {
    bg: "bg-emerald-500/90 hover:bg-emerald-500",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  reading: {
    bg: "bg-blue-500/90",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  plan_to_read: {
    bg: "bg-amber-500/90",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  dropped: {
    bg: "bg-red-500/90",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

function getNextStatus(current: string | null | undefined): string | null {
  if (!current) return "completed";
  const idx = CYCLE_ORDER.indexOf(current as CycleStatus);
  if (idx === -1) return "completed";
  if (idx === CYCLE_ORDER.length - 1) return null;
  return CYCLE_ORDER[idx + 1];
}

interface QuickAddButtonProps {
  manga: MangaDexManga;
  currentStatus?: string | null;
  onStatusChange?: (mangaId: string, newStatus: string | null) => void;
  size?: "sm" | "md";
}

export default function QuickAddButton({
  manga,
  currentStatus,
  onStatusChange,
  size = "sm",
}: QuickAddButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState<string | null | undefined>(undefined);

  const displayStatus = optimisticStatus !== undefined ? optimisticStatus : currentStatus;
  const isActive = !!displayStatus;

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!session) {
        router.push("/login");
        return;
      }

      const nextStatus = getNextStatus(displayStatus);
      setOptimisticStatus(nextStatus);
      setLoading(true);

      try {
        if (nextStatus && !displayStatus) {
          // No existing entry — create
          const res = await fetch("/api/readlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mangaId: manga.id,
              title: manga.title,
              coverUrl: manga.coverUrl,
              description: manga.description,
              year: manga.year,
              status: nextStatus,
            }),
          });
          if (!res.ok) {
            setOptimisticStatus(displayStatus);
            return;
          }
        } else if (nextStatus && displayStatus) {
          // Existing entry — update
          const res = await fetch("/api/readlist", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mangaId: manga.id,
              status: nextStatus,
            }),
          });
          if (!res.ok) {
            setOptimisticStatus(displayStatus);
            return;
          }
        } else if (!nextStatus && displayStatus) {
          // Remove from list
          const res = await fetch(`/api/readlist?mangaId=${manga.id}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            setOptimisticStatus(displayStatus);
            return;
          }
        }

        onStatusChange?.(manga.id, nextStatus);
        router.refresh();
      } catch {
        setOptimisticStatus(displayStatus);
      } finally {
        setLoading(false);
      }
    },
    [manga, displayStatus, router, onStatusChange]
  );

  const config = STATUS_ICONS[displayStatus as CycleStatus];
  const isSm = size === "sm";
  const btnSize = isSm ? "w-7 h-7" : "w-8 h-8";

  const iconKey = loading ? "spinner" : displayStatus || "add";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${btnSize} rounded-full flex items-center justify-center text-white shadow-md backdrop-blur-sm transition-all duration-200 ease-out active:scale-75 disabled:opacity-60 ${
        isActive && config
          ? config.bg
          : "bg-white/80 text-[var(--text-secondary)]"
      }`}
      title={
        displayStatus
          ? `Click to change status (${displayStatus.replace(/_/g, " ")})`
          : "Add to reading list"
      }
    >
      <span key={iconKey} className={`${isSm ? "w-4 h-4" : "w-5 h-5"} flex items-center justify-center animate-icon-pop`}>
        {loading ? (
          <span className={`${isSm ? "w-3 h-3" : "w-4 h-4"} rounded-full border-2 border-white/30 border-t-white animate-spin`} />
        ) : isActive && config ? (
          config.icon
        ) : (
          <svg className={isSm ? "w-3.5 h-3.5" : "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        )}
      </span>
    </button>
  );
}
