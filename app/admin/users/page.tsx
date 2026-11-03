"use client";

import Manager, { type Row, fmtDate } from "@/components/admin/Manager";
import { roleLabels, useUser } from "@/lib/auth";
import { now } from "@/lib/store";
import type { Role } from "@/lib/seed";

const roles = (Object.keys(roleLabels) as Role[]).map(r => ({ value: r, label: roleLabels[r] }));

export default function UsersAdmin() {
  const { user } = useUser();
  return (
    <Manager
      collection="users" title="Staff & users" noun="accounts" newLabel="Add account"
      intro={<>
        <b>Super admin</b>: everything, including accounts. <b>Admin</b>: all content and submissions.
        {" "}<b>Accountant</b>: donations and yearly reports. <b>Member</b>: public account for RSVPs and giving history.
      </>}
      search={r => `${r.name} ${r.email} ${roleLabels[r.role as Role]}`}
      sort={(a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name)}
      filters={[{ label: "All", test: () => true }, ...roles.map(r => ({ label: r.label, test: (x: Row) => x.role === r.value }))]}
      canDelete
      columns={[
        { label: "Name", get: r => <><b>{r.name}{r.id === user?.id && " (you)"}</b><small>{r.email}</small></>, csv: r => r.name },
        { label: "Email", get: () => null, csv: r => r.email, className: "hide" },
        { label: "Role", get: r => <span className={"role-pill r-" + r.role}>{roleLabels[r.role as Role]}</span>, csv: r => r.role },
        { label: "Created", get: r => fmtDate(r.createdAt), csv: r => r.createdAt },
      ]}
      blank={() => ({ name: "", email: "", role: "admin", newPassword: "", createdAt: now() })}
      fields={[
        { key: "name", label: "Name", required: true, half: true },
        { key: "email", label: "Email", type: "email", required: true, half: true },
        { key: "role", label: "Access level", type: "select", required: true, half: true, options: roles },
        { key: "newPassword", label: "Set password", half: true, help: "At least 8 characters. Leave blank to keep the current one." },
      ]}
      validate={(r, all) => {
        const email = String(r.email).trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "Enter a valid email.";
        if (all.some(x => x.id !== r.id && x.email.toLowerCase() === email)) return "Another account uses that email.";
        if (!r.id && !r.newPassword) return "Set a password for the new account.";
        if (r.newPassword && r.newPassword.length < 8) return "Passwords need at least 8 characters.";
        if (r.id === user?.id && r.role !== "superadmin") return "You can't remove your own super admin access.";
        return null;
      }}
      // The password goes to the server, which stores only a hash of it.
      beforeSave={async r => {
        const { pass: _, createdAt: _c, ...rest } = r;
        rest.email = String(rest.email).trim().toLowerCase();
        if (!rest.newPassword) delete rest.newPassword;
        return rest as typeof r;
      }}
    />
  );
}
