"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StarRating from "@/components/StarRating";

interface ReadListItem {
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
}

export default function ReadlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<ReadListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/readlist")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setItems(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[var(--bg-tertiary)] rounded w-1/4" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[var(--bg-tertiary)] rounded-sm" />
            ))}
          </div>
        </div>
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
      ? items
      : items.filter((item) => item.status === activeTab);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-light tracking-tight text-[var(--text-primary)]">
          My List
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {items.length} title{items.length !== 1 ? "s" : ""}
        </p>
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
              ? "Your list is empty. Start by browsing manga!"
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
                <div className="aspect-[3/4] bg-[var(--bg-tertiary)] rounded-sm overflow-hidden">
                  {item.manga.coverUrl ? (
                    <img
                      src={item.manga.coverUrl}
                      alt={item.manga.title}
                      className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-light text-[var(--text-tertiary)]">
                        ?
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs font-light text-[var(--text-primary)] leading-tight line-clamp-2">
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
