"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PopularManga from "@/components/PopularManga";
import RecentReviews from "@/components/RecentReviews";

function LoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="w-full max-w-md h-9 bg-[var(--bg-tertiary)] rounded-sm animate-pulse" />
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-3 gap-y-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2 animate-pulse">
            <div className="aspect-[3/4] bg-[var(--bg-tertiary)] rounded-sm" />
            <div className="h-3 bg-[var(--bg-tertiary)] rounded w-3/4" />
            <div className="h-2 bg-[var(--bg-tertiary)] rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-tertiary)]/50 to-transparent pointer-events-none animate-fade-in" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40 text-center">
        {/* App name */}
        <h1 className="animate-fade-up text-5xl sm:text-6xl lg:text-7xl font-light tracking-[0.15em] text-[var(--text-primary)]">
          kanshō
        </h1>

        {/* Divider */}
        <div className="animate-fade-up delay-100 mx-auto mt-6 h-px w-16 bg-[var(--text-tertiary)]" />

        {/* Tagline */}
        <p className="animate-fade-up delay-200 mt-6 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-lg mx-auto tracking-[0.08em]">
          Track, discover, and share your manhwa and manga reading journey.
        </p>

        {/* CTA buttons */}
        <div className="animate-fade-up delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex h-12 px-8 items-center justify-center text-sm font-semibold uppercase tracking-[0.12em] bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-sm transition-all duration-150 hover:brightness-110 active:brightness-75"
          >
            Get started
          </Link>
          <Link
            href="/search"
            className="inline-flex h-12 px-8 items-center justify-center text-sm font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)] border border-[var(--border-primary)] rounded-sm transition-all duration-150 hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] active:brightness-75"
          >
            Browse manga
          </Link>
        </div>

        {/* Feature hints */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
          <div className="animate-fade-up delay-400 group cursor-default">
            <div className="rounded-sm p-6 transition-all duration-300 group-hover:bg-[var(--bg-tertiary)] group-hover:-translate-y-1">
              <div className="mx-auto h-8 w-8 flex items-center justify-center text-[var(--text-secondary)] transition-all duration-300 group-hover:text-[var(--text-primary)] group-hover:scale-110">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992z" />
                </svg>
              </div>
              <h3 className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">
                Discover
              </h3>
              <p className="mt-1 text-xs text-[var(--text-tertiary)] leading-relaxed group-hover:text-[var(--text-secondary)] transition-colors duration-300">
                Explore trending and hidden gem series
              </p>
            </div>
          </div>
          <div className="animate-fade-up delay-500 group cursor-default">
            <div className="rounded-sm p-6 transition-all duration-300 group-hover:bg-[var(--bg-tertiary)] group-hover:-translate-y-1">
              <div className="mx-auto h-8 w-8 flex items-center justify-center text-[var(--text-secondary)] transition-all duration-300 group-hover:text-[var(--text-primary)] group-hover:scale-110">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12h6" /><path d="M12 9v6" /><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />
                </svg>
              </div>
              <h3 className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">
                Track
              </h3>
              <p className="mt-1 text-xs text-[var(--text-tertiary)] leading-relaxed group-hover:text-[var(--text-secondary)] transition-colors duration-300">
                Build and manage your personal reading list
              </p>
            </div>
          </div>
          <div className="animate-fade-up delay-600 group cursor-default">
            <div className="rounded-sm p-6 transition-all duration-300 group-hover:bg-[var(--bg-tertiary)] group-hover:-translate-y-1">
              <div className="mx-auto h-8 w-8 flex items-center justify-center text-[var(--text-secondary)] transition-all duration-300 group-hover:text-[var(--text-primary)] group-hover:scale-110">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-primary)]">
                Share
              </h3>
              <p className="mt-1 text-xs text-[var(--text-tertiary)] leading-relaxed group-hover:text-[var(--text-secondary)] transition-colors duration-300">
                Rate and review what you&apos;ve read
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { data: session } = useSession();

  // Unauthenticated — show landing page
  if (!session) {
    return <LandingHero />;
  }

  // Authenticated — show dashboard
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={null}>
        <RecentReviews />
      </Suspense>

      <hr className="my-10 border-t border-[var(--border-primary)]" />

      <div className="mb-8">
        <p className="text-sm text-[var(--text-secondary)]">
          Browse trending manhwa and manga
        </p>
      </div>

      <Suspense fallback={<LoadingFallback />}>
        <PopularManga />
      </Suspense>
    </div>
  );
}
