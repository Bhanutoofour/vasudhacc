import { NextResponse } from "next/server";
import { createDashboardSession, DASHBOARD_SESSION_COOKIE, DASHBOARD_SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";
import { isDashboardAuthConfigured, validateDashboardCredentials } from "@/lib/auth/authorization";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim().slice(0, 200);
  const password = String(formData.get("password") ?? "").slice(0, 500);

  if (!isDashboardAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=configuration", request.url), 303);
  }
  if (!validateDashboardCredentials(username, password)) {
    return NextResponse.redirect(new URL("/login?error=credentials", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(DASHBOARD_SESSION_COOKIE, await createDashboardSession(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: DASHBOARD_SESSION_MAX_AGE_SECONDS,
    priority: "high",
  });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}
