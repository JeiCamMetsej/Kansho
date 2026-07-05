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
      className={`h-10 px-5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all duration-150 active:brightness-75 disabled:opacity-50 ${
        following
          ? "bg-transparent border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)]"
          : "bg-[var(--text-primary)] text-[var(--bg-primary)] border border-transparent hover:brightness-110"
      }`}
    >
      {loading ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}
