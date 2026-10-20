// Starting data for every collection the admin dashboard manages.
// Anything marked `sample: true` is placeholder content: it shows a "Sample" tag on the
// public site until an admin edits or deletes it. All of it is original placeholder content.

import type { Application } from "./application";

export type Category = "health" | "safety" | "trades" | "tech" | "service";

export type Program = {
  id: string; slug: string; name: string; cat: Category; icon: string; image: string;
  length: string; summary: string; learn: string[]; outcome: string; sample?: boolean;
};

export type FoundationEvent = {
  id: string; slug: string; title: string; date: string; start: string; end: string; location: string;
  summary: string; body: string; image: string; capacity: number; rsvpOpen: boolean; published: boolean; sample?: boolean;
};

export type Rsvp = { id: string; eventId: string; name: string; email: string; guests: number; note: string; createdAt: string; sample?: boolean };

export type Post = {
  id: string; slug: string; title: string; date: string; author: string; eventId: string;
  excerpt: string; body: string; image: string; published: boolean; sample?: boolean;
};

export type Subscriber = { id: string; email: string; name: string; createdAt: string; sample?: boolean };

export type Donation = {
  id: string; receipt: string; name: string; email: string; amount: number; freq: "once" | "monthly";
  fund: string; card: string; createdAt: string; sample?: boolean;
};

export type StoredApplication = Application & { status: string; sample?: boolean };

export type Message = { id: string; name: string; email: string; topic: string; message: string; status: string; createdAt: string; sample?: boolean };

export type BoardMember = { id: string; name: string; role: string; bio: string; photo: string; order: number; sample?: boolean };

export type Alum = {
  id: string; name: string; email: string; program: string; year: string; now: string; story: string;
  photo: string; published: boolean; createdAt: string; sample?: boolean;
};

export type YearReport = {
  id: string; year: string; students: number; scholarships: number; granted: number; raised: number; donors: number;
  highlights: string[]; sample?: boolean;
};

export type Scholarship = { id: string; name: string; who: string; award: string; how: string; url: string };

export type Role = "superadmin" | "admin" | "accountant" | "user";
export type User = { id: string; name: string; email: string; role: Role; pass: string; createdAt: string };

export type Settings = { email: string; phone: string; address: string; schools: string[] };

export const categories: { id: Category; label: string }[] = [
  { id: "health", label: "Health" },
  { id: "safety", label: "Public safety" },
  { id: "trades", label: "Trades & transport" },
  { id: "tech", label: "Tech & media" },
  { id: "service", label: "Service & education" },
];

const at = (d: string) => new Date(d + "T10:00:00").toISOString();

