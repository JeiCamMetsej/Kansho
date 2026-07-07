"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";
import FollowButton from "@/components/FollowButton";
import CoverImage from "@/components/CoverImage";

interface FollowUser {
  id: string;
  username: string;
}

interface ProfileData {
  id: string;
  username: string;
  createdAt: string;
  _count: {
    followers: number;
    following: number;
    readList: number;
  };
  readList: Array<{
    id: string;
    mangaId: string;
    status: string;
    rating: number | null;
    review: string | null;
    manga: {
      id: string;
      title: string;
      coverUrl: string;
    };
  }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      const userId = (session.user as { id: string }).id;

      Promise.all([
        fetch(`/api/users/${userId}`).then((r) => (r.ok ? r.json() : null)),
        fetch("/api/follow").then((r) => (r.ok ? r.json() : null)),
      ]).then(([profileData, followData]) => {
        setProfile(profileData);
        if (followData) {
          setFollowing(followData.following || []);
          setFollowers(followData.followers || []);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[var(--bg-tertiary)] rounded-xl w-1/3" />
          <div className="h-4 bg-[var(--bg-tertiary)] rounded-xl w-1/4" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[var(--bg-tertiary)] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-sm text-[var(--text-secondary)]">Profile not found</p>
      </div>
    );
  }

  const tabs = [
    { id: "all", label: "All" },
    { id: "plan_to_read", label: "To Read" },
    { id: "reading", label: "Reading" },
    { id: "completed", label: "Completed" },
  ];

  const filtered =
    activeTab === "all"
      ? profile.readList
      : profile.readList.filter((item) => item.status === activeTab);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Profile Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-light tracking-tight text-[var(--text-primary)]">
              {profile.username}
            </h1>
            <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">
              Joined {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {session && (
              <FollowButton
                userId={profile.id}
                initialFollowing={following.some((f) => f.id === profile.id)}
              />
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-3">
          <span className="text-xs text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)] font-medium">
              {profile._count.readList}
            </strong>{" "}
            titles
          </span>
          <button
            onClick={() => setShowFollowing(!showFollowing)}
            className="text-xs text-[var(--text-secondary)] transition-all duration-150 active:text-[var(--text-primary)]"
          >
            <strong className="text-[var(--text-primary)] font-medium">
              {following.length}
            </strong>{" "}
            following
          </button>
          <button
            onClick={() => setShowFollowers(!showFollowers)}
            className="text-xs text-[var(--text-secondary)] transition-all duration-150 active:text-[var(--text-primary)]"
          >
            <strong className="text-[var(--text-primary)] font-medium">
              {followers.length}
            </strong>{" "}
            followers
          </button>
        </div>

        <a
          href="https://ko-fi.com/jeicammetsej"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 h-10 px-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] transition-all duration-150 active:scale-[0.97]"
          aria-label="Support Kanshō on Ko-fi"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.881 8.948c-.773-1.072-2.893-1.522-4.25-1.682l-4.232-.488V5.5c0-1.307-.704-2.636-2.366-2.636H2.366C.704 2.864 0 4.192 0 5.5v13.636c0 1.307.704 2.636 2.366 2.636h10.667c1.662 0 2.366-1.329 2.366-2.636v-.297l4.268-.521c1.357-.165 3.466-.616 4.239-1.688.886-1.228.774-3.05.774-4.998 0-1.948-.106-3.77-.799-4.984zM7.255 3.705h5.513c.221 0 .443.221.443.442v.663H6.812v-.663c0-.221.222-.442.443-.442zm5.513 14.672a.738.738 0 01-.221.553c-.111.111-.221.111-.332.111H7.255a.369.369 0 01-.332-.111.738.738 0 01-.221-.553v-1.105h5.734v1.105h.332zm4.805-1.326c-1.326.166-2.311.221-3.031.221v-1.989c.829 0 1.768-.044 3.031-.166.941-.111 1.768-.332 1.768-1.105 0-.442-.332-.774-.774-.885-.166-.055-.388-.111-.664-.111v-1.989c.277 0 .498.055.664.111.442.111.774.443.774.885 0 .773-.828.994-1.768 1.105-1.263.111-2.202.166-3.031.166v-1.989c.72 0 1.705-.055 3.031-.221 1.105-.111 2.095-.443 2.652-1.105.442-.554.553-1.326.553-2.539v-1.546l4.897.553c.72.111 1.989.332 2.53.885.387.443.498 1.105.498 1.989v.111c0 1.657-.111 3.422-.387 4.53-.31 1.326-1.437 1.657-2.53 1.768l-5.513.553z" />
          </svg>
          <span>Support Kanshō</span>
        </a>

        {/* Following list */}
        {showFollowing && (
          <div className="mt-3 p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl">
            <h3 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
              Following
            </h3>
            {following.length === 0 ? (
              <p className="text-[11px] text-[var(--text-tertiary)]">Not following anyone yet.</p>
            ) : (
              <div className="space-y-1">
                {following.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    className="block text-[11px] text-[var(--text-secondary)] transition-colors duration-150 active:text-[var(--text-primary)]"
                  >
                    {user.username}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Followers list */}
        {showFollowers && (
          <div className="mt-3 p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl">
            <h3 className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
              Followers
            </h3>
            {followers.length === 0 ? (
              <p className="text-[11px] text-[var(--text-tertiary)]">No followers yet.</p>
            ) : (
              <div className="space-y-1">
                {followers.map((user) => (
                  <Link
                    key={user.id}
                    href={`/profile/${user.id}`}
                    className="block text-[11px] text-[var(--text-secondary)] transition-colors duration-150 active:text-[var(--text-primary)]"
                  >
                    {user.username}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border-primary)] mb-5">
        <div className="grid grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 text-[11px] text-center uppercase tracking-wider transition-all duration-150 active:scale-[0.97] ${
                activeTab === tab.id
                  ? "text-[var(--text-primary)] border-b-2 border-[var(--text-primary)]"
                  : "text-[var(--text-tertiary)] border-b-2 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">
            {activeTab === "all"
              ? "No titles in your list yet."
              : `No titles with "${activeTab.replace(/_/g, " ")}" status.`}
          </p>
          <Link
            href="/"
            className="inline-block mt-3 text-xs text-[var(--text-secondary)] underline underline-offset-2 transition-all duration-150 active:text-[var(--text-primary)]"
          >
            Browse manga
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/manga/${item.mangaId}`}
              className="active:scale-[0.97] transition-transform duration-150"
            >
              <article className="space-y-1.5">
                <div className="aspect-[3/4] bg-[var(--bg-tertiary)] rounded-xl overflow-hidden shadow-sm relative">
                  <CoverImage
                    src={item.manga.coverUrl || ""}
                    alt={item.manga.title}
                  />
                </div>
                <div className="space-y-0.5 px-0.5">
                  <h3 className="text-[11px] font-light text-[var(--text-primary)] leading-tight line-clamp-2">
                    {item.manga.title}
                  </h3>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                      {item.status.replace(/_/g, " ")}
                    </span>
                    {item.rating && (
                      <StarRating rating={item.rating} size="sm" />
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
