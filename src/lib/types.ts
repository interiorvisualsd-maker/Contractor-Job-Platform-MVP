// =====================
// Types
// =====================

export type JobStatus =
  | "new"
  | "qualified"
  | "assigned"
  | "quoted"
  | "completed"
  | "declined";

export interface JobPhoto {
  id: string;
  filename: string;
  // Base64 data URL — stored in memory for the demo. In production
  // (Bubble or otherwise) this would be an S3 URL.
  dataUrl: string;
  size: number;
}

export interface Quote {
  id: string;
  filename: string;
  dataUrl: string;
  amount: number;
  createdAt: string;
}

export interface Job {
  id: string;
  reference: string; // human-friendly, e.g. JOB-0042
  title: string;
  category: string;
  description: string;
  photos: JobPhoto[];
  // Homeowner contact
  homeownerName: string;
  homeownerEmail: string;
  homeownerPhone: string;
  homeownerAddress: string;
  // Workflow
  status: JobStatus;
  assignedContractorId: string | null;
  quote: Quote | null;
  invoiceAmount: number | null;
  adminNotes: string;
  // Audit
  createdAt: string;
  updatedAt: string;
  qualifiedAt: string | null;
  assignedAt: string | null;
  completedAt: string | null;
}

export interface Contractor {
  id: string;
  name: string;
  email: string;
  password: string; // demo only — plaintext
  trade: string;
  phone: string;
  activeJobCount: number;
}

export interface AdminUser {
  email: string;
  password: string;
}

// =====================
// Status labels + colors
// =====================

export const STATUS_LABELS: Record<JobStatus, string> = {
  new: "New",
  qualified: "Qualified",
  assigned: "Assigned",
  quoted: "Quote Uploaded",
  completed: "Completed",
  declined: "Declined",
};

export const STATUS_COLORS: Record<JobStatus, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  qualified: "bg-amber-50 text-amber-700 border-amber-200",
  assigned: "bg-purple-50 text-purple-700 border-purple-200",
  quoted: "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  declined: "bg-red-50 text-red-700 border-red-200",
};

export const JOB_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Roofing",
  "Carpentry",
  "Painting",
  "HVAC",
  "General Repair",
  "Renovation",
  "Flooring",
  "Other",
];

export const ADMIN: AdminUser = {
  email: "admin@demo.com",
  password: "demo123",
};
