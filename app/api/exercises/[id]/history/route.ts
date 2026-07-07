import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/exercises/:id/history — every logged session for this exercise,
// newest first. Feeds progress charts and the full history view.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const sessions = await prisma.workoutSession.findMany({
    where: { userId, exerciseId: params.id },
    orderBy: { performedAt: "desc" },
    include: { sets: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(sessions);
}
