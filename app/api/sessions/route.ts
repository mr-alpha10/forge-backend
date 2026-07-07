import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";

type SetInput = { weightKg?: number; reps?: number; rpe?: number };

// POST /api/sessions
// body: { exerciseId, performedAt?, notes?, sets: [{ weightKg, reps, rpe? }] }
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { exerciseId, performedAt, notes, sets } = await req.json().catch(() => ({}));
  if (!exerciseId || !Array.isArray(sets) || sets.length === 0) {
    return NextResponse.json(
      { error: "exerciseId and at least one set are required." },
      { status: 400 }
    );
  }

  const clean = (sets as SetInput[])
    .map((s, i) => ({
      order: i,
      weightKg: s.weightKg ?? null,
      reps: s.reps ?? null,
      rpe: s.rpe ?? null,
    }))
    .filter((s) => s.weightKg != null || s.reps != null);

  if (clean.length === 0) {
    return NextResponse.json({ error: "Every set was empty." }, { status: 400 });
  }

  const session = await prisma.workoutSession.create({
    data: {
      userId,
      exerciseId,
      notes: notes ?? null,
      performedAt: performedAt ? new Date(performedAt) : undefined,
      sets: { create: clean },
    },
    include: { sets: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(session, { status: 201 });
}
