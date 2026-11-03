import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Shell from "@/components/admin/Shell";
import { currentUser } from "@/lib/server/auth";
import { isStaff } from "@/lib/roles";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · LCTC Foundation" }, robots: { index: false, follow: false } };

// Checked on the server: visitors and members never get the dashboard, and every API call is checked again.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isStaff((await currentUser())?.role)) redirect("/login");
  return <Shell>{children}</Shell>;
}
