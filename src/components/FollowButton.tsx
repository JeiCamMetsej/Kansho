"use client";

import { useSession } from "next-auth/react";
import { useState, useCallback } from "react";

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean;
  onFollowChange?: (following: boolean) => void;
}

export default function FollowButton({
  userId,
  initialFollowing = false,
  onFollowChange,
}: FollowButtonProps) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = useCallback(async () => {
    if (!session || loading) return;
    setLoading(true);

    try {
      if (following) {
        const res = await fetch(
          `/api/follow?followingId=${userId}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          setFollowing(false);
          onFollowChange?.(false);
        }
      } else {
        const res = await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingId: userId }),
        });
        if (res.ok) {
          setFollowing(true);
          onFollowChange?.(true);
        }
      }
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }, [session, loading, following, userId, onFollowChange]);

  if (!session || session.user?.id === userId) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`h-11 px-6 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-150 active:scale-95 disabled:opacity-50 inline-flex items-center gap-2 ${
        following
          ? "bg-transparent border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)]"
          : "bg-[var(--text-primary)] text-[var(--bg-primary)] border border-transparent hover:brightness-110"
      }`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : following ? (
        <>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          Following
        </>
      ) : (
        <>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          Follow
        </>
      )}
    </button>
  );
}
