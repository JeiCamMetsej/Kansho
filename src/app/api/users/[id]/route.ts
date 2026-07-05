import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
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
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const readList = await prisma.readListItem.findMany({
      where: { userId: id },
      include: { manga: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ...user,
      readList,
    });
  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
