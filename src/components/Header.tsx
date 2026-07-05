"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/lib/ThemeContext";

import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);


  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-light tracking-tight text-[var(--text-primary)]"
          >
            kanshō
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 active:brightness-75"
            >
              Home
            </Link>
            <Link
              href="/search"
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 active:brightness-75"
            >
              Search
            </Link>
            {session && (
              <Link
                href="/readlist"
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 active:brightness-75"
              >
                My List
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle — pill style */}
            <button
              onClick={toggleTheme}
              className="relative w-11 h-6 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-primary)] p-[2px] transition-all duration-300 hover:border-[var(--text-tertiary)] active:brightness-75 shrink-0"
              aria-label="Toggle theme"
            >
              <span
                className={`w-5 h-5 rounded-full bg-[var(--text-primary)] shadow-sm transition-all duration-300 flex items-center justify-center ${
                  theme === "dark" ? "translate-x-5" : "translate-x-0"
                }`}
              >
                {theme === "dark" ? (
                  <svg className="w-3 h-3 text-[var(--bg-primary)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3 text-[var(--bg-primary)]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18.75a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                )}
              </span>
            </button>

            {/* Auth */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--text-primary)] transition-all duration-150 active:brightness-75"
                >
                  {(session.user as { username?: string })?.username ||
                    session.user?.name ||
                    "Profile"}
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-sm shadow-sm">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 active:brightness-75"
                        onClick={() => setMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/readlist"
                        className="block px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 active:brightness-75"
                        onClick={() => setMenuOpen(false)}
                      >
                        My List
                      </Link>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          signOut();
                        }}
                        className="block w-full text-left px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 active:brightness-75"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--text-primary)] transition-all duration-150 active:brightness-75"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
