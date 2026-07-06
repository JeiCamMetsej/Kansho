import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ mangaId: string; fileName: string }> }
) {
  try {
    const { mangaId, fileName } = await params;

    if (!mangaId || !fileName) {
      return new NextResponse("Missing mangaId or fileName", { status: 400 });
    }

    // Validate params to prevent path traversal
    if (!/^[a-f0-9-]+$/i.test(mangaId) || !/^[a-f0-9-]+$/i.test(fileName)) {
      return new NextResponse("Invalid mangaId or fileName", { status: 400 });
    }

    const coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.512.jpg`;

    const res = await fetch(coverUrl, {
      headers: {
        "User-Agent": "Kansho/1.0",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });

    if (!res.ok) {
      // Try without size suffix as fallback
      const fallbackUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.jpg`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: {
          "User-Agent": "Kansho/1.0",
          Accept: "image/*",
        },
      });

      if (!fallbackRes.ok) {
        return new NextResponse("Cover not found", { status: 404 });
      }

      const buffer = await fallbackRes.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": fallbackRes.headers.get("Content-Type") || "image/jpeg",
          "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Cover proxy error:", error);
    return new NextResponse("Failed to proxy cover", { status: 500 });
  }
}
