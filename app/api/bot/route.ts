import { NextResponse } from "next/server";
import { Server as ServerIO } from "socket.io";
import { prisma } from "@/lib/db";
import { MessageWithUser } from "@/types/socket";
import { queryDocuments } from "@/lib/rag";

export async function POST(req: Request) {
  try {
    const { content, userId, channelId, toUserId, threadId } = await req.json();

    // Extract user's question (everything before "bot:")
    const userQuestion = content.split("bot:")[0].trim();

    // Get response from RAG
    const botResponse = await queryDocuments(userQuestion);

    // Create message with the combined user message and bot response
    const dbMessage = await prisma.message.create({
      data: {
        content: `${userQuestion}\nbot: ${botResponse}`,
        userId,
        channelId,
        toUserId,
        threadId,
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
        },
        reactions: {
          include: {
            user: {
              select: {
                displayName: true,
                email: true,
              }
            },
          },
        },
        attachments: true,
        thread: {
          include: {
            messages: {
              include: {
                user: true,
                reactions: {
                  include: {
                    user: true,
                  },
                },
                attachments: true,
              },
            },
          },
        },
      },
    });

    // Convert to MessageWithUser type
    const botMessage: MessageWithUser = {
      id: dbMessage.id,
      content: dbMessage.content,
      userId: dbMessage.userId,
      channelId: dbMessage.channelId,
      toUserId: dbMessage.toUserId,
      threadId: dbMessage.threadId,
      createdAt: dbMessage.createdAt,
      updatedAt: dbMessage.updatedAt,
      user: dbMessage.user,
      reactions: dbMessage.reactions,
      attachments: dbMessage.attachments,
      thread: dbMessage.thread ? {
        id: dbMessage.thread.id,
        messages: dbMessage.thread.messages as MessageWithUser[],
      } : null,
    };

    // Get the socket server instance
    const io = (global as any).io as ServerIO;
    if (!io) {
      throw new Error("Socket server not initialized");
    }

    // Broadcast the message
    if (channelId) {
      io.to(`channel:${channelId}`).emit("message", botMessage);
    } else if (toUserId) {
      io.to(`user:${userId}`).to(`user:${toUserId}`).emit("message", botMessage);
    }

    return NextResponse.json(botMessage);
  } catch (error) {
    console.error("[BOT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 