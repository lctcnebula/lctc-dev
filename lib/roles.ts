// Access levels, shared by the server (which enforces them) and the browser (which hides what you can't use).

import type { CollectionKey, Role } from "./seed";

export const roleLabels: Record<Role, string> = { superadmin: "Super admin", admin: "Admin", accountant: "Accountant", user: "Member" };

export type Section =
  | "dashboard" | "donations" | "applications" | "messages" | "rsvps" | "subscribers"
  | "events" | "blog" | "programs" | "board" | "alumni" | "reports" | "scholarships" | "users" | "settings";

const access: Record<Role, Section[] | "all"> = {
  superadmin: "all",
  admin: ["dashboard", "donations", "applications", "messages", "rsvps", "subscribers", "events", "blog", "programs", "board", "alumni", "reports", "scholarships", "settings"],
  accountant: ["dashboard", "donations", "reports"],
  user: [],
};

export const can = (role: Role | undefined, s: Section) => !!role && (access[role] === "all" || (access[role] as Section[]).includes(s));
export const isStaff = (role: Role | undefined) => can(role, "dashboard");

// The admin section that manages each collection.
export const sectionOf: Record<CollectionKey, Section> = {
  programs: "programs", events: "events", rsvps: "rsvps", posts: "blog", subscribers: "subscribers", donations: "donations",
  applications: "applications", messages: "messages", board: "board", alumni: "alumni", reports: "reports",
  scholarships: "scholarships", users: "users",
};

export const demoAccounts: { email: string; role: Role; what: string }[] = [
  { email: "superadmin@lctc.demo", role: "superadmin", what: "Everything, plus managing staff accounts" },
  { email: "admin@lctc.demo", role: "admin", what: "All content and all submissions" },
  { email: "accountant@lctc.demo", role: "accountant", what: "Donations and yearly reports only" },
  { email: "member@lctc.demo", role: "user", what: "Public account: RSVPs and giving history" },
];
export const DEMO_PASSWORD = "demo1234";

/** The signed-in person as the browser sees them. Password hashes never leave the server. */
export type Viewer = { id: string; name: string; email: string; role: Role };
