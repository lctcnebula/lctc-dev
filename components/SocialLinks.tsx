import type { BoardMember } from "@/lib/seed";

type Key = "website" | "linkedin" | "facebook" | "instagram" | "x";

// Order shown on a profile; only links the member actually has are rendered.
export const socials: { key: Key; label: string; icon: React.ReactNode }[] = [
  { key: "website", label: "Website", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg> },
  { key: "linkedin", label: "LinkedIn", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.95 1.32-1.95 2.7V21h-4z" /></svg> },
  { key: "facebook", label: "Facebook", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8.5V6.8c0-.8.5-1 .9-1h2.4V2.1L14 2c-3.6 0-4.4 2.7-4.4 4.4v2.1H7.5V12h2.1v10H14V12h3l.4-3.5z" /></svg> },
  { key: "instagram", label: "Instagram", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" /></svg> },
  { key: "x", label: "X", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z" /></svg> },
];

export default function SocialLinks({ m }: { m: BoardMember }) {
  const links = socials.filter(s => m[s.key]?.trim());
  if (!links.length) return null;
  return (
    <ul className="socials" aria-label={`${m.name} online`}>
      {links.map(s => (
        <li key={s.key}>
          <a href={m[s.key]} target="_blank" rel="noopener" aria-label={`${s.label} (opens in a new tab)`} title={s.label}>{s.icon}</a>
        </li>
      ))}
    </ul>
  );
}
