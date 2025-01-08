import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    // Get the current user's ID
    const session = await auth();
    if (!session?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all users from Clerk
    const response = await fetch('https://api.clerk.dev/v1/users', {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const users = await response.json();
    console.log('Fetched users:', users);

    // Map all users to simplified objects, including the current user
    const allUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email_addresses[0]?.email_address || 'No email',
    }));

    console.log('Returning users:', allUsers);
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 