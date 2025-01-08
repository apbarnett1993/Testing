import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session.userId;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { displayName } = await req.json();
    if (!displayName || typeof displayName !== 'string') {
      return new NextResponse("Display name is required", { status: 400 });
    }

    // Update user in our database
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: displayName.trim(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_UPDATE]", error);
    return new NextResponse(
      `Internal Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }
} 