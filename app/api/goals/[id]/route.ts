import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";

async function ownGoal(userId: string, id: string) {
  const g = await prisma.goal.findUnique({ where: { id } });
  return g && g.userId === userId ? g : null;
}

// PATCH /api/goals/:id  body: { done?, text? }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!(await ownGoal(userId, params.id))) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { done, text } = await req.json().catch(() => ({}));
  const goal = await prisma.goal.update({
    where: { id: params.id },
    data: {
      ...(typeof done === "boolean" ? { done } : {}),
      ...(text !== undefined ? { text: String(text).trim() } : {}),
    },
  });
  return NextResponse.json(goal);
}

// DELETE /api/goals/:id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!(await ownGoal(userId, params.id))) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await prisma.goal.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
