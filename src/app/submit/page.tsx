"use client";

import { Suspense, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { JOB_CATEGORIES, type JobPhoto } from "@/lib/types";

function SubmitJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    category: searchParams.get("category") || "",
    description: "",
    homeownerName: "",
    homeownerEmail: "",
    homeownerPhone: "",
    homeownerAddress: "",
  });
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const newPhotos: JobPhoto[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 5_000_000) {
        setError(`File "${file.name}" is too large. Max 5MB per photo.`);
        continue;
      }
      const dataUrl = await fileToDataUrl(file);
      newPhotos.push({
        id: `p${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        filename: file.name,
        dataUrl,
        size: file.size,
      });
    }
    setPhotos((prev) => [...prev, ...newPhotos]);
    setError(null);
  }

  function removePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.category || !form.description.trim()) {
      setError("Please fill in the job title, category, and description.");
      return;
    }
    if (!form.homeownerName.trim() || !form.homeownerEmail.trim() || !form.homeownerPhone.trim() || !form.homeownerAddress.trim()) {
      setError("Please fill in all contact fields so the contractor can reach you.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.homeownerEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photos }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit job");
        return;
      }
      router.push(`/thank-you?ref=${encodeURIComponent(data.reference)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Job details */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide text-slate-500">Job details</h2>

        <div>
          <label className="label" htmlFor="title">Job title *</label>
          <input id="title" className="input" placeholder="e.g. Leaking kitchen faucet" required value={form.title} onChange={(e) => update("title", e.target.value)} />
        </div>

        <div>
          <label className="label" htmlFor="category">Category *</label>
          <select id="category" className="input" required value={form.category} onChange={(e) => update("category", e.target.value)}>
            <option value="">Select a category...</option>
            {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="description">Describe the problem *</label>
          <textarea id="description" className="input min-h-[120px]" placeholder="What needs fixing? When did it start? Any context that would help the contractor?" required value={form.description} onChange={(e) => update("description", e.target.value)} />
        </div>

        {/* Photo upload */}
        <div>
          <label className="label">Photos (optional, up to 5)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {photos.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 rounded-lg py-6 text-center text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              📷 Tap to add photos
              <span className="block text-xs text-slate-400 mt-1">JPG, PNG up to 5MB each</span>
            </button>
          )}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {photos.map((p) => (
                <div key={p.id} className="relative group">
                  <img src={p.dataUrl} alt={p.filename} className="w-full h-24 object-cover rounded-md border border-slate-200" />
                  <button
                    type="button"
                    onClick={() => removePhoto(p.id)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-900 text-sm uppercase tracking-wide text-slate-500">Your contact info</h2>

        <div>
          <label className="label" htmlFor="name">Full name *</label>
          <input id="name" className="input" required value={form.homeownerName} onChange={(e) => update("homeownerName", e.target.value)} />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="email">Email *</label>
            <input id="email" type="email" className="input" required value={form.homeownerEmail} onChange={(e) => update("homeownerEmail", e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone *</label>
            <input id="phone" type="tel" className="input" required value={form.homeownerPhone} onChange={(e) => update("homeownerPhone", e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="address">Job address *</label>
          <input id="address" className="input" placeholder="Street address, city" required value={form.homeownerAddress} onChange={(e) => update("homeownerAddress", e.target.value)} />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <button type="submit" className="btn-primary w-full text-base py-3" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit job →"}
      </button>
      <p className="text-xs text-center text-slate-400">
        By submitting, you agree to be contacted by a contractor about your job.
      </p>
    </form>
  );
}

export default function SubmitJobPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">F</div>
            <span className="font-semibold text-slate-900">Fixr</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">← Back</Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 md:py-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Submit a job</h1>
        <p className="text-sm text-slate-500 mb-6">No account needed. A contractor will follow up within 24 hours.</p>

        <Suspense fallback={<div className="text-center text-sm text-slate-400 py-12">Loading form...</div>}>
          <SubmitJobForm />
        </Suspense>
      </main>
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
