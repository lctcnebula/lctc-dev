import { currentUser } from "@/lib/server/auth";
import { HttpError } from "@/lib/server/data";
import { handle, ok } from "@/lib/server/http";
import { seedDatabase } from "@/lib/server/seed-db";

// Super admin only: wipes content and submissions and reloads the starting content. Accounts are kept.
export const POST = () => handle(async () => {
  if ((await currentUser())?.role !== "superadmin") throw new HttpError(403, "Only a super admin can reset the site.");
  return ok(await seedDatabase({ reset: true }));
});
