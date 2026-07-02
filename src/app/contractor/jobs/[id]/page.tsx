import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getJobById } from "@/lib/store";
import { verifyToken, CONTRACTOR_COOKIE_NAME } from "@/lib/auth";
import ContractorJobDetailClient from "./ContractorJobDetailClient";

export const dynamic = "force-dynamic";

export default async function ContractorJobDetailPage({ params }: { params: { id: string } }) {
  const token = cookies().get(CONTRACTOR_COOKIE_NAME)?.value;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") {
    redirect("/contractor/login");
  }

  const job = getJobById(params.id);
  if (!job) notFound();

  // Privacy: contractors can only see jobs assigned to them
  if (job.assignedContractorId !== payload.id) {
    notFound();
  }

  return <ContractorJobDetailClient initialJob={job} />;
}
