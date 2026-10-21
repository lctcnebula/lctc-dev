// Fixed site content. Everything the Foundation edits day to day (events, blog, programs,
// board, alumni, yearly reports, contact details) lives in the admin dashboard instead: see lib/seed.ts.

export const site = {
  name: "Lake County Tech Campus Foundation",
  short: "LCTC Foundation",
  tagline: "Skills. Success. Future.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://lctc-dev.vercel.app",
};
// Email, phone, address and member schools are edited in Admin → Settings (see lib/seed.ts).

export const money = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

export const slides = [
  { src: "/assets/img/welding.jpg", caption: "Welding", alt: "A welding student in a helmet working at a bench as sparks fly", w: 1024, h: 683 },
  { src: "/assets/img/nursing.jpg", caption: "Health careers", alt: "Nursing and EMT students smiling during a simulation exercise", w: 1024, h: 738 },
  { src: "/assets/img/culinary.jpg", caption: "Culinary arts", alt: "A culinary student in chef whites piping icing in a teaching kitchen", w: 1024, h: 683 },
  { src: "/assets/img/construction.jpg", caption: "Construction", alt: "Three students in hard hats measuring a wooden frame", w: 1024, h: 683 },
  { src: "/assets/img/cosmetology.jpg", caption: "Cosmetology", alt: "Cosmetology students styling hair for guests", w: 1024, h: 683 },
];

export type GrantType = { id: string; name: string; icon: string; text: string };

export const grantTypes: GrantType[] = [
  { id: "scholarship", name: "Scholarship", icon: "🎓", text: "For graduating students heading to college, an apprenticeship or straight into the workforce." },
  { id: "tools", name: "Tools & equipment grant", icon: "🧰", text: "Starter kits, uniforms, protective gear and program supplies." },
  { id: "certification", name: "Certification fee grant", icon: "📜", text: "Exam and licensing fees for the industry certifications employers ask for." },
  { id: "fees", name: "Program fee assistance", icon: "🧾", text: "Help with Tech Campus course and lab fees." },
  { id: "emergency", name: "Emergency need", icon: "🤝", text: "Transportation, clothing or other urgent costs that could keep you from finishing." },
];

// Each type has its own preset amounts on the donate page; picking a type swaps the presets and
// selects its default. `name` is what gets saved on the donation record (Admin → Donations → Fund).
// Apart from "General" and "In honor or memory", the types are the Foundation's four pillars.
export type DonationType = { slug: string; name: string; icon: string; text: string; presets: number[]; default: number };

export const donationTypes: DonationType[] = [
  { slug: "general", name: "General donation", icon: "💙", text: "Goes wherever students need it most across all four pillars.", presets: [25, 50, 100, 250, 500, 1000], default: 50 },
  { slug: "scholarships", name: "Student Scholarships", icon: "🎓", text: "Seeds post-secondary scholarships so graduates can take their next step into college or training.", presets: [25, 100, 250, 500, 1000, 2500], default: 250 },
  { slug: "credentials", name: "Credentials & Certifications", icon: "📜", text: "Safety credentials, state board exams, fingerprinting and licensing fees.", presets: [50, 100, 200, 300, 500, 1000], default: 200 },
  { slug: "experiences", name: "Professional Learning Experiences", icon: "🤝", text: "Work-based learning stipends, industry clothing, career field trips and SkillsUSA competitions.", presets: [100, 300, 500, 1100, 1500, 3000], default: 500 },
  { slug: "innovation", name: "Programmatic Innovation", icon: "🛠️", text: "Student toolkits, lab equipment, curriculum and new pathways that keep programs current.", presets: [500, 1000, 2500, 5000, 10000, 25000], default: 1000 },
  { slug: "tribute", name: "In honor or memory", icon: "🕊️", text: "Give in someone's name. Tell us who in the note on your receipt email.", presets: [25, 50, 100, 250, 500, 1000], default: 100 },
];

// Fund names used by older links and saved gifts, mapped to the type that replaced them.
export const legacyFunds: Record<string, string> = {
  "Where it's needed most": "general", "Student grants": "general", "Scholarships": "scholarships",
  "Certifications": "credentials", "Tools & Equipment": "innovation",
};

export const findDonationType = (key: string | null) =>
  donationTypes.find(t => t.slug === key || t.name === key) ?? donationTypes.find(t => t.slug === legacyFunds[key ?? ""]);

export const mission = "To empower Lake County Tech Campus students with the confidence, skills, real-world experiences, and industry-recognized credentials necessary to pursue higher education, enter the workforce, and successfully build their futures.";

export const campusFacts = [
  { value: "18", label: "member school districts" },
  { value: "19", label: "career & technical programs" },
  { value: "2,100+", label: "students served" },
  { value: "2", label: "counties: Lake and McHenry" },
];

export const pillars = [
  { icon: "🤝", name: "Professional Learning Experiences", type: "experiences", text: "Work-based learning, employer connections and career exploration." },
  { icon: "🛠️", name: "Programmatic Innovation", type: "innovation", text: "Equipment, curriculum and learning opportunities that respond to changing careers." },
  { icon: "📜", name: "Credentials & Certifications", type: "credentials", text: "Certifications and exams that help students show job-ready skills." },
  { icon: "🎓", name: "Student Scholarships", type: "scholarships", text: "Scholarships and help with eligible fees, supplies and career experiences." },
];

export type GivingTier = { name: string; amount: number; item: string; impact: string; type: string };

export const tiersFor = (type: string) => givingTiers.filter(t => t.type === type);

