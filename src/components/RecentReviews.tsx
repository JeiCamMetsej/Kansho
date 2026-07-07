"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StarRating from "./StarRating";
import CoverImage from "./CoverImage";

interface ReviewItem {
  id: string;
  rating: number;
  review: string;
  manga: {
    id: string;
    title: string;
    coverUrl: string;
  };
  user: {
    id: string;
    username: string;
  };
  createdAt: string;
}

export default function RecentReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setReviews(data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (reviews.length === 0) return null;

  return (
    <section className="mt-10 pt-8 border-t border-[var(--border-primary)]">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-4">
        Recent Reviews
      </h2>
      <div className="space-y-3">
        {reviews.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
          >
            {/* Manga cover thumbnail */}
            <Link
              href={`/manga/${item.manga.id}`}
              className="shrink-0 w-10 rounded-lg overflow-hidden bg-[var(--bg-tertiary)] aspect-[3/4] relative"
            >
              <CoverImage
                src={item.manga.coverUrl || ""}
                alt={item.manga.title}
              />
            </Link>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/manga/${item.manga.id}`}
                  className="text-xs font-light text-[var(--text-primary)] truncate max-w-[160px]"
                >
                  {item.manga.title}
                </Link>
                <span className="text-[10px] text-[var(--text-tertiary)]">by</span>
                <Link
                  href={`/profile/${item.user.id}`}
                  className="text-[11px] text-[var(--text-secondary)]"
                >
                  {item.user.username}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <StarRating rating={item.rating} size="sm" />
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">
                &ldquo;{item.review}&rdquo;
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
