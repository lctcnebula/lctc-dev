# LCTC Foundation website

Front-end only Next.js site for the Lake County Tech Campus Foundation, hosted on Vercel, with a built-in admin dashboard. No API routes, no database.

**Important:** with no server, everything the dashboard manages (events, RSVPs, blog posts, donations, applications, messages, subscribers, board, alumni, yearly reports, staff accounts) is saved in the visitor's own browser (localStorage). It is a fully working demo, but a submission made on one computer is not visible on another. To go live, swap the bodies of the functions in `lib/store.ts` and `lib/auth.ts` for calls to a real backend (e.g. Supabase); the pages don't need to change.

## Admin dashboard

Sign in at `/login`. Demo accounts (password `demo1234` for all):

| Email | Level | Can use |
| --- | --- | --- |
| superadmin@lctc.demo | Super admin | Everything, plus staff accounts and resetting demo data |
| admin@lctc.demo | Admin | All submissions and all content |
| accountant@lctc.demo | Accountant | Dashboard, donations, yearly reports |
| member@lctc.demo | Member | Public account: prefilled RSVPs/donations, `/account` history |

Visitors can also create a member account on `/login`.

Every public form lands in the dashboard: donations, grant applications, contact messages, event RSVPs, event subscribers and alumni sign-ups. Each list has search, filters and CSV export.

Content marked `sample` in `lib/seed.ts` is placeholder text and shows a yellow "Sample" tag on the site until an admin edits or deletes it.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Deploy (Vercel)

Import the GitHub repo in Vercel. It detects Next.js automatically: no settings or environment variables needed. Every push to `main` redeploys.

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home: hero slideshow, stats, member-school ticker (once schools are added in Settings), student aid, programs, events, donate |
| `/programs` | All programs with category filters |
| `/programs/[slug]` | One page per program, generated from the data |
| `/apply` | Four-step student grant application, plus outside scholarships |

## Editing content

Day-to-day content is edited in the admin dashboard. Starting data is in `lib/seed.ts`; fixed content (hero slides, grant types, photo credits) is in `lib/content.ts`. `sitemap.xml` lists the static pages plus the seeded programs, events and posts.

## Grant applications



- The form checks every field before it can be finished (`lib/application.ts`).
- Progress saves on the student's device, so they can come back later.
- On submit it goes to Admin → Grant applications, and the student gets a confirmation number plus a download/print copy.

## Donations

The donate dialog is a **demo checkout**: it accepts any amount (no upper limit) but charges nothing. To take real gifts, point the button at a hosted payment page (Stripe Payment Links, PayPal, Givebutter, etc.) in `components/DonateModal.tsx`; those need no server either.