export const seed = {
  settings: {
    email: "info@lctcfoundation.org",
    phone: "",
    address: "",
    schools: [], // Added by the Foundation in Admin → Settings
  } as Settings,

  programs: [
    { id: "p1", slug: "welding", name: "Welding", cat: "trades", icon: "🔥", image: "/assets/img/welding.jpg", length: "Two years",
      summary: "Students learn to cut, join and fabricate metal safely, from first bead to finished project.",
      learn: ["Shop safety and protective gear", "Common welding and cutting processes", "Reading drawings and symbols", "Building a finished project"],
      outcome: "Graduates head into apprenticeships, fabrication shops and further training.", sample: true },
    { id: "p2", slug: "health-careers", name: "Health careers", cat: "health", icon: "🩺", image: "/assets/img/nursing.jpg", length: "One to two years",
      summary: "Hands-on patient care training in a simulation lab, preparing students for entry-level health roles.",
      learn: ["Basic patient care", "Vital signs and safety", "Working on a care team", "Preparing for a state certification exam"],
      outcome: "Many students continue into nursing and other health programs.", sample: true },
    { id: "p3", slug: "culinary-arts", name: "Culinary arts", cat: "service", icon: "🍳", image: "/assets/img/culinary.jpg", length: "Two years",
      summary: "Cooking, baking and running a kitchen, with real service for real guests.",
      learn: ["Knife skills and kitchen safety", "Baking and pastry basics", "Menu planning and costing", "Catering and front-of-house service"],
      outcome: "Students leave ready for restaurant work, catering or culinary school.", sample: true },
    { id: "p4", slug: "construction", name: "Construction", cat: "trades", icon: "🔨", image: "/assets/img/construction.jpg", length: "Two years",
      summary: "Framing, measuring and building as a crew, with safety first on every job.",
      learn: ["Tool and site safety", "Measuring and layout", "Framing and finish work", "Working as a crew"],
      outcome: "A direct path into union apprenticeships and building trades.", sample: true },
    { id: "p5", slug: "cosmetology", name: "Cosmetology", cat: "service", icon: "✂️", image: "/assets/img/cosmetology.jpg", length: "Two years",
      summary: "Hair, skin and nail services in a working student salon.",
      learn: ["Sanitation and client safety", "Cutting, color and styling", "Nail and skin care", "Client service"],
      outcome: "Students build toward the hours needed for a state license.", sample: true },
    { id: "p6", slug: "automotive", name: "Automotive technology", cat: "trades", icon: "🔧", image: "/assets/img/auto.jpg", length: "Two years",
      summary: "Diagnosing and repairing real vehicles in a working shop.",
      learn: ["Shop and lift safety", "Brakes, steering and suspension", "Engine and electrical diagnosis", "Customer service and write-ups"],
      outcome: "Graduates move into dealership and independent shop roles.", sample: true },
  ] as Program[],

  events: [
    { id: "e1", slug: "fall-golf-outing-2026", title: "Fall Golf Outing", date: "2026-09-19", start: "8:00 AM", end: "2:00 PM", location: "To be announced",
      summary: "A morning on the course raising money for student tool kits.",
      body: "Join Foundation friends for nine holes, lunch and a raffle. Every foursome sponsors starter tool kits for first-year students.",
      image: "/assets/img/auto.jpg", capacity: 72, rsvpOpen: false, published: true, sample: true },
    { id: "e2", slug: "donor-reception-2026", title: "Fall Donor Reception", date: "2026-11-05", start: "5:30 PM", end: "7:30 PM", location: "To be announced",
      summary: "An evening with students, instructors and the donors who back them.",
      body: "Meet the students your gifts support, see their work up close and hear what comes next for them. Light food is prepared and served by culinary students.",
      image: "/assets/img/catering.jpg", capacity: 120, rsvpOpen: true, published: true, sample: true },
    { id: "e3", slug: "tools-for-tomorrow-drive", title: "Tools for Tomorrow Drive", date: "2026-11-21", start: "9:00 AM", end: "1:00 PM", location: "To be announced",
      summary: "Drop off new or gently used tools for students who need them.",
      body: "Bring hand tools, safety gear or equipment in good working order. Volunteers sort everything into kits for students starting their programs.",
      image: "/assets/img/welder-shop.jpg", capacity: 0, rsvpOpen: true, published: true, sample: true },
    { id: "e4", slug: "scholarship-awards-night-2027", title: "Scholarship Awards Night", date: "2027-05-13", start: "6:00 PM", end: "8:00 PM", location: "To be announced",
      summary: "Celebrating the year's scholarship and grant recipients with their families.",
      body: "Recipients, families, donors and instructors come together to celebrate a year of hard work.",
      image: "/assets/img/graduates.jpg", capacity: 200, rsvpOpen: true, published: true, sample: true },
  ] as FoundationEvent[],

  rsvps: [
    { id: "r1", eventId: "e2", name: "Sample Guest", email: "guest@example.com", guests: 2, note: "", createdAt: at("2026-10-10"), sample: true },
  ] as Rsvp[],

  posts: [
    { id: "b1", slug: "golf-outing-recap-2026", title: "Golf Outing recap: tool kits on the way", date: "2026-09-24", author: "Foundation staff", eventId: "e1",
      excerpt: "A sample recap post. Replace it with the real story from your event.",
      body: "This is a sample blog post linked to the Fall Golf Outing event. Admins can write a post like this after any event from the dashboard.\n\n## What happened\nDescribe the day, who came and what was raised.\n\n## What it means for students\nTell readers how the money will be used.",
      image: "/assets/img/auto.jpg", published: true, sample: true },
    { id: "b9", slug: "golf-outing-photos-and-thanks", title: "Golf Outing: photos and thank-yous", date: "2026-09-22", author: "Foundation staff", eventId: "e1",
      excerpt: "A sample thank-you post for sponsors, golfers and volunteers. Swap in real photos from the day.",
      body: "This is a sample post linked to the Fall Golf Outing. Use a post like this to thank everyone who came out.\n\n## Thank you, sponsors\nList the hole sponsors and foursomes who made the day possible.\n\n## Thank you, volunteers\nName the people who ran check-in, the raffle and lunch.\n\n## See you next year\nShare the date for next year's outing once it is set.",
      image: "/assets/img/sparks.jpg", published: true, sample: true },
    { id: "b2", slug: "save-the-date-fall-donor-reception", title: "Save the date: Fall Donor Reception", date: "2026-10-14", author: "Foundation staff", eventId: "e2",
      excerpt: "Meet the students your gifts support, with food made and served by our culinary students.",
      body: "Our Fall Donor Reception is coming up, and we would love to see you there.\n\n## What to expect\n- Short talks from students and instructors\n- Student work on display from several programs\n- Light food prepared and served by culinary students\n\n## How to come\nRSVP from the event page so we can plan food and seating. Guests are welcome.",
      image: "/assets/img/catering.jpg", published: true, sample: true },
    { id: "b3", slug: "what-goes-in-a-starter-tool-kit", title: "What goes in a starter tool kit?", date: "2026-10-06", author: "Foundation staff", eventId: "e3",
      excerpt: "A look at the basic kit a first-year student needs, and how donated tools fill the gaps.",
      body: "Many programs ask students to bring their own basic tools. For some families that cost is the hardest part of getting started.\n\n## A typical kit\n- Safety glasses, gloves and hearing protection\n- A tape measure, square and utility knife\n- Program-specific hand tools chosen by instructors\n\n## How you can help\nBring new or gently used tools to the Tools for Tomorrow Drive, or give to the Tools & Equipment fund online.",
      image: "/assets/img/welder-shop.jpg", published: true, sample: true },
    { id: "b4", slug: "how-scholarships-are-chosen", title: "How our scholarships are chosen", date: "2026-09-30", author: "Foundation staff", eventId: "",
      excerpt: "A plain-language walk through the application, review and award process.",
      body: "Every year students apply for Foundation scholarships and grants. Here is how the process works.\n\n## Applying\nStudents fill out one online form. It asks about their program, their goals and what the money would cover.\n\n## Review\nA volunteer committee reads each application. Names are kept private from donors.\n\n## Awards\nRecipients are notified in the spring and celebrated at Scholarship Awards Night.",
      image: "/assets/img/graduates.jpg", published: true, sample: true },
    { id: "b5", slug: "a-day-in-the-simulation-lab", title: "A day in the simulation lab", date: "2026-09-12", author: "Foundation staff", eventId: "",
      excerpt: "Health careers students practice patient care long before they meet a real patient.",
      body: "This is a sample feature story. Replace it with a real student profile.\n\n## Practice first\nStudents rehearse taking vital signs, moving patients safely and working as a team, all in a lab built to feel like a real care setting.\n\n## Where donations help\nGifts to the Foundation help cover uniforms, exam fees and lab supplies.",
      image: "/assets/img/nurse-sim.jpg", published: true, sample: true },
    { id: "b6", slug: "alumni-spotlight-from-shop-to-apprenticeship", title: "Alumni spotlight: from the shop to an apprenticeship", date: "2026-08-28", author: "Foundation staff", eventId: "",
      excerpt: "A sample alumni story about turning a high school program into a career.",
      body: "This is a sample alumni spotlight. Swap in a real story from the Alumni page once graduates share theirs.\n\n## Getting started\nDescribe how the student found their program and what kept them going.\n\n## Where they are now\nShare their current job, apprenticeship or school, and what they would tell new students.",
      image: "/assets/img/welding.jpg", published: true, sample: true },
    { id: "b7", slug: "five-ways-to-support-students-this-year", title: "Five ways to support students this year", date: "2026-08-15", author: "Foundation staff", eventId: "",
      excerpt: "Giving money is one way. Here are four more.",
      body: "There are many ways to back career and technical students.\n\n## Ways to help\n- Give once or monthly to the fund you care about most\n- Donate tools or equipment at our drives\n- Volunteer at events\n- Mentor a student in your field\n- Tell a friend or employer about the Foundation",
      image: "/assets/img/mentoring.jpg", published: true, sample: true },
    { id: "b8", slug: "welcome-to-the-foundation-blog", title: "Welcome to the Foundation blog", date: "2026-08-01", author: "Foundation staff", eventId: "",
      excerpt: "News, event recaps and student stories, all in one place.",
      body: "Welcome to our new blog. This is where we will share what is happening at the Foundation.\n\n## What you will find here\n- Recaps after every Foundation event\n- Student and alumni stories\n- Updates on scholarships and yearly results\n\nSubscribe from the Events page to hear about new events first.",
      image: "/assets/img/laptops.jpg", published: true, sample: true },
  ] as Post[],

  subscribers: [
    { id: "s1", email: "subscriber@example.com", name: "", createdAt: at("2026-10-01"), sample: true },
  ] as Subscriber[],

  donations: [
    { id: "d1", receipt: "LCTC-SAMPLE1", name: "Sample Donor", email: "donor@example.com", amount: 100, freq: "once", fund: "Scholarships", card: "Visa ending 4242", createdAt: at("2026-10-02"), sample: true },
    { id: "d2", receipt: "LCTC-SAMPLE2", name: "Sample Monthly Donor", email: "monthly@example.com", amount: 25, freq: "monthly", fund: "Tools & Equipment", card: "Mastercard ending 4444", createdAt: at("2026-10-08"), sample: true },
  ] as Donation[],

  applications: [] as StoredApplication[],

  messages: [
    { id: "m1", name: "Sample Visitor", email: "visitor@example.com", topic: "Volunteering", message: "This is a sample message so you can see how contact form submissions appear.", status: "New", createdAt: at("2026-10-12"), sample: true },
  ] as Message[],

  board: [
    { id: "bm1", name: "Name to be added", role: "Board Chair", bio: "Add a short bio from the admin dashboard.", photo: "", order: 1, sample: true },
    { id: "bm2", name: "Name to be added", role: "Vice Chair", bio: "", photo: "", order: 2, sample: true },
    { id: "bm3", name: "Name to be added", role: "Treasurer", bio: "", photo: "", order: 3, sample: true },
    { id: "bm4", name: "Name to be added", role: "Secretary", bio: "", photo: "", order: 4, sample: true },
  ] as BoardMember[],

  alumni: [
    { id: "a1", name: "Sample Alum", email: "", program: "Welding", year: "2022", now: "Apprentice welder",
      story: "A sample alumni story. Approve real submissions from the dashboard and remove this one.", photo: "", published: true, createdAt: at("2026-09-01"), sample: true },
  ] as Alum[],

  reports: [
    { id: "y1", year: "2024–25", students: 90, scholarships: 30, granted: 42000, raised: 61000, donors: 150,
      highlights: ["Sample figures for layout only. Replace them in Admin → Yearly reports."], sample: true },
    { id: "y2", year: "2025–26", students: 120, scholarships: 45, granted: 60000, raised: 85000, donors: 210,
      highlights: ["Sample figures for layout only. Replace them in Admin → Yearly reports.", "Add one line per highlight of the year."], sample: true },
  ] as YearReport[],

  scholarships: [] as Scholarship[],

  // Demo accounts, one per access level. Every password is "demo1234" (stored as sha256 of "email:password", see lib/auth.ts).
  users: [
    { id: "u1", name: "Demo Super Admin", email: "superadmin@lctc.demo", role: "superadmin", pass: "fb8fc2271323717e40b956ef6bcbe4e2e1bc8b1b07757687cbb03cd14dac90e8", createdAt: at("2026-10-01") },
    { id: "u2", name: "Demo Admin", email: "admin@lctc.demo", role: "admin", pass: "6eaeb4adf28d5a21f820b760dff8687c339d880c64faef90caa0061b4bbc34b1", createdAt: at("2026-10-01") },
    { id: "u3", name: "Demo Accountant", email: "accountant@lctc.demo", role: "accountant", pass: "9ea7ac2a7ac686d6a37e1a12aa3066323af27c92c1c73f9f4dfdad83daef2857", createdAt: at("2026-10-01") },
    { id: "u4", name: "Demo Member", email: "member@lctc.demo", role: "user", pass: "64cdc28ed5c7d79d23191a7b0b091d1df4aa1bd154f9ffa588ad214e5d23141c", createdAt: at("2026-10-01") },
  ] as User[],
};

export type DB = typeof seed;
export type CollectionKey = Exclude<keyof DB, "settings">;
