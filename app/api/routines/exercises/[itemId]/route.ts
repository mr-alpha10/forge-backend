import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";

// DELETE /api/routines/exercises/:itemId
export async function DELETE(req: NextRequest, { params }: { params: { itemId: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const item = await prisma.routineExercise.findUnique({
    where: { id: params.itemId },
    include: { day: { include: { routine: true } } },
  });
  if (!item || item.day.routine.userId !== userId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await prisma.routineExercise.delete({ where: { id: params.itemId } });
  return NextResponse.json({ ok: true });
}
