import { currentUser } from "@/lib/server/auth";
import { readSettings, saveSettings } from "@/lib/server/data";
import { body, handle, ok } from "@/lib/server/http";

export const GET = () => handle(async () => ok(await readSettings()));

export const PUT = (req: Request) => handle(async () => ok(await saveSettings(await body(req), await currentUser())));
