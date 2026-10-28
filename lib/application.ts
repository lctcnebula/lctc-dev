import { grantTypes } from "./content";

// Member schools and programs are edited in the admin dashboard, so callers pass the current lists in.
export type Lists = { schools: string[]; programs: { slug: string; name: string }[] };

// Validation and formatting for the student grant application. Runs entirely in the browser.

export type ApplicationInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  grade: string;
  school: string;
  program: string;
  programYear: string;
  grantType: string;
  amount: string;
  purpose: string;
  plans: string;
  freeLunch: string;
  essay: string;
  instructorName: string;
  instructorEmail: string;
  guardianName: string;
  guardianEmail: string;
  certify: boolean;
  consent: boolean;
};

export type Application = ApplicationInput & { id: string; submittedAt: string };

export const emptyApplication: ApplicationInput = {
  firstName: "", lastName: "", email: "", phone: "", grade: "", school: "", program: "", programYear: "",
  grantType: "", amount: "", purpose: "", plans: "", freeLunch: "",
  essay: "", instructorName: "", instructorEmail: "", guardianName: "", guardianEmail: "",
  certify: false, consent: false,
};

export const grades = ["Junior (11th)", "Senior (12th)", "Adult learner"];
export const programYears = ["First year", "Second year"];
export const plansOptions = ["Two-year college", "Four-year college", "Apprenticeship", "Straight into the workforce", "Military", "Not sure yet"];
export const ESSAY_MIN_WORDS = 75;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const wordCount = (s: string) => (s.trim().match(/\S+/g) || []).length;

export type Errors = Partial<Record<keyof ApplicationInput, string>>;

export const stepFields: (keyof ApplicationInput)[][] = [
  ["firstName", "lastName", "email", "phone", "grade", "school", "program", "programYear"],
  ["grantType", "amount", "purpose", "plans"],
  ["essay", "instructorName", "instructorEmail", "guardianName", "guardianEmail"],
  ["certify", "consent"],
];

export function validate(a: ApplicationInput, lists: Lists, fields?: (keyof ApplicationInput)[]): Errors {
  const e: Errors = {};
  const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  if (s(a.firstName).length < 1) e.firstName = "Enter your first name.";
  if (s(a.lastName).length < 1) e.lastName = "Enter your last name.";
  if (!emailRe.test(s(a.email))) e.email = "Enter a valid email address.";
  if (s(a.phone) && s(a.phone).replace(/\D/g, "").length < 10) e.phone = "Enter a 10-digit phone number.";
  if (!grades.includes(a.grade)) e.grade = "Choose your grade.";
  if (lists.schools.length ? !lists.schools.includes(a.school) && a.school !== "Other" : s(a.school).length < 2) e.school = lists.schools.length ? "Choose your home high school." : "Enter your home high school.";
  if (!lists.programs.some(p => p.slug === a.program)) e.program = "Choose your Tech Campus program.";
  if (!programYears.includes(a.programYear)) e.programYear = "Choose your year in the program.";
  if (!grantTypes.some(g => g.id === a.grantType)) e.grantType = "Choose what you're applying for.";
  if (s(a.amount)) {
    const n = Number(s(a.amount).replace(/[$,]/g, ""));
    if (!(n > 0)) e.amount = "Enter a dollar amount, or leave it blank.";
  }
  if (s(a.purpose).length < 15) e.purpose = "Tell us briefly what this would pay for.";
  if (!plansOptions.includes(a.plans)) e.plans = "Choose your plans after Tech Campus.";
  if (wordCount(s(a.essay)) < ESSAY_MIN_WORDS) e.essay = `Write at least ${ESSAY_MIN_WORDS} words.`;
  if (s(a.instructorName).length < 2) e.instructorName = "Name a Tech Campus instructor who knows your work.";
  if (!emailRe.test(s(a.instructorEmail))) e.instructorEmail = "Enter your instructor's email.";
  if (a.grade !== "Adult learner") {
    if (s(a.guardianName).length < 2) e.guardianName = "Enter a parent or guardian's name.";
    if (!emailRe.test(s(a.guardianEmail))) e.guardianEmail = "Enter a parent or guardian's email.";
  }
  if (a.certify !== true) e.certify = "Please confirm your information is accurate.";
  if (a.consent !== true) e.consent = "Please agree so we can contact your references.";
  if (!fields) return e;
  return Object.fromEntries(Object.entries(e).filter(([k]) => fields.includes(k as keyof ApplicationInput)));
}

// Plain-text version of a finished application, used for the downloadable copy.
// The answers as label/value rows, used for the downloadable PDF copy.
export function applicationRows(a: Application, programs: Lists["programs"] = []): [string, string][] {
  const program = programs.find(p => p.slug === a.program)?.name ?? a.program;
  const grant = grantTypes.find(g => g.id === a.grantType)?.name ?? a.grantType;
  const rows: [string, string][] = [
    ["Confirmation", a.id],
    ["Submitted", new Date(a.submittedAt).toLocaleString("en-US")],
    ["Name", `${a.firstName} ${a.lastName}`],
    ["Email", a.email],
    ["Phone", a.phone || "-"],
    ["Grade", a.grade],
    ["High school", a.school],
    ["Program", `${program} (${a.programYear})`],
    ["Applying for", grant],
    ["Amount", a.amount ? "$" + a.amount.replace(/^\$/, "") : "Not specified"],
    ["Pays for", a.purpose],
    ["Plans", a.plans],
    ["Free/reduced lunch", a.freeLunch || "-"],
    ["Instructor", `${a.instructorName} <${a.instructorEmail}>`],
  ];
  if (a.guardianName) rows.push(["Parent/guardian", `${a.guardianName} <${a.guardianEmail}>`]);
  return rows;
}
