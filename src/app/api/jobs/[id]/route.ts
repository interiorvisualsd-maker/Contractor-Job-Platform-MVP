import { NextRequest, NextResponse } from "next/server";
import { getJobById, updateJob, getStore } from "@/lib/store";
import { verifyToken, ADMIN_COOKIE_NAME, CONTRACTOR_COOKIE_NAME } from "@/lib/auth";
import type { JobStatus, Quote } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES: JobStatus[] = ["new", "qualified", "assigned", "quoted", "completed", "declined"];

// GET /api/jobs/[id] — admin or assigned contractor
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const job = getJobById(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Auth check
  const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const contractorToken = req.cookies.get(CONTRACTOR_COOKIE_NAME)?.value;
  const adminPayload = await verifyToken(adminToken);
  const contractorPayload = await verifyToken(contractorToken);

  if (adminPayload?.role === "admin") {
    return NextResponse.json(job);
  }
  if (contractorPayload?.role === "contractor" && job.assignedContractorId === contractorPayload.id) {
    return NextResponse.json(job);
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

// PATCH /api/jobs/[id] — update job status, assignment, quote, etc.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const job = getJobById(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Auth check
  const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const contractorToken = req.cookies.get(CONTRACTOR_COOKIE_NAME)?.value;
  const adminPayload = await verifyToken(adminToken);
  const contractorPayload = await verifyToken(contractorToken);

  const isAdmin = adminPayload?.role === "admin";
  const isAssignedContractor = contractorPayload?.role === "contractor" && job.assignedContractorId === contractorPayload.id;

  if (!isAdmin && !isAssignedContractor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const patch: Record<string, unknown> = {};
  const now = new Date().toISOString();

  // Admin-only fields
  if (isAdmin) {
    if (typeof body.status === "string" && VALID_STATUSES.includes(body.status as JobStatus)) {
      patch.status = body.status;
      if (body.status === "qualified" && !job.qualifiedAt) patch.qualifiedAt = now;
      if (body.status === "completed" && !job.completedAt) patch.completedAt = now;
    }
    if (typeof body.assignedContractorId === "string" || body.assignedContractorId === null) {
      patch.assignedContractorId = body.assignedContractorId;
      if (body.assignedContractorId && !job.assignedAt) patch.assignedAt = now;
      // Auto-set status to assigned when contractor is assigned
      if (body.assignedContractorId && job.status === "qualified") {
        patch.status = "assigned";
      }
    }
    if (typeof body.adminNotes === "string") patch.adminNotes = body.adminNotes;
  }

  // Contractor-only fields (only if assigned to this job)
  if (isAssignedContractor) {
    if (typeof body.status === "string" && ["quoted", "completed", "declined"].includes(body.status)) {
      patch.status = body.status;
      if (body.status === "completed" && !job.completedAt) patch.completedAt = now;
    }
    if (body.quote && typeof body.quote === "object") {
      const q = body.quote as Quote;
      patch.quote = { ...q, createdAt: now };
    }
    if (typeof body.invoiceAmount === "number") {
      patch.invoiceAmount = body.invoiceAmount;
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = updateJob(id, patch);
  return NextResponse.json({ ok: true, job: updated });
}
