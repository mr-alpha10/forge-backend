import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";

const dayInclude = {
  days: {
    orderBy: { order: "asc" as const },
    include: {
      exercises: {
        orderBy: { order: "asc" as const },
        include: { exercise: { select: { id: true, name: true, images: true, muscleGroup: true } } },
      },
    },
  },
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const routine = await prisma.routine.findFirst({ where: { id: params.id, userId }, include: dayInclude });
  if (!routine) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(routine);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { name } = await req.json().catch(() => ({}));
  const found = await prisma.routine.findFirst({ where: { id: params.id, userId } });
  if (!found) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const routine = await prisma.routine.update({ where: { id: params.id }, data: { name: String(name).trim() } });
  return NextResponse.json(routine);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const found = await prisma.routine.findFirst({ where: { id: params.id, userId } });
  if (!found) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await prisma.routine.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
