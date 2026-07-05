import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query.trim(),
        },
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            readList: true,
          },
        },
      },
      orderBy: { username: "asc" },
      take: 20,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("User search API error:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
