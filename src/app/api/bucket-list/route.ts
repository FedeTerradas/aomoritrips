import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const sessionToken = request.headers.get("x-session-token");
  if (!sessionToken) {
    return NextResponse.json(
      { success: false, error: "No session token" },
      { status: 401 }
    );
  }

  try {
    const items = await prisma.bucketListItem.findMany({
      where: { sessionToken },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch bucket list" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const sessionToken = request.headers.get("x-session-token");
  if (!sessionToken) {
    return NextResponse.json(
      { success: false, error: "No session token" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { itemType, refId, title, imageUrl, notes } = body;

    const newItem = await prisma.bucketListItem.create({
      data: {
        sessionToken,
        itemType,
        refId,
        title,
        imageUrl,
        notes,
      },
    });
    return NextResponse.json({ success: true, data: newItem });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create bucket list item" },
      { status: 500 }
    );
  }
}
