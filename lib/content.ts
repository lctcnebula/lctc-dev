// Fixed site content. Everything the Foundation edits day to day (events, blog, programs,
// board, alumni, yearly reports, contact details) lives in the admin dashboard instead: see lib/seed.ts.

export const site = {
  name: "Lake County Tech Campus Foundation",
  short: "LCTC Foundation",
  tagline: "Skills. Success. Future.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://lctc-dev.vercel.app",
};
// Email, phone, address and member schools are edited in Admin → Settings (see lib/seed.ts).

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

export const photoCredits = [
  { text: "Welding, culinary, cosmetology, nursing and EMT photos", by: "COD Newsroom (College of DuPage)", byUrl: "https://www.flickr.com/photos/41431665@N07", license: "CC BY 2.0" },
  { text: "Graduates", by: "breezy421", byUrl: "https://www.flickr.com/photos/60202180@N00/152285899", license: "CC BY 2.0" },
  { text: "Culinary event", by: "VIUDeepBay", byUrl: "https://www.flickr.com/photos/44080391@N07/5401734615", license: "CC BY 2.0" },
  { text: "Carpentry and auto", by: "USDA Forest Service, Pacific Northwest Region", byUrl: "https://www.flickr.com/photos/135886671@N08", license: "public domain" },
  { text: "Mentoring and laptops", by: "U.S. Army Cyber Command", byUrl: "https://www.flickr.com/photos/131622585@N06", license: "public domain" },
];
