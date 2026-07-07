import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/routines/:id/days  body: { label? }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const routine = await prisma.routine.findFirst({ where: { id: params.id, userId } });
  if (!routine) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { label } = await req.json().catch(() => ({}));
  const count = await prisma.routineDay.count({ where: { routineId: params.id } });
  const day = await prisma.routineDay.create({
    data: { routineId: params.id, label: (label && String(label).trim()) || `Day ${count + 1}`, order: count },
  });
  return NextResponse.json(day, { status: 201 });
}
