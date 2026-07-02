import { NextRequest, NextResponse } from "next/server";
import { createJob, getStore } from "@/lib/store";
import type { JobPhoto } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/jobs — public homeowner submission
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = (body.title as string || "").trim();
  const category = (body.category as string || "").trim();
  const description = (body.description as string || "").trim();
  const homeownerName = (body.homeownerName as string || "").trim();
  const homeownerEmail = (body.homeownerEmail as string || "").trim();
  const homeownerPhone = (body.homeownerPhone as string || "").trim();
  const homeownerAddress = (body.homeownerAddress as string || "").trim();
  const photos = (body.photos as JobPhoto[] || []);

  if (!title || !category || !description || !homeownerName || !homeownerEmail || !homeownerPhone || !homeownerAddress) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(homeownerEmail)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (photos.length > 5) {
    return NextResponse.json({ error: "Maximum 5 photos allowed" }, { status: 400 });
  }

  const job = createJob({
    title,
    category,
    description,
    photos,
    homeownerName,
    homeownerEmail,
    homeownerPhone,
    homeownerAddress,
  });

  // Simulate sending confirmation email
  console.log(`[email-sim] Confirmation email sent to ${homeownerEmail} for job ${job.reference}`);

  return NextResponse.json({ ok: true, id: job.id, reference: job.reference });
}
