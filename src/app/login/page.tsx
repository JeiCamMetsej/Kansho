"use client";

import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        if (mode === "register") {
          const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Registration failed");
          }
        }

        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        router.push("/");
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    },
    [mode, username, email, password, router]
  );

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:py-24">
      <div className="mb-8">
        <h1 className="text-xl font-light tracking-tight text-[var(--text-primary)]">
          {mode === "login" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {mode === "login"
            ? "Sign in to manage your reading list"
            : "Join to track and share your reads"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className="w-full h-9 px-3 text-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
              placeholder="your username"
            />
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-9 px-3 text-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full h-9 px-3 text-sm bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--text-secondary)] transition-colors"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-9 text-xs font-medium uppercase tracking-wider bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Sign in"
            : "Create account"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline underline-offset-2"
        >
          {mode === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
