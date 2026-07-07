import { NextRequest, NextResponse } from "next/server";

const YEAR_IN_SECONDS = 31536000;
const MAX_MEMORY_CACHE = 200;

interface CacheEntry {
  data: ArrayBuffer;
  contentType: string;
}

// In-memory cache for the current process — avoids serialization overhead
// of the Next.js data cache for repeat requests within the same instance.
const memoryCache = new Map<string, CacheEntry>();

function getCacheKey(mangaId: string, fileName: string, size: string): string {
  return `${mangaId}/${fileName}/${size}`;
}

function setMemoryCache(key: string, entry: CacheEntry): void {
  if (memoryCache.size >= MAX_MEMORY_CACHE) {
    const oldest = memoryCache.keys().next().value;
    if (oldest) memoryCache.delete(oldest);
  }
  memoryCache.set(key, entry);
}

const CACHE_HEADERS = {
  "Cache-Control": `public, max-age=${YEAR_IN_SECONDS}, s-maxage=${YEAR_IN_SECONDS}, immutable`,
  "Access-Control-Allow-Origin": "*",
};

async function fetchCover(
  url: string,
  acceptHeader: string
): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  const res = await fetch(url, {
    // Next.js data cache — caches the upstream response on disk (or Vercel's cache store).
    // Since MangaDex cover URLs are immutable (the UUID changes when a cover updates),
    // we never need to revalidate.
    cache: "force-cache",
    headers: {
      "User-Agent": "Kansho/1.0",
      Accept: acceptHeader,
    },
  });

  if (!res.ok) return null;

  return {
    buffer: await res.arrayBuffer(),
    contentType: res.headers.get("Content-Type") || "image/jpeg",
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mangaId: string; fileName: string }> }
) {
  try {
    const { mangaId, fileName } = await params;
    const size = req.nextUrl.searchParams.get("size") || "256";

    if (!mangaId || !fileName) {
      return new NextResponse("Missing mangaId or fileName", { status: 400 });
    }

    // Validate params to prevent path traversal
    if (!/^[a-f0-9-]+$/i.test(mangaId) || !/^[a-f0-9-]+$/i.test(fileName)) {
      return new NextResponse("Invalid mangaId or fileName", { status: 400 });
    }

    const cacheKey = getCacheKey(mangaId, fileName, size);

    // 1. Check in-memory cache (fastest)
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      return new NextResponse(cached.data, {
        headers: {
          "Content-Type": cached.contentType,
          ...CACHE_HEADERS,
        },
      });
    }

    // 2. Fetch from MangaDex (via Next.js data cache for persistence)
    const coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.${size}.jpg`;
    const result = await fetchCover(
      coverUrl,
      "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8"
    );

    if (result) {
      // Warm the in-memory cache for subsequent requests
      // Copy the buffer so the original can be consumed by the response
      setMemoryCache(cacheKey, {
        data: result.buffer.slice(0),
        contentType: result.contentType,
      });

      return new NextResponse(result.buffer, {
        headers: {
          "Content-Type": result.contentType,
          ...CACHE_HEADERS,
        },
      });
    }

    // 3. Fallback — try without size suffix
    const fallbackUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.jpg`;
    const fallbackResult = await fetchCover(fallbackUrl, "image/*");

    if (!fallbackResult) {
      return new NextResponse("Cover not found", { status: 404 });
    }

    setMemoryCache(cacheKey, {
      data: fallbackResult.buffer.slice(0),
      contentType: fallbackResult.contentType,
    });

    return new NextResponse(fallbackResult.buffer, {
      headers: {
        "Content-Type": fallbackResult.contentType,
        ...CACHE_HEADERS,
      },
    });
  } catch (error) {
    console.error("Cover proxy error:", error);
    return new NextResponse("Failed to proxy cover", { status: 500 });
  }
}
