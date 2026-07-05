import { NextRequest, NextResponse } from "next/server";
import { fetchMangaList, searchManga, fetchTags } from "@/lib/mangadex";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
    const offset = Number(searchParams.get("offset")) || 0;
    const lang = searchParams.get("lang") || "en";
    const tagsParam = searchParams.get("tags");
    const includedTags = tagsParam ? tagsParam.split(",").filter(Boolean) : [];

    if (query) {
      const result = await searchManga(query, limit, offset, lang, includedTags);
      return NextResponse.json(result, {
        headers: {
          "Cache-Control": "public, max-age=120",
        },
      });
    }

    const result = await fetchMangaList(limit, offset, lang, includedTags);
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

export async function POST(req: NextRequest) {
  try {
    const tags = await fetchTags();
    return NextResponse.json(tags, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Tags API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}
