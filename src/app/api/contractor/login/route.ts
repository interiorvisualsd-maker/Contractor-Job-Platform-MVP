import { NextRequest, NextResponse } from "next/server";
import { contractorLogin, CONTRACTOR_COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = (body.email || "").trim();
  const password = body.password || "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  const token = await contractorLogin(email, password);
  if (!token) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CONTRACTOR_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
