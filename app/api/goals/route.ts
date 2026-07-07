import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export const runtime = "nodejs";

// Treat the calendar date as a plain day at UTC midnight so it round-trips
// cleanly regardless of the user's timezone.
const day = (s: string) => new Date(s + "T00:00:00.000Z");

// GET /api/goals?date=YYYY-MM-DD   (one day — used for "today")
// GET /api/goals?from=...&to=...   (range — used by the month view)
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const date = sp.get("date");
  const from = sp.get("from");
  const to = sp.get("to");

  const where: { userId: string; date?: Date | { gte: Date; lte: Date } } = { userId };
  if (date) where.date = day(date);
  else if (from && to) where.date = { gte: day(from), lte: day(to) };

  const goals = await prisma.goal.findMany({
    where,
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json(goals);
}

// POST /api/goals  body: { date: "YYYY-MM-DD", text }
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { date, text } = await req.json().catch(() => ({}));
  if (!date || !text || !String(text).trim()) {
    return NextResponse.json({ error: "date and text are required." }, { status: 400 });
  }
  const goal = await prisma.goal.create({
    data: { userId, date: day(date), text: String(text).trim() },
  });
  return NextResponse.json(goal, { status: 201 });
}
