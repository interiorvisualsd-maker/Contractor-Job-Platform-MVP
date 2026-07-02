import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getStore } from "@/lib/store";
import { verifyToken, CONTRACTOR_COOKIE_NAME, CONTRACTOR_COOKIE_MAX_AGE } from "./lib";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function ContractorDashboardPage() {
  const token = cookies().get(CONTRACTOR_COOKIE_NAME)?.value;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "contractor") {
    redirect("/contractor/login");
  }

  const store = getStore();
  const contractor = store.contractors.find((c) => c.id === payload.id);
  if (!contractor) redirect("/contractor/login");

  const myJobs = store.jobs.filter((j) => j.assignedContractorId === contractor.id);
  const stats = {
    pending: myJobs.filter((j) => j.status === "assigned").length,
    quoted: myJobs.filter((j) => j.status === "quoted").length,
    completed: myJobs.filter((j) => j.status === "completed").length,
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">F</div>
            <div>
              <h1 className="font-semibold text-slate-900 text-sm">{contractor.name}</h1>
              <p className="text-xs text-slate-500">{contractor.trade} Contractor</p>
            </div>
          </div>
          <form action={async () => { "use server"; cookies().delete(CONTRACTOR_COOKIE_NAME); redirect("/contractor/login"); }}>
            <button type="submit" className="btn-secondary text-sm">Sign out</button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Pending action" value={stats.pending} color="text-amber-600" />
          <Stat label="Quotes sent" value={stats.quoted} color="text-indigo-600" />
          <Stat label="Completed" value={stats.completed} color="text-emerald-600" />
        </div>

        {/* Job list */}
        <div className="card">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 text-sm">Your assigned jobs ({myJobs.length})</h2>
          </div>
          {myJobs.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-slate-400">
              No jobs assigned to you yet. When the admin assigns you a job, it will appear here.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {myJobs.map((job) => (
                <li key={job.id}>
                  <Link href={`/contractor/jobs/${job.id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={job.status} />
                        <span className="text-xs text-slate-400 font-mono">{job.reference}</span>
                      </div>
                      <h3 className="font-medium text-slate-900 text-sm truncate">{job.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {job.homeownerName} · {job.homeownerAddress}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(job.createdAt).toLocaleDateString()}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
