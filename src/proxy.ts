import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// Clean up stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

// Rate limit config
const AUTH_RATE_LIMIT = 10; // requests per window
const AUTH_RATE_WINDOW = 15 * 60 * 1000; // 15 minutes
const API_RATE_LIMIT = 60; // requests per window
const API_RATE_WINDOW = 60 * 1000; // 1 minute

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security headers
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // Strict CSP in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'", // Next.js needs inline scripts for hydration
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' https://uploads.mangadex.org https: data: blob:",
        "font-src 'self' data:",
        "connect-src 'self' https://api.mangadex.org https:",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "base-uri 'self'",
      ].join("; ")
    );
  }

  // Determine which rate limit to apply
  const isAuthRoute = pathname.startsWith("/api/auth/") || pathname.startsWith("/api/register");

  if (isAuthRoute) {
    // Strict rate limit for auth endpoints
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    const key = `auth:${ip}`;

    const result = rateLimit(key, AUTH_RATE_LIMIT, AUTH_RATE_WINDOW);

    response.headers.set("X-RateLimit-Limit", String(AUTH_RATE_LIMIT));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }
  } else if (pathname.startsWith("/api/")) {
    // General API rate limiting (skip auth routes — already handled above)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    const key = `api:${ip}`;

    const result = rateLimit(key, API_RATE_LIMIT, API_RATE_WINDOW);

    response.headers.set("X-RateLimit-Limit", String(API_RATE_LIMIT));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));

    if (!result.allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please slow down." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all API routes
    "/api/:path*",
  ],
};
