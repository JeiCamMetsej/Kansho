import { NextResponse } from "next/server";
import { fetchMangaById } from "@/lib/mangadex";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const manga = await fetchMangaById(id);

    if (!manga) {
      return NextResponse.json(
        { error: "Manga not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(manga);
  } catch (error) {
    console.error("Manga detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch manga details" },
      { status: 500 }
    );
  }
}
