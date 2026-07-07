import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/routines — the signed-in user's routines, with days + exercises.
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const routines = await prisma.routine.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: { exercise: { select: { id: true, name: true, images: true } } },
          },
        },
      },
    },
  });
  return NextResponse.json(routines);
}

// POST /api/routines
// body: { name, days?: [{ label, exerciseIds?: string[] }] }
// Adding days / exercises later is the same shape against
// prisma.routineDay and prisma.routineExercise.
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { name, days } = await req.json().catch(() => ({}));
  if (!name) return NextResponse.json({ error: "A routine name is required." }, { status: 400 });

  const routine = await prisma.routine.create({
    data: {
      userId,
      name,
      days: Array.isArray(days)
        ? {
            create: days.map((d: { label: string; exerciseIds?: string[] }, di: number) => ({
              label: d.label,
              order: di,
              exercises: Array.isArray(d.exerciseIds)
                ? {
                    create: d.exerciseIds.map((exerciseId, ei) => ({ exerciseId, order: ei })),
                  }
                : undefined,
            })),
          }
        : undefined,
    },
    include: { days: { include: { exercises: true } } },
  });
  return NextResponse.json(routine, { status: 201 });
}
