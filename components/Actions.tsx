"use client";

import Link from "next/link";
import { useSite } from "./Providers";

type Btn = { className?: string; children: React.ReactNode };

export function DonateButton({ className = "btn solid", fund, children }: Btn & { fund?: string }) {
  return <Link className={className} href={fund ? `/donate?type=${encodeURIComponent(fund)}` : "/donate"}>{children}</Link>;
}

export function ConfettiButton({ className = "btn ghost", children }: Btn) {
  const { throwConfetti } = useSite();
  return <button className={className} type="button" onClick={e => throwConfetti(e.currentTarget)}>{children}</button>;
}

async function copy(text: string, done: string, say: (m: string) => void) {
  try { await navigator.clipboard.writeText(text); say(done); }
  catch { say(text); }
}

export function CopyButton({ text, className = "copy-btn", children = "Copy" }: Partial<Btn> & { text: string }) {
  const { say } = useSite();
  return <button className={className} type="button" onClick={() => copy(text, "Copied", say)}>{children}</button>;
}

export function ShareButton({ className = "more", children }: Btn) {
  const { say } = useSite();
  return <button className={className} type="button" onClick={() => copy(location.origin, "Link copied. Thanks for sharing!", say)}>{children}</button>;
}
