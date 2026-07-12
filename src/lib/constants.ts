// @ts-nocheck
import type { Department, UserRole, VentureStage, ApplicationStatus } from "@/types/database";

export const DEPARTMENTS: Department[] = [
  "CSE", "Electrical", "Mechanical", "Civil", "Chemical", "Aerospace",
  "Metallurgy", "EnergyScience", "EngineeringPhysics", "IDC", "SJMSOM",
  "Mathematics", "Physics", "Chemistry", "Other",
];

export const ROLES: UserRole[] = [
  "Founder",
  "Builder",
  "Investor",
  "Founder & Builder",
  "Founder & Investor",
  "Builder & Investor",
  "All three",
];

export const STAGES: VentureStage[] = ["Brainstorming", "MVP", "Early traction", "Funded"];

export const ROLES_NEEDED = [
  "Co-founder", "Tech lead", "Backend dev", "Frontend dev", "Mobile dev",
  "Designer", "Product", "Growth / Marketing", "Finance", "Operations",
];

export const DOMAINS = [
  "FinTech", "EdTech", "HealthTech", "DeepTech", "SaaS", "Hardware",
  "Consumer", "Sustainability", "AI / ML", "Research", "Other",
];

export const VENTURE_TYPES = [
  { value: "startup", label: "Startup" },
  { value: "research", label: "Research" },
];

export const SKILLS = [
  "Flutter", "React", "Next.js", "Node.js", "Python", "Dart", "Swift",
  "UI/UX", "Figma", "Firebase", "Supabase", "Machine learning", "Data",
  "Finance", "Marketing", "Sales", "Operations", "Product",
];

export const STAGE_STYLES: Record<VentureStage, string> = {
  "Brainstorming": "bg-ink-3/10 text-ink-2",
  "MVP": "bg-brand-50 text-brand-800",
  "Early traction": "bg-emerald-50 text-emerald-700",
  "Funded": "bg-amber-50 text-amber-700",
};

export const ACCOUNT_TYPES: { value: string; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "alumni", label: "Alumni" },
  { value: "faculty", label: "Faculty" },
  { value: "investor", label: "Investor (coming soon)" },
];

export const APPLICATION_STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

export function roleLabel(role: string | null | undefined): string {
  if (!role) return "";
  const lower = role.toLowerCase();
  if (lower === "both") return "Founder & Builder";
  if (lower === "all three") return "Founder, Builder & Investor";
  return role;
}
