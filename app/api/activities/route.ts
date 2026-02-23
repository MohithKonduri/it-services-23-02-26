import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const limit = parseInt(new URL(req.url).searchParams.get("limit") || "50");
        const activities = await prisma.activityLog.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true, role: true } }
            }
        });

        return NextResponse.json(activities);
    } catch (error) {
        console.error("Error fetching activities:", error);
        return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
    }
}
