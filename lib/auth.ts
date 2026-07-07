import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  // Fail loud in dev rather than silently signing with undefined.
  console.warn("JWT_SECRET is not set — auth will fail. Add it to .env");
}

export const hashPassword = (plain: string) => bcrypt.hash(plain, 10);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

export const signToken = (userId: string) =>
  jwt.sign({ sub: userId }, SECRET as string, { expiresIn: "30d" });

/** Returns the userId from a Bearer header or `token` cookie, or null. */
export function getUserId(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  const token =
    header?.startsWith("Bearer ") ? header.slice(7) : req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return (jwt.verify(token, SECRET as string) as { sub: string }).sub;
  } catch {
    return null;
  }
}
