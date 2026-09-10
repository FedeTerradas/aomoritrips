import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionToken = request.headers.get("x-session-token");
  if (!sessionToken) {
    return NextResponse.json(
      { success: false, error: "No session token" },
      { status: 401 }
    );
  }

  try {
    const p = await params;
    const item = await prisma.bucketListItem.findUnique({
      where: { id: p.id },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    if (item.sessionToken !== sessionToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.bucketListItem.delete({
      where: { id: p.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
