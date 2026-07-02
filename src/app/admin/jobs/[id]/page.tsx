import { notFound } from "next/navigation";
import { getJobById, getStore } from "@/lib/store";
import AdminJobDetailClient from "./AdminJobDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminJobDetailPage({ params }: { params: { id: string } }) {
  const job = getJobById(params.id);
  if (!job) notFound();
  const contractors = getStore().contractors;
  return <AdminJobDetailClient initialJob={job} contractors={contractors} />;
}
