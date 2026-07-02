import Link from "next/link";
import { getStore } from "@/lib/store";
import { StatusBadge } from "@/components/StatusBadge";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = ["all", "new", "qualified", "assigned", "quoted", "completed", "declined"] as const;

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const store = getStore();
  const statusFilter = searchParams.status || "all";
  const searchQuery = (searchParams.q || "").trim().toLowerCase();

  let jobs = store.jobs;
  if (statusFilter !== "all") {
    jobs = jobs.filter((j) => j.status === statusFilter);
  }
  if (searchQuery) {
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(searchQuery) ||
        j.reference.toLowerCase().includes(searchQuery) ||
        j.homeownerName.toLowerCase().includes(searchQuery) ||
        j.homeownerAddress.toLowerCase().includes(searchQuery)
    );
  }

  const counts = {
    total: store.jobs.length,
    new: store.jobs.filter((j) => j.status === "new").length,
    qualified: store.jobs.filter((j) => j.status === "qualified").length,
    assigned: store.jobs.filter((j) => j.status === "assigned").length,
    completed: store.jobs.filter((j) => j.status === "completed").length,
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">F</div>
            <div>
              <h1 className="font-semibold text-slate-900 text-sm">Fixr Admin</h1>
              <p className="text-xs text-slate-500">Job Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/contractors" className="btn-secondary text-sm">Contractors</Link>
            <form action={logoutAction}>
              <button type="submit" className="btn-secondary text-sm">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Stat label="Total" value={counts.total} color="text-slate-900" />
          <Stat label="New" value={counts.new} color="text-blue-600" />
          <Stat label="Qualified" value={counts.qualified} color="text-amber-600" />
          <Stat label="Assigned" value={counts.assigned} color="text-purple-600" />
          <Stat label="Completed" value={counts.completed} color="text-emerald-600" />
        </div>

        {/* Filters */}
        <div className="card">
          <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_FILTERS.map((s) => (
                <Link
                  key={s}
                  href={s === "all" ? "/admin" : `/admin?status=${s}`}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    statusFilter === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s}
                </Link>
              ))}
            </div>
            <form method="get" className="flex items-center gap-2">
              {statusFilter !== "all" && <input type="hidden" name="status" value={statusFilter} />}
              <input type="search" name="q" defaultValue={searchQuery} placeholder="Search title, ref, name, address..." className="input max-w-xs text-sm" />
              <button type="submit" className="btn-secondary text-sm">Search</button>
            </form>
          </div>

          {/* Job list */}
          {jobs.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-slate-400">No jobs match the current filters.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <li key={job.id}>
                  <Link href={`/admin/jobs/${job.id}`} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={job.status} />
                        <span className="text-xs text-slate-400 font-mono">{job.reference}</span>
                        <span className="text-xs text-slate-500">#{job.category}</span>
                      </div>
                      <h3 className="font-medium text-slate-900 text-sm truncate">{job.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {job.homeownerName} · {job.homeownerAddress}
                        {job.assignedContractorId && ` · assigned to contractor`}
                        {job.photos.length > 0 && ` · ${job.photos.length} photo${job.photos.length > 1 ? "s" : ""}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-400">{new Date(job.createdAt).toLocaleDateString()}</p>
                      <span className="text-xs text-slate-500 mt-1 inline-block">Open →</span>
                    </div>
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
