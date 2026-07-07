import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";

async function ownDay(userId: string, dayId: string) {
  const day = await prisma.routineDay.findUnique({ where: { id: dayId }, include: { routine: true } });
  return day && day.routine.userId === userId ? day : null;
}

// DELETE /api/routines/days/:dayId
export async function DELETE(req: NextRequest, { params }: { params: { dayId: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!(await ownDay(userId, params.dayId))) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await prisma.routineDay.delete({ where: { id: params.dayId } });
  return NextResponse.json({ ok: true });
}
