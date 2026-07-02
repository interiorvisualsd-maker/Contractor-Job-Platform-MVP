import { SignJWT, jwtVerify } from "jose";
import { ADMIN } from "./types";
import { getContractorByEmail } from "./store";

const ADMIN_COOKIE = "admin_session";
const CONTRACTOR_COOKIE = "contractor_session";
const DURATION = 7 * 24 * 60 * 60; // 7 days
const SECRET = new TextEncoder().encode("contractor-mvp-demo-secret-key-2026");

export async function createToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURATION}s`)
    .sign(SECRET);
}

export async function verifyToken(token: string | undefined | null): Promise<{ role: string; id?: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return { role: payload.role as string, id: payload.id as string | undefined };
  } catch {
    return null;
  }
}

export async function adminLogin(email: string, password: string): Promise<string | null> {
  if (email.toLowerCase() === ADMIN.email && password === ADMIN.password) {
    return createToken({ role: "admin" });
  }
  return null;
}

export async function contractorLogin(email: string, password: string): Promise<string | null> {
  const c = getContractorByEmail(email);
  if (c && c.password === password) {
    return createToken({ role: "contractor", id: c.id, name: c.name });
  }
  return null;
}

export const ADMIN_COOKIE_NAME = ADMIN_COOKIE;
export const CONTRACTOR_COOKIE_NAME = CONTRACTOR_COOKIE;
export const COOKIE_MAX_AGE = DURATION;
