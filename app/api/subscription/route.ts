import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSubscriptionStatus, createDefaultSubscription } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has a subscription, if not create default (free)
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingSubscription) {
      await createDefaultSubscription(session.user.id);
    }

    const status = await getSubscriptionStatus(session.user.id);

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
