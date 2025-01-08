import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // Check for API key in headers
    const authHeader = req.headers.get('authorization');
    console.log('Received auth header:', authHeader);
    console.log('Expected auth header:', `Bearer ${process.env.CLERK_SECRET_KEY}`);
    
    if (authHeader !== `Bearer ${process.env.CLERK_SECRET_KEY}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch all users from Clerk's REST API
    const response = await fetch('https://api.clerk.dev/v1/users', {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users from Clerk');
    }

    const clerkUsers = await response.json();
    
    // Sync each user to our database
    const syncedUsers = await Promise.all(
      clerkUsers.map(async (clerkUser: any) => {
        return prisma.user.upsert({
          where: { id: clerkUser.id },
          create: {
            id: clerkUser.id,
            email: clerkUser.email_addresses[0]?.email_address || "",
            firstName: clerkUser.first_name || null,
            lastName: clerkUser.last_name || null,
            displayName: clerkUser.first_name ? `${clerkUser.first_name} ${clerkUser.last_name || ""}`.trim() : null,
            imageUrl: clerkUser.image_url || null,
            lastSyncedAt: new Date(),
          },
          update: {
            email: clerkUser.email_addresses[0]?.email_address || "",
            firstName: clerkUser.first_name || null,
            lastName: clerkUser.last_name || null,
            displayName: clerkUser.first_name ? `${clerkUser.first_name} ${clerkUser.last_name || ""}`.trim() : null,
            imageUrl: clerkUser.image_url || null,
            lastSyncedAt: new Date(),
          },
        });
      })
    );

    return NextResponse.json({
      message: "Users synced successfully",
      count: syncedUsers.length,
      users: syncedUsers,
    });
  } catch (error) {
    console.error("[USERS_SYNC]", error);
    return new NextResponse(
      `Internal Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }
} 