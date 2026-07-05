import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["plan_to_read", "reading", "completed", "dropped"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(value: string): value is ValidStatus {
  return VALID_STATUSES.includes(value as ValidStatus);
}

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return (session?.user?.id as string) ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mangaId = searchParams.get("mangaId");

    if (mangaId) {
      const item = await prisma.readListItem.findUnique({
        where: {
          userId_mangaId: { userId, mangaId },
        },
        include: { manga: true },
      });
      return NextResponse.json(item, {
        headers: { "Cache-Control": "private, max-age=30" },
      });
    }

    const items = await prisma.readListItem.findMany({
      where: { userId },
      include: { manga: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items, {
      headers: { "Cache-Control": "private, max-age=30" },
    });
  } catch (error) {
    console.error("Readlist API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch readlist" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mangaId, title, coverUrl, description, year, status, rating, review } =
      await req.json();

    if (!mangaId || !title) {
      return NextResponse.json(
        { error: "mangaId and title are required" },
        { status: 400 }
      );
    }

    const finalStatus = status || "plan_to_read";
    if (!isValidStatus(finalStatus)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + VALID_STATUSES.join(", ") },
        { status: 400 }
      );
    }

    if (rating !== undefined) {
      if (rating !== null && (typeof rating !== 'number' || rating < 0.5 || rating > 5 || (rating * 2) % 1 !== 0)) {
        return NextResponse.json(
          { error: "Rating must be between 0.5 and 5 in increments of 0.5, or null to clear" },
          { status: 400 }
        );
      }
    }

    await prisma.manga.upsert({
      where: { id: mangaId },
      update: { title, coverUrl, description, year },
      create: { id: mangaId, title, coverUrl, description, year },
    });

    const item = await prisma.readListItem.upsert({
      where: {
        userId_mangaId: { userId, mangaId },
      },
      update: {
        status: finalStatus,
        ...(rating !== undefined && { rating }),
        ...(review !== undefined && { review }),
      },
      create: {
        userId,
        mangaId,
        status: finalStatus,
        ...(rating !== undefined && { rating }),
        ...(review !== undefined && { review }),
      },
      include: { manga: true },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Readlist API error:", error);
    return NextResponse.json(
      { error: "Failed to add to readlist" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mangaId, status, rating, review } = await req.json();

    if (!mangaId) {
      return NextResponse.json(
        { error: "mangaId is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.readListItem.findUnique({
      where: {
        userId_mangaId: { userId, mangaId },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Readlist item not found. Add it first." },
        { status: 404 }
      );
    }

    if (status && !isValidStatus(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + VALID_STATUSES.join(", ") },
        { status: 400 }
      );
    }

    if (rating !== undefined) {
      if (rating !== null && (typeof rating !== 'number' || rating < 0.5 || rating > 5 || (rating * 2) % 1 !== 0)) {
        return NextResponse.json(
          { error: "Rating must be between 0.5 and 5 in increments of 0.5, or null to clear" },
          { status: 400 }
        );
      }
    }

    const item = await prisma.readListItem.update({
      where: {
        userId_mangaId: { userId, mangaId },
      },
      data: {
        ...(status && { status }),
        ...(rating !== undefined && { rating }),
        ...(review !== undefined && { review }),
      },
      include: { manga: true },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Readlist API error:", error);
    return NextResponse.json(
      { error: "Failed to update readlist item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mangaId = searchParams.get("mangaId");

    if (!mangaId) {
      return NextResponse.json(
        { error: "mangaId is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.readListItem.findUnique({
      where: {
        userId_mangaId: { userId, mangaId },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Readlist item not found" },
        { status: 404 }
      );
    }

    await prisma.readListItem.delete({
      where: {
        userId_mangaId: { userId, mangaId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Readlist API error:", error);
    return NextResponse.json(
      { error: "Failed to remove from readlist" },
      { status: 500 }
    );
  }
}
