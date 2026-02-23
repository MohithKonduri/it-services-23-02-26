import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/logger";

// GET /api/assets/[id] - Get individual asset
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const asset = await prisma.asset.findUnique({
            where: { id },
            include: {
                department: { select: { name: true, code: true } },
                lab: { select: { name: true, code: true } },
                tickets: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    include: { createdBy: { select: { name: true } } }
                }
            }
        });

        if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

        return NextResponse.json(asset);
    } catch (error) {
        console.error("Error fetching asset:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT /api/assets/[id] - Update asset
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !["ADMIN", "DEAN"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const asset = await prisma.asset.update({
            where: { id },
            data: { ...body }
        });

        await logActivity({
            userId: session.user.id,
            action: "UPDATE",
            entity: "ASSET",
            entityId: asset.id,
            details: `Asset updated: ${asset.name} (${asset.assetNumber})`
        });

        return NextResponse.json(asset);
    } catch (error) {
        console.error("Error updating asset:", error);
        return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
    }
}

// DELETE /api/assets/[id] - Delete asset
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || !["ADMIN", "DEAN"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const asset = await prisma.asset.findUnique({ where: { id } });
        if (asset) {
            await logActivity({
                userId: session.user.id,
                action: "DELETE",
                entity: "ASSET",
                entityId: id,
                details: `Asset deleted: ${asset.name} (${asset.assetNumber})`
            });
        }

        await prisma.asset.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Asset deleted successfully" });
    } catch (error) {
        console.error("Error deleting asset:", error);
        return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
    }
}
