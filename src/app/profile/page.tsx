"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      const userId = (session.user as { id: string }).id;
      fetch(`/api/users/${userId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          setProfile(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-100 dark:bg-gray-900 rounded w-1/3" />
          <div className="h-4 bg-gray-100 dark:bg-gray-900 rounded w-1/4" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 rounded-sm" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center">
        <p className="text-sm text-[var(--text-secondary)]">Profile not found</p>
      </div>
    );
  }

  const tabs = [
    { id: "all", label: "All" },
    { id: "reading", label: "Reading" },
    { id: "plan_to_read", label: "Plan to Read" },
    { id: "completed", label: "Completed" },
    { id: "dropped", label: "Dropped" },
  ];

  const filtered =
    activeTab === "all"
      ? profile.readList
      : profile.readList.filter((item) => item.status === activeTab);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <h1 className="text-xl font-light tracking-tight text-[var(--text-primary)]">
          {profile.username}
        </h1>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
          Joined {new Date(profile.createdAt).toLocaleDateString()}
        </p>
        <div className="flex gap-4 mt-3">
          <span className="text-xs text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)] font-medium">
              {profile._count.readList}
            </strong>{" "}
            titles
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)] font-medium">
              {profile._count.following}
            </strong>{" "}
            following
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)] font-medium">
              {profile._count.followers}
            </strong>{" "}
            followers
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border-primary)] mb-6">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 text-xs uppercase tracking-wider transition-colors ${
                activeTab === tab.id
                  ? "text-[var(--text-primary)] border-b border-[var(--text-primary)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
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
            className="inline-block mt-3 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline underline-offset-2"
          >
            Browse manga
          </Link>
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
                <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 rounded-sm overflow-hidden">
                  {item.manga.coverUrl ? (
                    <img
                      src={item.manga.coverUrl}
                      alt={item.manga.title}
                      className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-light text-gray-300 dark:text-gray-700">
                        ?
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-medium text-[var(--text-primary)] leading-tight line-clamp-2">
                    {item.manga.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                      {item.status.replace(/_/g, " ")}
                    </span>
                    {item.rating && (
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {Array.from({ length: item.rating }, (_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </span>
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
