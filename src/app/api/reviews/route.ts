import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reviews = await prisma.readListItem.findMany({
      where: {
        rating: { not: null },
        review: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        manga: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Reviews API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
