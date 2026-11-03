import { currentUser, endSession, register, signIn } from "@/lib/server/auth";
import { HttpError } from "@/lib/server/data";
import { body, handle, ok } from "@/lib/server/http";

type Ctx = { params: Promise<{ action: string }> };

// GET /api/auth/me → the signed-in person (or null).
export const GET = (_: Request, ctx: Ctx) => handle(async () => {
  if ((await ctx.params).action !== "me") throw new HttpError(404, "Not found.");
  return ok(await currentUser());
});

// POST /api/auth/signin { email, password } · /api/auth/register { name, email, password } · /api/auth/signout
export const POST = (req: Request, ctx: Ctx) => handle(async () => {
  const { action } = await ctx.params;
  if (action === "signout") { await endSession(); return ok(null); }
  const b = await body(req);
  const email = String(b.email ?? ""), password = String(b.password ?? "");
  if (action === "signin") return ok(await signIn(email, password).catch(e => { throw new HttpError(401, e.message); }));
  if (action === "register") return ok(await register(String(b.name ?? ""), email, password).catch(e => { throw new HttpError(400, e.message); }));
  throw new HttpError(404, "Not found.");
});
