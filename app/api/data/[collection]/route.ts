import { currentUser } from "@/lib/server/auth";
import { createItem, HttpError, isCollection, readCollection } from "@/lib/server/data";
import { body, handle, ok } from "@/lib/server/http";

type Ctx = { params: Promise<{ collection: string }> };

async function key(ctx: Ctx) {
  const { collection } = await ctx.params;
  if (!isCollection(collection)) throw new HttpError(404, "Unknown collection.");
  return collection;
}

export const GET = (_: Request, ctx: Ctx) => handle(async () => ok(await readCollection(await key(ctx), await currentUser())));

export const POST = (req: Request, ctx: Ctx) => handle(async () => ok(await createItem(await key(ctx), await body(req), await currentUser()), 201));
