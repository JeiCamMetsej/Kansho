"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import FollowButton from "./FollowButton";

interface SearchedUser {
  id: string;
  username: string;
  createdAt: string;
  _count: {
    followers: number;
    following: number;
    readList: number;
  };
}

export default function UserSearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [users, setUsers] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setUsers([]);
      return;
    }

    setLoading(true);
    fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`)
      .then((res) => (res.ok ? res.json() : { users: [] }))
      .then((data) => {
        setUsers(data.users || []);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [query]);

  if (!query || users.length === 0) return null;

  return (
    <div>              <h2 className="text-xs font-light uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
        Users
      </h2>
      <div className="space-y-1">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between py-2 px-3 rounded-sm hover:bg-[var(--bg-secondary)] transition-colors duration-150"
          >
            <Link
              href={`/profile/${user.id}`}
              className="flex items-center gap-3 min-w-0"
            >
              <div className="w-7 h-7 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0">
                <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p                  className="text-xs font-light text-[var(--text-primary)] truncate">
                  {user.username}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)]">
                  {user._count.readList} titles &middot; {user._count.followers} followers
                </p>
              </div>
            </Link>
            <FollowButton userId={user.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
