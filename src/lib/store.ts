import type { Job, Contractor } from "./types";

// =====================
// In-memory store
// =====================
// On Vercel serverless, this persists across warm invocations of the same
// function instance. Cold starts will re-seed. For a demo this is fine —
// in production (Bubble or otherwise) you'd use a real database.

declare global {
  // eslint-disable-next-line no-var
  var __contractorMvpStore: Store | undefined;
}

interface Store {
  jobs: Job[];
  contractors: Contractor[];
  jobCounter: number;
}

function seed(): Store {
  const now = new Date();
  const iso = (offsetMin: number) => new Date(now.getTime() - offsetMin * 60_000).toISOString();

  const contractors: Contractor[] = [
    {
      id: "c1",
      name: "Mike Reynolds",
      email: "mike@demo.com",
      password: "demo123",
      trade: "Plumbing",
      phone: "555-0101",
      activeJobCount: 1,
    },
    {
      id: "c2",
      name: "Sarah Chen",
      email: "sarah@demo.com",
      password: "demo123",
      trade: "Electrical",
      phone: "555-0102",
      activeJobCount: 0,
    },
    {
      id: "c3",
      name: "Tom Okafor",
      email: "tom@demo.com",
      password: "demo123",
      trade: "Roofing",
      phone: "555-0103",
      activeJobCount: 0,
    },
  ];

  const jobs: Job[] = [
    {
      id: "j1",
      reference: "JOB-0001",
      title: "Leaking kitchen faucet",
      category: "Plumbing",
      description:
        "The kitchen faucet has been dripping constantly for the past week. It's gotten worse in the last two days. I've tried tightening the handle but it hasn't helped. Looking for someone to come take a look and repair or replace as needed.",
      photos: [],
      homeownerName: "Emily Johnson",
      homeownerEmail: "emily.johnson@example.com",
      homeownerPhone: "555-1001",
      homeownerAddress: "142 Maple Street, Springfield",
      status: "new",
      assignedContractorId: null,
      quote: null,
      invoiceAmount: null,
      adminNotes: "",
      createdAt: iso(15),
      updatedAt: iso(15),
      qualifiedAt: null,
      assignedAt: null,
      completedAt: null,
    },
    {
      id: "j2",
      reference: "JOB-0002",
      title: "Bathroom light fixture installation",
      category: "Electrical",
      description:
        "Need two new light fixtures installed in the master bathroom. The old ones have been removed already, wiring is in place. New fixtures are LED recessed lights, purchased and ready.",
      photos: [],
      homeownerName: "David Martinez",
      homeownerEmail: "david.martinez@example.com",
      homeownerPhone: "555-1002",
      homeownerAddress: "78 Oak Avenue, Riverside",
      status: "assigned",
      assignedContractorId: "c2",
      quote: null,
      invoiceAmount: null,
      adminNotes: "Homeowner available weekday evenings after 5pm.",
      createdAt: iso(240),
      updatedAt: iso(60),
      qualifiedAt: iso(180),
      assignedAt: iso(60),
      completedAt: null,
    },
    {
      id: "j3",
      reference: "JOB-0003",
      title: "Roof shingle replacement",
      category: "Roofing",
      description:
        "Several shingles blew off during last week's storm. The roof is about 12 years old. Need someone to inspect and replace the missing/damaged shingles. Two-story house, easy access.",
      photos: [],
      homeownerName: "Patricia Lee",
      homeownerEmail: "patricia.lee@example.com",
      homeownerPhone: "555-1003",
      homeownerAddress: "305 Hillcrest Drive, Westfield",
      status: "completed",
      assignedContractorId: "c3",
      quote: {
        id: "q1",
        filename: "roofing-quote.pdf",
        dataUrl: "",
        amount: 850,
        createdAt: iso(1440),
      },
      invoiceAmount: 920,
      adminNotes: "Homeowner requested additional flashing work mid-job, hence invoice > quote.",
      createdAt: iso(2880),
      updatedAt: iso(120),
      qualifiedAt: iso(2800),
      assignedAt: iso(2400),
      completedAt: iso(120),
    },
  ];

  return { jobs, contractors, jobCounter: 3 };
}

export function getStore(): Store {
  if (!global.__contractorMvpStore) {
    global.__contractorMvpStore = seed();
  }
  return global.__contractorMvpStore;
}

// =====================
// Helpers
// =====================

export function nextReference(): string {
  const store = getStore();
  store.jobCounter += 1;
  return `JOB-${String(store.jobCounter).padStart(4, "0")}`;
}

export function getJobById(id: string): Job | undefined {
  return getStore().jobs.find((j) => j.id === id);
}

export function getContractorById(id: string | null): Contractor | undefined {
  if (!id) return undefined;
  return getStore().contractors.find((c) => c.id === id);
}

export function getContractorByEmail(email: string): Contractor | undefined {
  return getStore().contractors.find((c) => c.email.toLowerCase() === email.toLowerCase());
}

export function updateJob(id: string, patch: Partial<Job>): Job | undefined {
  const store = getStore();
  const idx = store.jobs.findIndex((j) => j.id === id);
  if (idx === -1) return undefined;
  const updated = { ...store.jobs[idx], ...patch, updatedAt: new Date().toISOString() };
  store.jobs[idx] = updated;
  return updated;
}

export function createJob(input: Omit<Job, "id" | "reference" | "status" | "assignedContractorId" | "quote" | "invoiceAmount" | "adminNotes" | "createdAt" | "updatedAt" | "qualifiedAt" | "assignedAt" | "completedAt">): Job {
  const store = getStore();
  const now = new Date().toISOString();
  const job: Job = {
    ...input,
    id: `j${Date.now()}`,
    reference: nextReference(),
    status: "new",
    assignedContractorId: null,
    quote: null,
    invoiceAmount: null,
    adminNotes: "",
    createdAt: now,
    updatedAt: now,
    qualifiedAt: null,
    assignedAt: null,
    completedAt: null,
  };
  store.jobs.unshift(job);
  return job;
}
