import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json().catch(() => ({}));
  if (!email || !password || String(password).length < 8) {
    return NextResponse.json(
      { error: "Email and a password of at least 8 characters are required." },
      { status: 400 }
    );
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "That email is already registered." }, { status: 409 });
  }
  const user = await prisma.user.create({
    data: { email, name: name ?? null, password: await hashPassword(password) },
  });
  return NextResponse.json({
    token: signToken(user.id),
    user: { id: user.id, email: user.email, name: user.name },
  });
}
