import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { uploadFileServer } from "@/lib/supabase-server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof Blob)) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return new NextResponse("File too large. Maximum size is 10MB", { status: 400 });
    }

    // Check file type
    const allowedTypes = [
      'image/',
      'video/',
      'audio/',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    if (!allowedTypes.some(type => file.type.startsWith(type))) {
      return new NextResponse("File type not allowed", { status: 400 });
    }

    try {
      const result = await uploadFileServer(file);
      return NextResponse.json(result);
    } catch (uploadError) {
      console.error("[UPLOAD] Supabase upload error:", uploadError);
      return new NextResponse(
        "Failed to upload file to storage",
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[UPLOAD] Request error:", error);
    return new NextResponse(
      `Internal Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }
} 