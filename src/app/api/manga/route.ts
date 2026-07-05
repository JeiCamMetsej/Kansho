import { NextRequest, NextResponse } from "next/server";
import { fetchMangaList, searchManga } from "@/lib/mangadex";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
    const offset = Number(searchParams.get("offset")) || 0;

    if (query) {
      const result = await searchManga(query, limit, offset);
      return NextResponse.json(result, {
        headers: {
          "Cache-Control": "public, max-age=120",
        },
      });
    }

    const result = await fetchMangaList(limit, offset);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=120",
      },
    });
  } catch (error) {
    console.error("Manga API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch manga" },
      { status: 500 }
    );
  }
}
