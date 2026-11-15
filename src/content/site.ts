// All copy on the site lives here so it can be edited without touching markup.
// Rule for this file: every number and every named client must be something
// that can be sourced and explained in an interview.

export const profile = {
  name: "Abdulqudus Aremu",
  role: "Senior Software Engineer",
  employer: "Seamfix",
  location: "Lagos, Nigeria",
  timezone: "UTC+1",
  experience: "4 years in backend engineering",
  status: "Open to remote and contract backend work",
  email: "aremuabdulquduz@gmail.com",
  links: {
    github: "https://github.com/Abdulqudus-A",
    linkedin: "https://www.linkedin.com/in/abdulqudus-aremu",
    calendar: "https://calendly.com/aremuabdulquduz",
  },
};

export const headline = "I build the systems that decide whether a SIM card gets activated.";

export const lede = [
  "At Seamfix I work on the SIM-registration and identity platform used by telcos including Globacom, MTN Côte d’Ivoire and Lebara. The systems I have delivered there have processed more than 50 million registrations for over 27 million subscribers.",
  "Before a line goes live, the platform has to answer three questions: who is this person, have we registered them before, and what happens when a dependency does not answer. Most of my work sits inside those three questions.",
];

export const glance: { label: string; value: string }[] = [
  { label: "Registrations processed", value: "50M+" },
  { label: "Subscribers", value: "27M+" },
  { label: "Operators", value: "Globacom · MTN Côte d’Ivoire · Lebara" },
  { label: "Since Jan 2024", value: "16 repositories · 500+ pull requests · 100+ delivery tickets" },
];

export type Work = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  // Set to true once the case study page exists; the title becomes a link.
  published: boolean;
};

export const selectedWork: Work[] = [
  {
    slug: "checkpoint-recovery",
    title: "A job that survives its worker",
    summary:
      "A distributed task queue on RabbitMQ and Bull with checkpoint recovery and idempotent handlers. It processes hundreds of thousands of records a day across horizontally scaled workers, and cut SIM-registration downtime by half.",
    tags: ["Queues", "Idempotency", "RabbitMQ · Bull"],
    published: false,
  },
  {
    slug: "single-session",
    title: "One account, one session",
    summary:
      "Single-session sign-on, built once in the auth service and rolled out to more than eight platform microservices and the product front-ends, instead of being rebuilt per product.",
    tags: ["Auth", "8+ services"],
    published: false,
  },
  {
    slug: "sim-swap-blocking",
    title: "Blocking the fraudulent SIM swap",
    summary:
      "SIM-swap validation and a blocking module that locks a number after a rejected or abandoned swap, delivered across the backend, the review service and the UI.",
    tags: ["Fraud", "Globacom"],
    published: false,
  },
  {
    slug: "govsmart-epassport",
    title: "A passport without the embassy visit",
    summary:
      "GovSmart, a fully remote e-passport platform for Benin’s Ministry of Foreign Affairs. Facial recognition, liveness detection and similarity scoring let citizens abroad apply without visiting an embassy.",
    tags: ["Identity", "Benin"],
    published: false,
  },
];

export const alsoShipped: string[] = [
  "Certify: a multi-tenant platform that digitises and verifies academic records for four Nigerian universities.",
  "Corporate registration for Globacom, single and bulk, including parent and child structures.",
  "Mobile number portability, including eSIM.",
  "ANIP identity verification: match scoring, ICAO validation and video match.",
  "Device blacklist, whitelist and quarantine pool (with one other engineer).",
];

export const record: { period: string; org: string; role: string; place: string; note: string }[] = [
  {
    period: "2023 – present",
    org: "Seamfix",
    role: "Senior Software Engineer",
    place: "Lagos, Nigeria",
    note: "SIM-registration, identity-verification and national-ID systems for telcos and government programmes.",
  },
  {
    period: "Oct 2025 – Mar 2026",
    org: "RocketDevs",
    role: "Senior Software Engineer (contract)",
    place: "Remote · San Francisco",
    note: "Workflow-automation tools that removed manual bottlenecks in business operations.",
  },
];

export const education = {
  degree: "B.Eng, Electrical & Electronics Engineering",
  honours: "First-Class Honours",
  school: "Kwara State University",
};

export const sideProjects: { name: string; role: string; note: string; url: string; host: string }[] = [
  {
    name: "Reavil",
    role: "Founder",
    note: "Feedback intelligence for product teams: it reads user feedback and surfaces what frustrates users.",
    url: "https://reavil.io",
    host: "reavil.io",
  },
  {
    name: "AgroHQ",
    role: "CTO",
    note: "A UK-based agritech platform, architected and built from the ground up.",
    url: "https://theagrohq.com",
    host: "theagrohq.com",
  },
];
