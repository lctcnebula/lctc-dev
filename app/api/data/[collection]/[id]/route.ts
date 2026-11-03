import { currentUser } from "@/lib/server/auth";
import { HttpError, isCollection, removeItem, updateItem } from "@/lib/server/data";
import { body, handle, ok } from "@/lib/server/http";

type Ctx = { params: Promise<{ collection: string; id: string }> };

async function key(ctx: Ctx) {
  const { collection, id } = await ctx.params;
  if (!isCollection(collection)) throw new HttpError(404, "Unknown collection.");
  return { collection, id };
}

export const PATCH = (req: Request, ctx: Ctx) => handle(async () => {
  const { collection, id } = await key(ctx);
  return ok(await updateItem(collection, id, await body(req), await currentUser()));
});

export const DELETE = (_: Request, ctx: Ctx) => handle(async () => {
  const { collection, id } = await key(ctx);
  await removeItem(collection, id, await currentUser());
  return ok({ ok: true });
});
