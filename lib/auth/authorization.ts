import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DASHBOARD_SESSION_COOKIE, readDashboardSession } from "./session";

function safeEqual(left: string, right: string): boolean {
  const leftDigest = createHash("sha256").update(left).digest();
  const rightDigest = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

export function isDashboardAuthConfigured(): boolean {
  const username = process.env.DASHBOARD_USERNAME?.trim();
  const password = process.env.DASHBOARD_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET?.trim();
  return Boolean(username && password && password.length >= 12 && sessionSecret && sessionSecret.length >= 32);
}

export function validateDashboardCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.DASHBOARD_USERNAME?.trim() ?? "";
  const expectedPassword = process.env.DASHBOARD_PASSWORD ?? "";
  if (!isDashboardAuthConfigured()) return false;
  return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export async function getDashboardSession() {
  const token = (await cookies()).get(DASHBOARD_SESSION_COOKIE)?.value;
  return readDashboardSession(token);
}

export async function requireDashboardSession() {
  const session = await getDashboardSession();
  if (!session) redirect("/login");
  return session;
}
