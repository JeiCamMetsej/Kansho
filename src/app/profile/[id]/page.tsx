"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import StarRating from "@/components/StarRating";
import FollowButton from "@/components/FollowButton";
import CoverImage from "@/components/CoverImage";

interface FollowUser {
  id: string;
  username: string;
}

interface UserProfile {
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

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (!userId) return;

    fetch(`/api/users/${userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) {
          setError("User not found");
        } else {
          setProfile(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load user");
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[var(--bg-tertiary)] rounded w-1/3" />
          <div className="h-4 bg-[var(--bg-tertiary)] rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center">
        <p className="text-sm text-[var(--text-secondary)]">{error || "User not found"}</p>
        <Link href="/" className="inline-block mt-3 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline underline-offset-2">
          Back to browse
        </Link>
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
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light tracking-tight text-[var(--text-primary)]">
              {profile.username}
            </h1>
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
              Joined {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FollowButton
              userId={profile.id}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-3">
          <span className="text-xs text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)] font-medium">{profile._count.readList}</strong> titles
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)] font-medium">{profile._count.following}</strong> following
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)] font-medium">{profile._count.followers}</strong> followers
          </span>
        </div>

        <a
          href="https://ko-fi.com/jeicammetsej"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 h-10 px-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider rounded-sm bg-[var(--text-primary)] text-[var(--bg-primary)] hover:brightness-110 transition-all duration-150 active:brightness-75"
          aria-label="Support Kanshō on Ko-fi"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.881 8.948c-.773-1.072-2.893-1.522-4.25-1.682l-4.232-.488V5.5c0-1.307-.704-2.636-2.366-2.636H2.366C.704 2.864 0 4.192 0 5.5v13.636c0 1.307.704 2.636 2.366 2.636h10.667c1.662 0 2.366-1.329 2.366-2.636v-.297l4.268-.521c1.357-.165 3.466-.616 4.239-1.688.886-1.228.774-3.05.774-4.998 0-1.948-.106-3.77-.799-4.984zM7.255 3.705h5.513c.221 0 .443.221.443.442v.663H6.812v-.663c0-.221.222-.442.443-.442zm5.513 14.672a.738.738 0 01-.221.553c-.111.111-.221.111-.332.111H7.255a.369.369 0 01-.332-.111.738.738 0 01-.221-.553v-1.105h5.734v1.105h.332zm4.805-1.326c-1.326.166-2.311.221-3.031.221v-1.989c.829 0 1.768-.044 3.031-.166.941-.111 1.768-.332 1.768-1.105 0-.442-.332-.774-.774-.885-.166-.055-.388-.111-.664-.111v-1.989c.277 0 .498.055.664.111.442.111.774.443.774.885 0 .773-.828.994-1.768 1.105-1.263.111-2.202.166-3.031.166v-1.989c.72 0 1.705-.055 3.031-.221 1.105-.111 2.095-.443 2.652-1.105.442-.554.553-1.326.553-2.539v-1.546l4.897.553c.72.111 1.989.332 2.53.885.387.443.498 1.105.498 1.989v.111c0 1.657-.111 3.422-.387 4.53-.31 1.326-1.437 1.657-2.53 1.768l-5.513.553z" />
          </svg>
          <span>Support Kanshō</span>
        </a>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border-primary)] mb-6">
        <div className="grid grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-1.5 text-[11px] text-center uppercase tracking-wider transition-all duration-150 active:brightness-75 ${
                activeTab === tab.id
                  ? "text-[var(--text-primary)] border-b-2 border-[var(--text-primary)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] border-b-2 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">
            {activeTab === "all"
              ? `${profile.username} hasn't added any titles yet.`
              : `No titles with "${activeTab.replace(/_/g, " ")}" status.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-x-3 gap-y-6">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/manga/${item.mangaId}`}
              className="group block"
            >
              <article className="space-y-2">
                <div className="aspect-[3/4] bg-[var(--bg-tertiary)] rounded-sm overflow-hidden relative">
                  <CoverImage
                    src={item.manga.coverUrl || ""}
                    alt={item.manga.title}
                    className="transition-opacity group-hover:opacity-80"
                  />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-light text-[var(--text-primary)] leading-tight line-clamp-2">
                    {item.manga.title}
                  </h3>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                      {item.status.replace(/_/g, " ")}
                    </span>
                    {item.rating && <StarRating rating={item.rating} size="sm" />}
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
