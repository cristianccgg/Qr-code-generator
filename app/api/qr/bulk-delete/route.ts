import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: ids array is required" },
        { status: 400 }
      );
    }

    // Verify all QR codes belong to the user before deleting
    const qrCodes = await prisma.qRCode.findMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
      select: { id: true },
    });

    // If some QR codes don't belong to user, return error
    if (qrCodes.length !== ids.length) {
      return NextResponse.json(
        { error: "Some QR codes not found or unauthorized" },
        { status: 403 }
      );
    }

    // Delete all QR codes
    await prisma.qRCode.deleteMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: qrCodes.length,
    });
  } catch (error) {
    console.error("Error bulk deleting QR codes:", error);
    return NextResponse.json(
      { error: "Failed to delete QR codes" },
      { status: 500 }
    );
  }
}
