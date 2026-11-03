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

export type Freq = "once" | "monthly" | "yearly";
export const frequencies: Record<Freq, { label: string; adj: string; per: string; short: string }> = {
  once: { label: "One-time", adj: "one-time", per: "", short: "" },
  monthly: { label: "Monthly", adj: "monthly", per: " / month", short: "/mo" },
  yearly: { label: "Yearly", adj: "yearly", per: " / year", short: "/yr" },
};

export type Donation = {
  id: string; receipt: string; name: string; email: string; amount: number; freq: Freq;
  fund: string; tier?: string; card: string; createdAt: string; sample?: boolean;
};

export type StoredApplication = Application & { status: string; sample?: boolean };

export type Message = { id: string; name: string; email: string; topic: string; message: string; status: string; createdAt: string; sample?: boolean };

// slug, company and the website/social links were added later, so members saved before then may not have them (see boardSlug).
export type BoardMember = {
  id: string; slug?: string; name: string; role: string; company?: string; bio: string; photo: string;
  website?: string; linkedin?: string; facebook?: string; instagram?: string; x?: string; order: number; sample?: boolean;
};

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
    phone: "847-543-6040",
    address: "19525 W Washington St, Grayslake, IL 60030",
    schools: [], // Added by the Foundation in Admin → Settings
  } as Settings,

  programs: [
    // The Tech Campus programs. Descriptions are based on the Tech Campus program pages; the Foundation edits them in Admin → Programs.
    { id: "pr1", slug: "automotive-collision-repair", name: "Automotive Collision Repair", cat: "trades", icon: "🚗", image: "/assets/img/auto.jpg", length: "Two years",
      summary: "Bringing damaged vehicles back to factory condition through bodywork, welding and refinishing, then moving into estimating and shop work.",
      learn: ["Sheet metal damage repair", "MIG welding and body alignment", "Paint, refinishing and color matching", "Damage estimating and shop management"],
      outcome: "Students can earn 3 College of Lake County credits plus I-CAR and SP2 certifications, leading to body shop, paint and insurance estimating jobs.", sample: true },
    { id: "pr2", slug: "automotive-service", name: "Automotive Service", cat: "trades", icon: "🔧", image: "/assets/img/auto.jpg", length: "Two years",
      summary: "Training to work as an automotive technician, built around four core repair areas with chances for paid dealership internships.",
      learn: ["Brakes", "Steering and suspension", "Electrical systems", "Engine performance"],
      outcome: "Students can earn 4 College of Lake County credits and are prepared to sit for ASE certification exams, opening technician and service writer roles.", sample: true },
    { id: "pr3", slug: "biomedical-science", name: "Biomedical Science", cat: "health", icon: "🧬", image: "/assets/img/nurse-sim.jpg", length: "",
      summary: "Hands-on biology and medicine, using real lab and clinical techniques to study body systems and solve medical cases.",
      learn: ["Lab techniques like gram staining", "Human body systems", "Clinical tests like EKG and spirometry", "Organ dissections and case studies"],
      outcome: "Students can earn 6 college credits from Missouri University of Science and Technology and CPR certification, a start toward research and health science careers.", sample: true },
    { id: "pr4", slug: "certified-nurse-assisting", name: "Certified Nurse Assisting", cat: "health", icon: "🩺", image: "/assets/img/nursing.jpg", length: "",
      summary: "Basic nursing skills taught through class, lab practice and at least 42 clinical hours at local care facilities.",
      learn: ["Caring for patients", "Observing and reporting", "Common diseases and health problems", "Supporting recovery and disability"],
      outcome: "Students can earn 7 College of Lake County credits and qualify for the state nurse assistant exam, a step toward CNA work and nursing school.", sample: true },
    { id: "pr5", slug: "construction-skills-management", name: "Construction Skills & Management", cat: "trades", icon: "🔨", image: "/assets/img/construction.jpg", length: "Two years",
      summary: "Building projects across the trades in year one, then planning, scheduling and building codes in year two.",
      learn: ["Carpentry, HVAC, electrical and plumbing", "Tool and job site safety", "Project planning and scheduling", "Building codes and OSHA rules"],
      outcome: "Students can earn 6 McHenry County College credits and safety certifications, with paths into the trades, estimating and construction management.", sample: true },
    { id: "pr6", slug: "cosmetology", name: "Cosmetology", cat: "service", icon: "✂️", image: "/assets/img/cosmetology.jpg", length: "Two years",
      summary: "Hair, skin and nail training, starting with theory in year one and serving real clients on the salon floor in year two.",
      learn: ["Hair cutting, color and styling", "Skin and nail services", "Working with salon clients", "Salon internship experience"],
      outcome: "Students complete the 1,500 hours needed to take the Illinois cosmetology licensing exam, leading to stylist, esthetician and salon careers.", sample: true },
    { id: "pr7", slug: "intro-criminal-justice-policing", name: "Introduction to Criminal Justice & Policing", cat: "safety", icon: "⚖️", image: "/assets/img/mentoring.jpg", length: "",
      summary: "How the justice system works from arrest to corrections, plus the history and role of policing in America.",
      learn: ["Courts, sentencing and corrections", "Police history and patrol work", "Mock trials", "Crime scene evidence collection"],
      outcome: "Students can earn 6 College of Lake County credits and CPR certification, a first step toward policing, corrections and law careers.", sample: true },
    { id: "pr8", slug: "culinary-arts", name: "Culinary Arts", cat: "service", icon: "🍳", image: "/assets/img/culinary.jpg", length: "Two years",
      summary: "Cooking, baking and hospitality skills, practiced by preparing food for events, competitions and the on-campus café.",
      learn: ["Kitchen safety and sanitation", "Knife skills and classic cooking", "Baking and pastry", "Menu planning and inventory"],
      outcome: "Students can earn 11 College of Lake County credits and ServSafe and Illinois food handler certifications, leading to restaurant, catering and hospitality jobs.", sample: true },
    { id: "pr9", slug: "cybersecurity", name: "Cybersecurity", cat: "tech", icon: "🛡️", image: "/assets/img/laptops.jpg", length: "",
      summary: "A beginner introduction to protecting devices, data and networks, and how attackers approach their targets.",
      learn: ["Online safety and privacy", "Securing computers and devices", "Networking basics", "Intro to C# programming"],
      outcome: "Students can earn 6 College of Lake County credits in Windows and Cisco networking, a foundation for IT support and security careers.", sample: true },
    { id: "pr10", slug: "early-education-teaching", name: "Early Education & Teaching", cat: "service", icon: "🧸", image: "/assets/img/mentoring.jpg", length: "Two years",
      summary: "Planning and leading activities for young children in the Tech Campus Preschool, with a focus on guiding behavior.",
      learn: ["How children develop", "Planning age-appropriate activities", "Guiding child behavior", "Child health, safety and nutrition"],
      outcome: "Students can earn 9 College of Lake County credits, CPR and Gateways ECE Level 1 credentials, leading to preschool and teaching careers.", sample: true },
    { id: "pr11", slug: "emergency-medical-services", name: "Emergency Medical Services", cat: "safety", icon: "🚑", image: "/assets/img/nurse-sim.jpg", length: "",
      summary: "EMT training for seniors, with ER clinical time and ride-alongs with local fire and EMS crews.",
      learn: ["Patient assessment", "Stabilizing injured and ill patients", "Healthcare provider CPR", "Anatomy for first responders"],
      outcome: "Students can earn 7 College of Lake County credits and prepare for the Illinois EMT-B license and national EMT certification.", sample: true },
    { id: "pr12", slug: "firefighting", name: "Firefighting", cat: "safety", icon: "🚒", image: "/assets/img/sparks.jpg", length: "",
      summary: "Core firefighter skills practiced through drills with ropes, ladders, hoses and a working fire engine.",
      learn: ["Fire chemistry and suppression", "Breathing apparatus and protective gear", "Forcible entry and ladders", "Search and rescue"],
      outcome: "Students can earn 3 College of Lake County credits plus CPR, FEMA ICS-100 and hazmat awareness certifications, preparing them for entry-level firefighting.", sample: true },
    { id: "pr13", slug: "game-programming-virtualization", name: "Game Programming & Virtualization", cat: "tech", icon: "🎮", image: "/assets/img/laptops.jpg", length: "",
      summary: "Programming fundamentals that lead into designing video games, 3D animation and virtual reality projects.",
      learn: ["Programming basics", "Designing a game from scratch", "3D characters and animation", "Virtual reality tools"],
      outcome: "Students can earn 3 College of Lake County credits, a start toward game design, app development and programming careers.", sample: true },
    { id: "pr14", slug: "industrial-technology", name: "Industrial Technology", cat: "trades", icon: "⚙️", image: "/assets/img/welder-shop.jpg", length: "",
      summary: "Maintaining, repairing and running industrial machinery, taught at the College of Lake County Advanced Technology Center.",
      learn: ["Hydraulics and pneumatics", "Electrical systems and wiring", "Mechanical drives and alignment", "Preventive maintenance"],
      outcome: "Students can earn up to 17 College of Lake County credits and a Mechanical Maintenance Technician Certificate, leading to manufacturing and maintenance jobs.", sample: true },
    { id: "pr15", slug: "criminal-justice-forensic-investigation", name: "Criminal Justice Careers & Forensic Investigation", cat: "safety", icon: "🔍", image: "/assets/img/laptops.jpg", length: "",
      summary: "Exploring careers across law enforcement, courts and corrections, plus the science of handling crime scene evidence.",
      learn: ["Criminal justice career paths", "Finding and preserving evidence", "Mock trials", "Police tactical response"],
      outcome: "Students can earn 6 College of Lake County credits plus CPR and NIMS certifications, a start toward police, investigation and federal agency careers.", sample: true },
    { id: "pr16", slug: "medical-assisting", name: "Medical Assisting", cat: "health", icon: "💉", image: "/assets/img/nursing.jpg", length: "One year",
      summary: "Front office and clinical training for medical settings, from greeting patients to drawing blood and running EKGs.",
      learn: ["Vital signs and injections", "Blood draws and EKGs", "Medical terminology", "Office and billing procedures"],
      outcome: "Students can earn 11 College of Lake County credits plus CPR and Healthcare Office Assistant certifications, leading to medical assistant and clinic roles.", sample: true },
    { id: "pr17", slug: "multimedia", name: "Multimedia", cat: "tech", icon: "🎬", image: "/assets/img/laptops.jpg", length: "Two years",
      summary: "Graphic and web design in year one, then video editing and 2D animation in year two.",
      learn: ["Adobe Photoshop, Illustrator and InDesign", "Website design basics", "Video capture and editing", "2D animation and storyboarding"],
      outcome: "Students can earn 3 McHenry County College credits and Adobe certification, leading to design, animation and video careers.", sample: true },
    { id: "pr18", slug: "welding-fabrication", name: "Welding/Fabrication", cat: "trades", icon: "🔥", image: "/assets/img/welding.jpg", length: "Two years",
      summary: "Practice in many welding and cutting methods, used to lay out and build a range of metal projects.",
      learn: ["Stick, MIG and TIG welding", "Oxy-fuel and plasma cutting", "Blueprint reading and weld symbols", "Layout and fit-up"],
      outcome: "Students can earn 9 College of Lake County credits plus AWS and General Welding certifications, leading to welding and fabrication jobs.", sample: true },
  ] as Program[],

  events: [
    { id: "e-mtm-oct", slug: "meet-the-mission-october-2026", title: "Meet the Mission", date: "2026-10-22", start: "9:30 AM", end: "11:00 AM", location: "Lake County Tech Campus, 19525 W Washington St, Grayslake, IL 60030",
      summary: "Discover how the Foundation serves our students and community. Donuts and coffee available.",
      body: "Join us for a morning at Tech Campus.\n\n## What to expect\n- Campus tours\n- A brief presentation on the Foundation's mission\n- Q&A with Foundation board members\n- Networking\n\nDonuts and coffee are available.",
      image: "/assets/img/welder-shop.jpg", capacity: 0, rsvpOpen: true, published: true },
    { id: "e-mtm-nov", slug: "meet-the-mission-november-2026", title: "Meet the Mission", date: "2026-11-12", start: "5:00 PM", end: "", location: "Lake County Tech Campus, 19525 W Washington St, Grayslake, IL 60030",
      summary: "An evening Meet the Mission meeting for business and community leaders ahead of the February 2027 CTE Month campaign.",
      body: "Between now and January 2027 the Foundation is hosting a series of Meet the Mission meetings to connect directly with business and community leaders as we prepare for our inaugural funding campaign during National CTE Month in February 2027.\n\n## What to expect\n- How the Foundation supports students across its four pillars\n- Student highlights\n- Q&A with Foundation board members",
      image: "/assets/img/mentoring.jpg", capacity: 0, rsvpOpen: true, published: true },
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
    { id: "d1", receipt: "LCTC-SAMPLE1", name: "Sample Donor", email: "donor@example.com", amount: 100, freq: "once", fund: "Student Scholarships", card: "Visa ending 4242", createdAt: at("2026-10-02"), sample: true },
    { id: "d2", receipt: "LCTC-SAMPLE2", name: "Sample Monthly Donor", email: "monthly@example.com", amount: 25, freq: "monthly", fund: "Programmatic Innovation", card: "Mastercard ending 4444", createdAt: at("2026-10-08"), sample: true },
  ] as Donation[],

  applications: [] as StoredApplication[],

  messages: [
    { id: "m1", name: "Sample Visitor", email: "visitor@example.com", topic: "Volunteering", message: "This is a sample message so you can see how contact form submissions appear.", status: "New", createdAt: at("2026-10-12"), sample: true },
  ] as Message[],

  // From the Foundation's board photo (2026). Staff first, then volunteer board members A–Z.
  board: [
    { id: "bm-kapala", slug: "sebastian-kapala", name: "Dr. Sebastian Kapala", role: "LCTC Executive Director", bio: "Executive Director of Lake County Tech Campus.", company: "", linkedin: "", photo: "/assets/board/kapala.jpg", order: 1 },
    { id: "bm-hughes", slug: "joanne-hughes", name: "Joanne Hughes", role: "Chief Financial Officer / CSBO", bio: "Business manager and chief school business official for Lake County Tech Campus.", company: "", linkedin: "", photo: "/assets/board/hughes.jpg", order: 2 },
    { id: "bm-del-rio", slug: "elizabeth-del-rio", name: "Elizabeth Del Rio", role: "Foundation & Stakeholder Relations Officer", bio: "Oversees the Foundation and leads coordination with partners, stakeholders and community organizations.", company: "", linkedin: "", photo: "/assets/board/del-rio.jpg", order: 3 },
    { id: "bm-dickson", slug: "sue-dickson", name: "Sue Dickson", role: "Board Member", bio: "", company: "", linkedin: "", photo: "/assets/board/dickson.jpg", order: 4 },
    { id: "bm-doll", slug: "don-doll", name: "Don Doll", role: "Board Member", bio: "", company: "", linkedin: "", photo: "/assets/board/doll.jpg", order: 5 },
    { id: "bm-golwitzer", slug: "bettina-golwitzer", name: "Bettina Golwitzer", role: "Board Member", bio: "", company: "", linkedin: "", photo: "/assets/board/golwitzer.jpg", order: 6 },
    { id: "bm-harris", slug: "james-dean-harris", name: "James Dean Harris", role: "Board Member", bio: "", company: "", linkedin: "", photo: "/assets/board/harris.jpg", order: 7 },
    { id: "bm-kischer", slug: "leslie-kischer", name: "Leslie Kischer", role: "Board Member", bio: "", company: "", linkedin: "", photo: "/assets/board/kischer.jpg", order: 8 },
    { id: "bm-kleber", slug: "norm-kleber", name: "Norm Kleber", role: "Board Member", bio: "", company: "", linkedin: "", photo: "/assets/board/kleber.jpg", order: 9 },
    { id: "bm-maksimovic", slug: "dalibor-maksimovic", name: "Dalibor Maksimovic", role: "Board Member", bio: "", company: "", linkedin: "", photo: "/assets/board/maksimovic.jpg", order: 10 },
    { id: "bm-neal", slug: "tamika-neal", name: "Tamika Neal", role: "Board Member", bio: "", company: "", linkedin: "", photo: "/assets/board/neal.jpg", order: 11 },
    { id: "bm-obrien", slug: "john-obrien", name: "John O'Brien", role: "Board Member", bio: "", company: "", linkedin: "", photo: "/assets/board/obrien.jpg", order: 12 },
    { id: "bm-taques", slug: "carlos-taques", name: "Carlos Taques", role: "Board Member", bio: "", company: "", linkedin: "", photo: "/assets/board/taques.jpg", order: 13 },
    { id: "bm-torossy", slug: "vincent-torossy", name: "Vincent Torossy", role: "Board Member", bio: "", company: "", linkedin: "", photo: "/assets/board/torossy.jpg", order: 14 },
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
