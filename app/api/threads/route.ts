import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await req.json();
    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    // Get or create thread
    const thread = await prisma.thread.upsert({
      where: {
        parentMessageId: messageId,
      },
      update: {},
      create: {
        parentMessageId: messageId,
        participants: {
          connect: [{ id: session.userId }],
        },
      },
      include: {
        parentMessage: {
          include: {
            user: true,
            reactions: {
              include: {
                user: true,
              },
            },
          },
        },
        messages: {
          include: {
            user: true,
            reactions: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        participants: true,
      },
    });

    return NextResponse.json(thread);
  } catch (error) {
    console.error("Failed to create/get thread:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 