import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/exercises/:id
// If a valid token is present, also returns `lastSession` — this is the
// "beat last time" recall that pre-fills the log form.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const exercise = await prisma.exercise.findUnique({ where: { id: params.id } });
  if (!exercise) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const userId = getUserId(req);
  let lastSession = null;
  if (userId) {
    lastSession = await prisma.workoutSession.findFirst({
      where: { userId, exerciseId: exercise.id },
      orderBy: { performedAt: "desc" },
      include: { sets: { orderBy: { order: "asc" } } },
    });
  }
  return NextResponse.json({ ...exercise, lastSession });
}
