import { createHmac, timingSafeEqual } from "crypto";
import type { User } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "champion_session";
type Role = "admin" | "staff";

type SessionPayload = {
  userId: number;
  role: Role;
  exp: number;
};

function secret() {
  return process.env.AUTH_SECRET || "dev-only-secret";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createSessionToken(user: Pick<User, "id" | "role">) {
  const payload: SessionPayload = {
    userId: user.id,
    role: user.role as Role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token?: string) {
  if (!token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  const expected = sign(body);
  const given = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (given.length !== expectedBuffer.length || !timingSafeEqual(given, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const payload = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { branch: true }
  });

  if (!user || user.status !== "Active") return null;
  return user;
}

export async function requireUser(role?: Role) {
  const user = await getSessionUser();
  if (!user) redirect(role === "admin" ? "/admin/login" : "/staff/login");
  if (role && user.role !== role) redirect(role === "admin" ? "/admin/login" : "/staff/login");
  return user;
}
