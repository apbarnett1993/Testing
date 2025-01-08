import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const channels = await prisma.channel.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(channels);
  } catch (error) {
    console.error("[CHANNELS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const channel = await prisma.channel.create({
      data: {
        name,
      },
    });

    return NextResponse.json(channel);
  } catch (error) {
    console.error("[CHANNELS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 