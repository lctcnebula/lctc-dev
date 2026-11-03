// What every page is rendered with: the signed-in person and the content they can see, so pages show real data
// on first load instead of filling in after a fetch. Private collections are fetched by the page that needs them.

import { currentUser } from "./auth";
import { readCollection, readSettings } from "./data";
import type { Initial } from "../store";
import type { CollectionKey } from "../seed";

const PRELOAD: CollectionKey[] = ["programs", "events", "posts", "board", "alumni", "reports", "scholarships", "rsvps"];

export async function initialData() {
  const viewer = await currentUser();
  const [settings, ...lists] = await Promise.all([readSettings(), ...PRELOAD.map(k => readCollection(k, viewer))]);
  const data: Initial = { settings };
  PRELOAD.forEach((k, i) => { (data as Record<string, unknown>)[k] = lists[i]; });
  return { data, viewer };
}
