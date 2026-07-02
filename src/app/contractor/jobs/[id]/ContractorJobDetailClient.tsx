"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { STATUS_LABELS, type Job, type JobStatus } from "@/lib/types";

interface Props {
  initialJob: Job;
}

export default function ContractorJobDetailClient({ initialJob }: Props) {
  const router = useRouter();
  const [job, setJob] = useState(initialJob);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  // Quote form
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteFile, setQuoteFile] = useState<string>("");

  // Invoice form
  const [invoiceAmount, setInvoiceAmount] = useState("");

  async function refreshJob() {
    const res = await fetch(`/api/jobs/${job.id}`, { method: "GET" });
    if (res.ok) setJob(await res.json());
    router.refresh();
  }

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return false; }
      await refreshJob();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(status: JobStatus) {
    const ok = await patch({ status });
    if (ok) {
      setFlash(`Marked as ${STATUS_LABELS[status]}`);
      setTimeout(() => setFlash(null), 2500);
    }
  }

  async function handleQuoteFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) {
      setError("File too large. Max 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setQuoteFile(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function submitQuote() {
    const amount = parseFloat(quoteAmount);
    if (!amount || amount <= 0) {
      setError("Enter a valid quote amount.");
      return;
    }
    const ok = await patch({
      quote: { id: `q${Date.now()}`, filename: "quote.pdf", dataUrl: quoteFile, amount },
      status: "quoted",
    });
    if (ok) {
      setQuoteAmount("");
      setQuoteFile("");
      setFlash("Quote submitted");
      setTimeout(() => setFlash(null), 2500);
    }
  }

  async function submitInvoice() {
    const amount = parseFloat(invoiceAmount);
    if (!amount || amount <= 0) {
      setError("Enter a valid invoice amount.");
      return;
    }
    const ok = await patch({ invoiceAmount: amount, status: "completed" });
    if (ok) {
      setInvoiceAmount("");
      setFlash("Invoice submitted — job marked complete");
      setTimeout(() => setFlash(null), 2500);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/contractor" className="text-sm text-slate-500 hover:text-slate-900">← My jobs</Link>
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
          <h1 className="text-xl font-bold text-slate-900 mb-1">{job.title}</h1>
          <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
            <span className="bg-slate-100 px-2 py-0.5 rounded">#{job.category}</span>
            <span>Submitted {new Date(job.createdAt).toLocaleDateString()}</span>
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
          <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide text-slate-500 mb-3">Homeowner contact</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-slate-500">Name</p><p className="font-medium">{job.homeownerName}</p></div>
            <div><p className="text-xs text-slate-500">Phone</p><p className="font-medium">{job.homeownerPhone}</p></div>
            <div><p className="text-xs text-slate-500">Email</p><p className="font-medium break-all">{job.homeownerEmail}</p></div>
            <div><p className="text-xs text-slate-500">Address</p><p className="font-medium">{job.homeownerAddress}</p></div>
          </div>
          {job.adminNotes && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">Admin notes</p>
              <p className="text-sm text-slate-700 italic">{job.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Actions based on status */}
        {job.status === "assigned" && (
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide text-slate-500">Accept or decline</h2>
            <p className="text-sm text-slate-600">Review the job details above. If you can take it on, accept it. If not, decline and it goes back to the admin.</p>
            <div className="flex gap-3">
              <button onClick={() => setStatus("quoted")} className="btn-success" disabled={saving}>
                ✓ Accept job
              </button>
              <button onClick={() => setStatus("declined")} className="btn-danger" disabled={saving}>
                ✗ Decline
              </button>
            </div>
            <p className="text-xs text-slate-400">Accepting the job moves it to "Quote uploaded" state. You can then upload a quote file and amount below.</p>
          </div>
        )}

        {/* Quote upload (if accepted / already quoted) */}
        {(job.status === "quoted" || job.status === "assigned") && (
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide text-slate-500">
              {job.quote ? "Quote submitted" : "Upload your quote"}
            </h2>

            {job.quote ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-sm">
                <p className="text-emerald-800">You quoted <strong>${job.quote.amount.toFixed(2)}</strong> on {new Date(job.quote.createdAt).toLocaleDateString()}.</p>
                <p className="text-xs text-emerald-600 mt-1">The homeowner has been notified.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="label" htmlFor="amount">Quote amount ($)</label>
                  <input id="amount" type="number" step="0.01" min="0" className="input max-w-xs" placeholder="e.g. 250.00" value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="file">Quote document (PDF, optional)</label>
                  <input id="file" type="file" accept=".pdf,.doc,.docx,image/*" className="input" onChange={handleQuoteFile} />
                  <p className="text-xs text-slate-400 mt-1">Upload a detailed quote breakdown if you have one.</p>
                </div>
                <button onClick={submitQuote} className="btn-primary" disabled={saving || !quoteAmount}>
                  Submit quote
                </button>
              </>
            )}
          </div>
        )}

        {/* Invoice (after quote) */}
        {(job.status === "quoted" || job.status === "completed") && (
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide text-slate-500">
              {job.status === "completed" ? "Final invoice" : "Submit final invoice"}
            </h2>

            {job.status === "completed" && job.invoiceAmount !== null ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-sm">
                <p className="text-emerald-800">Final invoice: <strong>${job.invoiceAmount.toFixed(2)}</strong></p>
                <p className="text-xs text-emerald-600 mt-1">Job marked complete on {job.completedAt ? new Date(job.completedAt).toLocaleDateString() : "—"}.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-600">When the work is done, enter the final invoice amount. This will mark the job as complete.</p>
                <div>
                  <label className="label" htmlFor="invoice">Final invoice amount ($)</label>
                  <input id="invoice" type="number" step="0.01" min="0" className="input max-w-xs" placeholder="e.g. 275.00" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} />
                </div>
                <button onClick={submitInvoice} className="btn-success" disabled={saving || !invoiceAmount}>
                  Submit invoice & complete job
                </button>
              </>
            )}
          </div>
        )}

        {job.status === "declined" && (
          <div className="card p-5 bg-red-50 border-red-200">
            <h2 className="font-semibold text-red-700 text-sm mb-1">Job declined</h2>
            <p className="text-sm text-red-600">You declined this job. The admin has been notified and may reassign it.</p>
          </div>
        )}
      </main>
    </div>
  );
}
