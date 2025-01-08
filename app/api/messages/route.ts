import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session.userId;
    console.log("POST - Auth check:", { userId });
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content, channelId, toUserId } = await req.json();
    console.log("POST - Message data:", { content, channelId, toUserId });

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        userId,
        channelId,
        toUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          }
        }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGES_POST] Full error:", error);
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    console.log("GET - Starting request");
    const session = await auth();
    const userId = session.userId;
    console.log("GET - Auth check:", { userId });

    if (!userId) {
      console.log("GET - No user found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");
    const toUserId = searchParams.get("toUserId");

    console.log("GET - Fetching messages with:", { channelId, toUserId, userId });

    let messages;
    if (channelId) {
      // Get channel messages
      console.log("GET - Fetching channel messages for channelId:", channelId);
      messages = await prisma.message.findMany({
        where: {
          channelId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            }
          }
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      console.log("GET - Found channel messages:", messages.length);
    } else if (toUserId) {
      // Get DM messages
      console.log("GET - Fetching DM messages for toUserId:", toUserId);
      messages = await prisma.message.findMany({
        where: {
          OR: [
            { userId, toUserId },
            { userId: toUserId, toUserId: userId },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            }
          }
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      console.log("GET - Found DM messages:", messages.length);
    } else {
      console.log("GET - No channelId or toUserId provided");
      return new NextResponse("Channel ID or User ID is required", { status: 400 });
    }

    console.log("GET - Successfully found messages:", messages);
    return NextResponse.json(messages);
  } catch (error) {
    console.error("[MESSAGES_GET] Full error:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
} 