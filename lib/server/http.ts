// Shared helpers for the API route handlers.

import { NextResponse } from "next/server";
import { HttpError } from "./data";

export const ok = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

/** Runs a handler and turns thrown errors into JSON { error } responses. */
export async function handle(fn: () => Promise<Response>) {
  try { return await fn(); }
  catch (e) {
    if (e instanceof HttpError) return ok({ error: e.message }, e.status);
    if (e instanceof SyntaxError) return ok({ error: "Bad request." }, 400);
    console.error(e);
    return ok({ error: "Something went wrong on our side. Please try again." }, 500);
  }
}

export async function body(req: Request): Promise<Record<string, unknown>> {
  const b = await req.json();
  if (!b || typeof b !== "object" || Array.isArray(b)) throw new HttpError(400, "Bad request.");
  return b;
}
