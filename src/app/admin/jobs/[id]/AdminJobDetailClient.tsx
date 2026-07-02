"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { STATUS_LABELS, type Job, type Contractor, type JobStatus } from "@/lib/types";

interface Props {
  initialJob: Job;
  contractors: Contractor[];
}

export default function AdminJobDetailClient({ initialJob, contractors }: Props) {
  const router = useRouter();
  const [job, setJob] = useState(initialJob);
  const [adminNotes, setAdminNotes] = useState(initialJob.adminNotes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => { setAdminNotes(initialJob.adminNotes); }, [initialJob.adminNotes]);

  async function refreshJob() {
    const res = await fetch(`/api/jobs/${job.id}`, { method: "GET" });
    if (res.ok) setJob(await res.json());
    router.refresh();
  }

  async function updateStatus(status: JobStatus) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      await refreshJob();
      setFlash(`Status updated to ${STATUS_LABELS[status]}`);
      setTimeout(() => setFlash(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSaving(false);
    }
  }

  async function assignContractor(contractorId: string | null) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedContractorId: contractorId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      await refreshJob();
      const c = contractors.find((x) => x.id === contractorId);
      setFlash(c ? `Assigned to ${c.name}` : "Contractor unassigned");
      setTimeout(() => setFlash(null), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSaving(false);
    }
  }

  async function saveNotes() {
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      if (res.ok) {
        await refreshJob();
        setFlash("Notes saved");
        setTimeout(() => setFlash(null), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  const assignedContractor = contractors.find((c) => c.id === job.assignedContractorId);

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-900">← Dashboard</Link>
          <div className="flex items-center gap-2">
            <StatusBadge status={job.status} />
            <span className="text-xs text-slate-400 font-mono">{job.reference}</span>
            {flash && <span className="text-xs text-emerald-600">{flash}</span>}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        {/* Job summary */}
        <div className="card p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>
            <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(job.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
            <span className="bg-slate-100 px-2 py-0.5 rounded">#{job.category}</span>
            <span>{job.photos.length} photo{job.photos.length !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{job.description}</p>

          {job.photos.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-4">
              {job.photos.map((p) => (
                <a key={p.id} href={p.dataUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <img src={p.dataUrl} alt={p.filename} className="w-full h-20 object-cover rounded-md border border-slate-200 hover:border-blue-400" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Homeowner contact */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide text-slate-500 mb-3">Homeowner</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-slate-500">Name</p><p className="font-medium">{job.homeownerName}</p></div>
            <div><p className="text-xs text-slate-500">Phone</p><p className="font-medium">{job.homeownerPhone}</p></div>
            <div><p className="text-xs text-slate-500">Email</p><p className="font-medium break-all">{job.homeownerEmail}</p></div>
            <div><p className="text-xs text-slate-500">Address</p><p className="font-medium">{job.homeownerAddress}</p></div>
          </div>
        </div>

        {/* Admin actions */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide text-slate-500">Manage job</h2>

          {/* Status actions */}
          <div>
            <label className="label">Status</label>
            <div className="flex flex-wrap gap-2">
              {(["new", "qualified", "assigned", "quoted", "completed", "declined"] as JobStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={saving || job.status === s}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                    job.status === s
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Contractor assignment */}
          <div>
            <label className="label">Assigned contractor</label>
            <div className="flex gap-2">
              <select
                className="input"
                value={job.assignedContractorId || ""}
                onChange={(e) => assignContractor(e.target.value || null)}
                disabled={saving}
              >
                <option value="">— None —</option>
                {contractors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.trade})
                  </option>
                ))}
              </select>
              {assignedContractor && (
                <a href={`/contractor/jobs/${job.id}`} className="btn-secondary text-sm whitespace-nowrap">View as contractor →</a>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Assigning a contractor automatically changes status to "Assigned" (if currently "Qualified").
            </p>
          </div>

          {/* Admin notes */}
          <div>
            <label className="label">Admin notes (internal)</label>
            <textarea
              className="input min-h-[80px]"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Notes about this job — not visible to homeowner or contractor."
            />
            <button onClick={saveNotes} className="btn-secondary text-sm mt-2" disabled={saving || adminNotes === job.adminNotes}>
              Save notes
            </button>
          </div>
        </div>

        {/* Quote + invoice (if any) */}
        {(job.quote || job.invoiceAmount !== null) && (
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide text-slate-500 mb-3">Quote & invoice</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {job.quote && (
                <div>
                  <p className="text-xs text-slate-500">Quote amount</p>
                  <p className="text-lg font-semibold text-slate-900">${job.quote.amount.toFixed(2)}</p>
                  <p className="text-xs text-slate-400 mt-1">Uploaded {new Date(job.quote.createdAt).toLocaleDateString()}</p>
                </div>
              )}
              {job.invoiceAmount !== null && (
                <div>
                  <p className="text-xs text-slate-500">Final invoice</p>
                  <p className="text-lg font-semibold text-slate-900">${job.invoiceAmount.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit trail */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide text-slate-500 mb-3">Timeline</h2>
          <ul className="space-y-2 text-sm">
            <TimelineItem label="Job submitted" date={job.createdAt} />
            {job.qualifiedAt && <TimelineItem label="Qualified by admin" date={job.qualifiedAt} />}
            {job.assignedAt && <TimelineItem label="Assigned to contractor" date={job.assignedAt} />}
            {job.quote && <TimelineItem label="Quote uploaded" date={job.quote.createdAt} />}
            {job.completedAt && <TimelineItem label="Marked complete" date={job.completedAt} />}
          </ul>
        </div>
      </main>
    </div>
  );
}

function TimelineItem({ label, date }: { label: string; date: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="inline-flex h-2 w-2 rounded-full bg-blue-500" />
      <span className="text-slate-700">{label}</span>
      <span className="text-xs text-slate-400 ml-auto">{new Date(date).toLocaleString()}</span>
    </li>
  );
}
