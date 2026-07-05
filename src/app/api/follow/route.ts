import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUserId(): Promise<string | null> {
  const session = await auth();
  return (session?.user?.id as string) ?? null;
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: { id: true, username: true },
        },
      },
    });

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: { id: true, username: true },
        },
      },
    });

    return NextResponse.json({
      following: following.map((f) => f.following),
      followers: followers.map((f) => f.follower),
    });
  } catch (error) {
    console.error("Follow API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch follows" },
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

    const { followingId } = await req.json();

    if (!followingId) {
      return NextResponse.json(
        { error: "followingId is required" },
        { status: 400 }
      );
    }

    if (userId === followingId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 409 }
      );
    }

    const follow = await prisma.follow.create({
      data: {
        followerId: userId,
        followingId,
      },
    });

    return NextResponse.json(follow, { status: 201 });
  } catch (error) {
    console.error("Follow API error:", error);
    return NextResponse.json(
      { error: "Failed to follow user" },
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
    const followingId = searchParams.get("followingId");

    if (!followingId) {
      return NextResponse.json(
        { error: "followingId is required" },
        { status: 400 }
      );
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Follow API error:", error);
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500 }
    );
  }
}
