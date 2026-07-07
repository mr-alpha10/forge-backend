import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";

async function ownDay(userId: string, dayId: string) {
  const day = await prisma.routineDay.findUnique({ where: { id: dayId }, include: { routine: true } });
  return day && day.routine.userId === userId ? day : null;
}

// POST /api/routines/days/:dayId/exercises  body: { exerciseId, targetSets?, targetReps? }
export async function POST(req: NextRequest, { params }: { params: { dayId: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!(await ownDay(userId, params.dayId))) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { exerciseId, targetSets, targetReps } = await req.json().catch(() => ({}));
  if (!exerciseId) return NextResponse.json({ error: "exerciseId is required." }, { status: 400 });

  const count = await prisma.routineExercise.count({ where: { dayId: params.dayId } });
  const item = await prisma.routineExercise.create({
    data: {
      dayId: params.dayId,
      exerciseId,
      order: count,
      targetSets: targetSets ?? null,
      targetReps: targetReps ?? null,
    },
    include: { exercise: { select: { id: true, name: true, images: true, muscleGroup: true } } },
  });
  return NextResponse.json(item, { status: 201 });
}
