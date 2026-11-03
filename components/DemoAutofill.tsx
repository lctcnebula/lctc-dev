"use client";

import { useSite } from "./Providers";
import { DEMO_PASSWORD } from "@/lib/auth";

// Demo helper: a floating button that fills every visible form on the page with sample answers, so any form
// (donate, apply, contact, RSVP, sign in, admin editors) can be tried end to end. Remove before launch.

const SKIP = new Set(["hidden", "file", "submit", "button", "reset", "search", "range", "color", "image"]);
// Long enough for fields with a minimum word count, like the grant application essay (75 words).
const ESSAY = "This is a sample answer filled in by the demo autofill button so the form can be tried from start to finish. "
  + "I chose my program because I like working with my hands and solving real problems. My instructors showed me how the skills I learn in the shop "
  + "connect to real jobs in Lake County. With this support I can pay for my tools and certification exam, finish the program strong, and start an "
  + "apprenticeship after graduation. I want to keep learning, earn more credentials, and one day help train the next group of students.";
const inFuture = (days: number) => new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);

// Picks a sample value from what the field is about: its type, id, name, autocomplete, placeholder and label.
function sample(el: HTMLInputElement | HTMLTextAreaElement, about: string, login: boolean): string | null {
  const t = el instanceof HTMLInputElement ? el.type : "textarea";
  const has = (re: RegExp) => re.test(about);
  if (t === "password") return DEMO_PASSWORD;
  if (t === "email" || has(/e-?mail/)) return login ? "member@lctc.demo" : "jordan.rivera@example.com";
  if (t === "tel" || has(/phone|mobile|\btel\b/)) return "(847) 555-0142";
  if (t === "date") return inFuture(14);
  if (t === "time") return "18:00";
  if (t === "datetime-local") return inFuture(14) + "T18:00";
  if (t === "url" || has(/url|website|link|https?:/)) return "https://example.com";
  if (has(/card ?num|d-card|cc-number/)) return "4242424242424242";
  if (has(/\bexp|expir|cc-exp/)) return "1230";
  if (has(/cvc|cvv|security code|cc-csc/)) return "123";
  if (has(/zip|postal/)) return "60030";
  if (has(/year|class of/)) return String(new Date().getFullYear());
  if (has(/amount|\$|price|cost/)) return "250";
  if (has(/gpa/)) return "3.5";
  if (has(/student id|\bid number/)) return "204518";
  if (t === "textarea") return ESSAY;
  if (has(/first/)) return "Jordan";
  if (has(/last|surname/)) return "Rivera";
  if (has(/school/)) return "Grayslake Central High School";
  if (has(/program/)) return "Welding/Fabrication";
  if (has(/company|business|organi[sz]ation|employer/)) return "Acme Builders";
  if (has(/city|town/)) return "Grayslake";
  if (has(/state/)) return "IL";
  if (has(/address|street/)) return "123 Main St";
  if (has(/occasion|reason/)) return "their birthday";
  if (has(/do now|job|role|position|occupation/)) return "Apprentice at a local fabrication shop";
  if (has(/name|who/)) return "Jordan Rivera";
  if (has(/slug/)) return null; // generated from the title
  if (has(/subject|title|headline/)) return "Sample title for this demo";
  if (t === "number") return "1";
  return "Sample text";
}

// React keeps its own copy of an input's value, so set it through the native setter and fire the events it listens to.
function setValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, v: string) {
  const proto = Object.getPrototypeOf(el);
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, v);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

const visible = (el: HTMLElement) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && !el.closest("[aria-hidden='true'], [inert]");

function labelOf(el: HTMLElement) {
  const byFor = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`)?.textContent : "";
  return byFor || el.closest("label")?.textContent || el.getAttribute("aria-label") || "";
}

function fillPage() {
  const login = !!document.querySelector("input[type='password'][autocomplete='current-password']");
  const scope = document.querySelector("main") ?? document.body;
  const fields = [...scope.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select")]
    .filter(el => !el.disabled && !(el as HTMLInputElement).readOnly && visible(el) && !SKIP.has((el as HTMLInputElement).type));
  const radios = new Set<string>();
  let n = 0;
  for (const el of fields) {
    if (el instanceof HTMLSelectElement) {
      if (el.value) continue;
      const opt = [...el.options].find(o => o.value && !o.disabled);
      if (opt) { setValue(el, opt.value); n++; }
      continue;
    }
    if (el instanceof HTMLInputElement && el.type === "radio") {
      if (radios.has(el.name)) continue;
      radios.add(el.name);
      const group = fields.filter(x => x instanceof HTMLInputElement && x.type === "radio" && x.name === el.name) as HTMLInputElement[];
      if (!group.some(x => x.checked)) { el.click(); n++; }
      continue;
    }
    if (el instanceof HTMLInputElement && el.type === "checkbox") {
      if (!el.checked && el.required) { el.click(); n++; }
      continue;
    }
    const about = [el.id, el.name, el.getAttribute("autocomplete"), el.placeholder, labelOf(el)].join(" ").toLowerCase();
    const v = sample(el, about, login);
    if (v === null) continue;
    setValue(el, v); n++;
  }
  return n;
}

export default function DemoAutofill() {
  const { say } = useSite();
  return (
    <button type="button" className="demo-autofill" title="Fill this page's form with sample answers (demo only)"
      onClick={() => { const n = fillPage(); say(n ? `⚡ Filled ${n} field${n === 1 ? "" : "s"} with sample answers` : "No form to fill on this page"); }}>
      <span aria-hidden="true">⚡</span> Autofill
    </button>
  );
}
