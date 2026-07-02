"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ThankYouContent() {
  const ref = useSearchParams().get("ref") || "JOB-0000";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Job submitted!</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your job reference is <span className="font-mono font-semibold text-slate-900">{ref}</span>. Keep this for your records.
        </p>

        <div className="card p-5 mt-6 text-left">
          <h2 className="font-semibold text-slate-900 text-sm mb-3">What happens next?</h2>
          <ol className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
              <span>We've sent a confirmation email to your inbox.</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2</span>
              <span>Our admin team reviews your job (usually within a few hours during business days).</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">3</span>
              <span>We match you with a verified contractor in your area.</span>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">4</span>
              <span>The contractor sends you a quote and reaches out to schedule.</span>
            </li>
          </ol>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-secondary">Back to home</Link>
          <Link href="/submit" className="btn-primary">Submit another job</Link>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  );
}
