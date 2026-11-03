// Creates the Neon tables and loads the starting content. Run once per database (it's safe to re-run):
//   npm run db:setup            keep what's there, add anything missing
//   npm run db:setup -- --reset wipe content and submissions, then reload the starting content

import { seedDatabase } from "../lib/server/seed-db";

const reset = process.argv.includes("--reset");
seedDatabase({ reset })
  .then(added => { console.log(reset ? "Reset and seeded." : "Database ready.", "Rows added:", added); })
  .catch(e => { console.error(e); process.exit(1); });
