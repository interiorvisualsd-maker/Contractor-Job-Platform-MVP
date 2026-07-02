# Fixr — Contractor Job Submission Platform (MVP Demo)

Working Next.js prototype of the contractor job platform described in the Upwork job post. This is a **demonstration of the UX/flow** — the actual production app would be built in Bubble.io per the client's spec.

## Live demo

Deploy to Vercel (free) — see instructions below.

## What's included (Phase 1 scope)

### Homeowner flow (public, no account)
- **Landing page** (`/`) — mobile-first, category picker, CTA
- **Job submission form** (`/submit`) — title, category, description, photo upload (up to 5), contact info
- **Thank-you page** (`/thank-you`) — job reference number, "what happens next" timeline
- **Confirmation email** — simulated (logged to server console)

### Admin flow (protected)
- **Admin login** (`/admin/login`) — hardcoded demo creds shown on page
- **Admin dashboard** (`/admin`) — stats (new/qualified/assigned/completed), status filter chips, search by title/reference/name/address
- **Admin job detail** (`/admin/jobs/[id]`) — full job info, homeowner contact, photos, status management (6 statuses), contractor assignment, admin notes, timeline/audit trail
- **Contractor management** (`/admin/contractors`) — list of contractors with per-contractor stats, demo login creds shown

### Contractor flow (protected, role-based)
- **Contractor login** (`/contractor/login`) — 3 demo contractors, one-click fill
- **Contractor dashboard** (`/contractor`) — **only sees jobs assigned to them**, stats (pending/quoted/completed)
- **Contractor job detail** (`/contractor/jobs/[id]`) — job info + homeowner contact (read-only), accept/decline, quote upload (amount + PDF), final invoice submission, mark complete

## What's NOT included (per client spec)
- ❌ Homeowner login/dashboard
- ❌ Payments / escrow
- ❌ Native mobile apps
- ❌ Open bidding
- ❌ Subscriptions
- ❌ AI quote estimates
- ❌ Complex chat

## Demo credentials

**Admin:** `admin@demo.com` / `demo123`
**Contractors** (all password `demo123`):
- `mike@demo.com` — Plumbing (has 1 assigned job)
- `sarah@demo.com` — Electrical (has 1 assigned job)
- `tom@demo.com` — Roofing (has 1 completed job)

All credentials are shown on the respective login pages with one-click auto-fill.

## Tech stack (demo)
- **Next.js 14** (App Router) + TypeScript
- **TailwindCSS 3** — mobile-first responsive
- **jose** — JWT auth (admin + contractor cookies)
- **In-memory store** — seeded with 3 sample jobs + 3 contractors. Resets on cold start (acceptable for demo; production would use Bubble's DB).

## How to test the full flow (3 min)

### 1. Homeowner submits a job
1. Open the demo URL on your phone or desktop
2. Click "Submit a job"
3. Fill in the form, add a photo or two
4. Click "Submit job"
5. Note the job reference on the thank-you page

### 2. Admin qualifies and assigns
1. Go to `/admin/login` → auto-fill → sign in
2. Find your new job at the top of the list (status: New)
3. Click it → click "Qualified" → select a contractor from the dropdown
4. Status auto-moves to "Assigned"

### 3. Contractor responds
1. Go to `/contractor/login` → click the contractor you just assigned → sign in
2. See the assigned job in your dashboard
3. Click it → "Accept job" → enter quote amount → "Submit quote"
4. Enter final invoice amount → "Submit invoice & complete job"
5. Status moves to "Completed"

### 4. Verify in admin
1. Back in admin dashboard, filter by "Completed"
2. Open the job → see the quote amount, invoice amount, and full timeline

## Deploy to Vercel (free)

1. Push this repo to GitHub
2. Go to https://vercel.com/new → import the repo
3. Framework: Next.js (auto-detected)
4. No environment variables needed
5. Click Deploy

## Database structure (5 tables — maps to Bubble)

This is what I'd recommend for the Bubble build:

```
Users (admin + contractor roles)
├── email (unique)
├── password (hashed)
├── role (admin | contractor)
├── name
├── trade (for contractors)
└── phone

Jobs
├── reference (JOB-0001)
├── title
├── category
├── description
├── status (new | qualified | assigned | quoted | completed | declined)
├── assignedContractor (link to Users)
├── adminNotes
├── homeownerName, homeownerEmail, homeownerPhone, homeownerAddress
├── createdAt, qualifiedAt, assignedAt, completedAt
└── quote (link to Quotes)
└── invoiceAmount

JobPhotos
├── job (link to Jobs)
├── fileUrl
└── uploadedAt

Quotes
├── job (link to Jobs)
├── contractor (link to Users)
├── amount
├── fileUrl
└── createdAt

StatusLog (audit trail)
├── job (link to Jobs)
├── fromStatus
├── toStatus
├── changedBy (link to Users)
└── changedAt
```

## Securing contractor/job data (Bubble Privacy Rules)

- **Contractors** can only see Jobs where `assignedContractor = Current User`
- **Contractors** can only edit `quote`, `invoiceAmount`, and `status` (limited to quoted/completed/declined) on jobs assigned to them
- **Admin** has full access to all tables
- **Public** (no auth) can only create Jobs — cannot read, edit, or list
- File uploads use Bubble's signed S3 URLs (private, expire in 7 days)
- No PII in URL parameters

## License
Demo prototype — all rights reserved.