// "Student Level Giving Tiers" from the CTE Month campaign. Each "Give" button opens the donate page
// with the matching type and amount preselected.
export const givingTiers: GivingTier[] = [
  { name: "The Expo Gate", amount: 25, item: "Career Expo registration fee", type: "scholarships", impact: "100% of this registration fee goes into a dedicated fund that seeds post-secondary student scholarships." },
  { name: "The Certification Spark", amount: 50, item: "Student certification", type: "credentials", impact: "Gives a student their baseline safety credential, unlocking a live construction site, automotive bay or manufacturing floor." },
  { name: "Professional First Impression", amount: 100, item: "Industry clothing", type: "experiences", impact: "A student shows up to on-the-job training looking like a professional, with no out-of-pocket clothing cost." },
  { name: "The Lifesaver Credential", amount: 200, item: "State board exam voucher", type: "credentials", impact: "Pays for high-stakes state board testing, fingerprinting and licensing fees." },
  { name: "The Competitor Entry", amount: 300, item: "SkillsUSA competition package", type: "experiences", impact: "Covers state or national competition entry, travel and leadership workshop materials for a student representing Tech Campus." },
  { name: "The Toolkit", amount: 500, item: "Complete professional student toolkit", type: "innovation", impact: "Tools a student keeps after graduation: cosmetology shears, a culinary knife roll or an automotive wrench set." },
  { name: "The Workforce Bridge", amount: 500, item: "Give Me Ten + TECH 50 work-based learning", type: "experiences", impact: "A stipend for a student who completes an off-campus internship." },
  { name: "The Launch a Student Bundle", amount: 1100, item: "All-inclusive individual success package", type: "general", impact: "Sponsors one student's entire year at Tech Campus: student fees, work-based learning, toolkit and certifications." },
  { name: "The 'Next Step' Field Trip", amount: 1500, item: "Career exploration trip", type: "experiences", impact: "Takes 42 students to a career site or post-secondary training option, covering travel and food for students and staff." },
];

export const majorGift = {
  name: "The Innovation Catalyst", amount: 10000, text: "Major gifts move opportunities from ideas to reality.",
  areas: [
    { name: "Equip", sub: "Capital equipment", text: "Modern tools, technology and equipment so students learn on industry-relevant resources." },
    { name: "Expand", sub: "High-demand programs", text: "Expanded labs, certification opportunities and programs aligned with employer needs." },
    { name: "Create", sub: "What comes next", text: "New curriculum, academic pathways and scholarship opportunities for students' next step." },
  ],
};

// What donor gifts fund in each program area, from the Foundation's "Meet the Mission" presentation.
export const programImpact = [
  { name: "Automotive Service & Collision Repair", text: "Computer diagnostic systems, professional frame-straightening supplies, specialized shop tooling and vehicle restoration showcases." },
  { name: "Cybersecurity", text: "Network threat containment switches, firewall testing environments and live ethical hacking competitions." },
  { name: "Certified Nurse & Medical Assisting", text: "Hospital-grade patient simulators, phlebotomy training models, sterile surgical tray kits and clinical rotation sponsorships." },
  { name: "Welding/Fabrication & Industrial Technology", text: "Multi-process welding machines, structural steel credentials and workforce-bridge stipends for student apprentices." },
  { name: "Early Education & Teaching", text: "On-campus preschool lab programs, early-childhood curricula and completion grants for state credentials." },
  { name: "Culinary Arts", text: "Commercial pastry equipment, safety and sanitation credentials and scholarships into hospitality programs." },
  { name: "EMS & Firefighting", text: "Pediatric trauma simulators, first responder licensing exams and pathways into public safety and paramedic programs." },
  { name: "Game Programming, Virtualization & Multimedia", text: "Developer workstations, student industry portfolios and creative media showcases." },
  { name: "Construction Skills & Management", text: "Commercial framing tools and safety equipment, OSHA certification fees and industry mentoring networks." },
];

// T.E.C.H. Industry Partner Roadmap: four stages a business can move through with Tech Campus.
export const partnerRoadmap = [
  { letter: "T", name: "Teach", sub: "Making connections", steps: ["Follow us on social media", "Subscribe to Tech Campus's monthly newsletter", "Tour Tech Campus", "Introduce your company and services to our team", "Join our industry contact network"] },
  { letter: "E", name: "Establish", sub: "Industry visibility", steps: ["Share employment opportunities", "Attend our Celebration of Partnership event", "Join an advisory board", "Be a guest or panel speaker", "Mentor a program team-based challenge"] },
  { letter: "C", name: "Commit", sub: "Build future talent", steps: ["Run resume and interview workshops", "Sponsor workplace tours", "Provide program technical training", "Host a Give Me Ten + TECH 50 training site (60 hours)", "Attend the annual Career Expo"] },
  { letter: "H", name: "Honor", sub: "Share in student success", steps: ["Invest in program innovations", "Provide certifications and credentials", "Show ongoing support", "Equip students with industry tools", "Fund scholarships"] },
];

export const photoCredits = [
  { text: "Welding, culinary, cosmetology, nursing and EMT photos", by: "COD Newsroom (College of DuPage)", byUrl: "https://www.flickr.com/photos/41431665@N07", license: "CC BY 2.0" },
  { text: "Graduates", by: "breezy421", byUrl: "https://www.flickr.com/photos/60202180@N00/152285899", license: "CC BY 2.0" },
  { text: "Culinary event", by: "VIUDeepBay", byUrl: "https://www.flickr.com/photos/44080391@N07/5401734615", license: "CC BY 2.0" },
  { text: "Carpentry and auto", by: "USDA Forest Service, Pacific Northwest Region", byUrl: "https://www.flickr.com/photos/135886671@N08", license: "public domain" },
  { text: "Mentoring and laptops", by: "U.S. Army Cyber Command", byUrl: "https://www.flickr.com/photos/131622585@N06", license: "public domain" },
];
