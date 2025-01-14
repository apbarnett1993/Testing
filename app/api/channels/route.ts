import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    console.log('GET /api/channels - Starting request');
    const channels = await prisma.channel.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log('GET /api/channels - Found channels:', channels.length);
    return NextResponse.json(channels);
  } catch (error) {
    console.error("[CHANNELS_GET] Full error:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log('POST /api/channels - Starting request');
    const user = await currentUser();
    if (!user) {
      console.log('POST /api/channels - No user found');
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log('POST /api/channels - Request body:', body);
    
    const { name } = body;
    if (!name) {
      console.log('POST /api/channels - No name provided');
      return new NextResponse("Name is required", { status: 400 });
    }

    const channel = await prisma.channel.create({
      data: {
        name,
      },
    });
    
    console.log('POST /api/channels - Created channel:', channel);
    return NextResponse.json(channel);
  } catch (error) {
    console.error("[CHANNELS_POST] Full error:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return new NextResponse(`Internal Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
} 