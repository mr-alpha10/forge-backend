import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GROUP_MUSCLES } from "@/lib/muscles";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

// GET /api/exercises?group=chest&section=main&q=bench&equipment=barbell
// section: warmup | main | cooldown (optional). For cooldown, stretches are
// matched by primary OR secondary muscle so cross-group stretches show up.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const group = sp.get("group");
  const section = sp.get("section");
  const q = sp.get("q");
  const equipment = sp.get("equipment");

  const where: Prisma.ExerciseWhereInput = {};

  if (group) {
    const muscles = GROUP_MUSCLES[group] ?? [];
    if (section === "cooldown") {
      where.section = "cooldown";
      where.OR = [
        { primaryMuscles: { hasSome: muscles } },
        { secondaryMuscles: { hasSome: muscles } },
      ];
    } else {
      where.muscleGroup = group;
      if (section) where.section = section;
    }
  } else if (section) {
    where.section = section;
  }

  if (q) where.name = { contains: q, mode: "insensitive" };
  if (equipment) where.equipment = equipment;

  const items = await prisma.exercise.findMany({ where, orderBy: { name: "asc" } });
  return NextResponse.json(items);
}
