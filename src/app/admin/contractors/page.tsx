import Link from "next/link";
import { getStore } from "@/lib/store";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ContractorsPage() {
  const store = getStore();

  // Build per-contractor job stats
  const contractorStats = store.contractors.map((c) => {
    const assigned = store.jobs.filter((j) => j.assignedContractorId === c.id);
    return {
      ...c,
      totalAssigned: assigned.length,
      active: assigned.filter((j) => ["assigned", "quoted"].includes(j.status)).length,
      completed: assigned.filter((j) => j.status === "completed").length,
    };
  });

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">F</div>
            <h1 className="font-semibold text-slate-900 text-sm">Contractors</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="btn-secondary text-sm">← Dashboard</Link>
            <form action={logoutAction}>
              <button type="submit" className="btn-secondary text-sm">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="card">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 text-sm">All contractors ({contractorStats.length})</h2>
            <button className="btn-primary text-sm" disabled title="Demo — in production this would open a form to add a contractor">
              + Add contractor
            </button>
          </div>
          <ul className="divide-y divide-slate-100">
            {contractorStats.map((c) => (
              <li key={c.id} className="px-4 py-3 flex items-center gap-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600 font-semibold text-sm">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 text-sm">{c.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{c.email} · {c.trade} · {c.phone}</p>
                </div>
                <div className="flex gap-4 text-center text-xs">
                  <div>
                    <p className="text-slate-400">Active</p>
                    <p className="font-semibold text-slate-900">{c.active}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Completed</p>
                    <p className="font-semibold text-slate-900">{c.completed}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Total</p>
                    <p className="font-semibold text-slate-900">{c.totalAssigned}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 card p-5">
          <h2 className="font-semibold text-slate-900 text-sm mb-2">Contractor login credentials (demo)</h2>
          <p className="text-xs text-slate-500 mb-3">Share these with contractors so they can log in. In production, this would be a proper invite + password reset flow.</p>
          <div className="space-y-2">
            {store.contractors.map((c) => (
              <div key={c.id} className="flex items-center gap-3 text-xs bg-slate-50 rounded-md px-3 py-2">
                <span className="font-medium text-slate-900">{c.name}</span>
                <span className="text-slate-500">{c.email}</span>
                <span className="text-slate-400">password: <code className="bg-slate-200 px-1 rounded">{c.password}</code></span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
