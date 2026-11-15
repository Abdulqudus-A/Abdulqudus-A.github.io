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
    medium: "https://medium.com/@abdulqudusaremu",
  },
};

export const headline = "I build backend systems that stay correct when things fail.";

export const lede = [
  "Since 2023 that has meant identity and registration infrastructure at Seamfix, used by telcos including Globacom, MTN Côte d’Ivoire and Lebara and by government programmes in West Africa. The systems I have delivered there have processed more than 50 million registrations for over 27 million subscribers.",
  "The problems are the ones every high-volume system has: process each record once, know who is asking, and keep going when a worker crashes or a dependency does not answer. I have applied the same thinking to marketing-data pipelines into BigQuery and to the analysis pipeline behind an AI product.",
];

export const glance: { label: string; value: string }[] = [
  { label: "Registrations processed", value: "50M+" },
  { label: "Subscribers", value: "27M+" },
  { label: "Operators", value: "Globacom · MTN Côte d’Ivoire · Lebara" },
  { label: "Since Jan 2024", value: "16 repositories · 500+ pull requests · 100+ delivery tickets" },
];

// Each entry becomes a design doc: constraints, the design question, the
// architecture, the decisions and their alternatives, a failure walkthrough,
// and results.
export type DesignDoc = {
  slug: string;
  title: string;
  summary: string;
  context: string;
  tags: string[];
  // Set to true once the design doc page exists; the title becomes a link.
  published: boolean;
};

export const designDocs: DesignDoc[] = [
  {
    slug: "checkpoint-recovery",
    title: "A job that survives its worker",
    summary:
      "A distributed task queue on RabbitMQ and Bull with checkpoint recovery and idempotent handlers. It processes hundreds of thousands of records a day across horizontally scaled workers, and cut SIM-registration downtime by half.",
    context: "Seamfix",
    tags: ["Queues", "Idempotency"],
    published: false,
  },
  {
    slug: "single-session",
    title: "One account, one session",
    summary:
      "Single-session sign-on, built once in the auth service and rolled out to more than eight platform microservices and the product front-ends, instead of being rebuilt per product.",
    context: "Seamfix",
    tags: ["Auth", "8+ services"],
    published: false,
  },
  {
    slug: "feedback-pipeline",
    title: "From raw feedback to a ranked list of problems",
    summary:
      "The pipeline behind Reavil, which reads user feedback and surfaces what frustrates users so a product team can decide what to fix first.",
    context: "Reavil",
    tags: ["AI pipeline"],
    published: false,
  },
  {
    slug: "data-connectors",
    title: "Connectors that survive other people’s APIs",
    summary:
      "TypeScript and Node.js connectors that pull marketing and ads data from third-party platforms into BigQuery, handling authentication, pagination, rate limits, retries and schema changes on the other side.",
    context: "RocketDevs",
    tags: ["Data pipelines", "BigQuery"],
    published: false,
  },
];

export const alsoShipped: string[] = [
  "SIM-swap validation and a blocking module that locks a number after a rejected or abandoned swap.",
  "GovSmart: a fully remote e-passport platform for Benin’s Ministry of Foreign Affairs, with facial recognition, liveness detection and similarity scoring.",
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
    note: "Data connectors for a marketing-data platform: backend services that load third-party marketing and ads data into BigQuery.",
  },
];

export const education = {
  degree: "B.Eng, Electrical & Electronics Engineering",
  honours: "First-Class Honours",
  school: "Kwara State University",
};

// `role` is optional: leave it out to list a project without a title.
export const sideProjects: { name: string; role?: string; note: string; url: string; host: string }[] = [
  {
    name: "Reavil",
    note: "Feedback intelligence for product teams. I built the pipeline that reads user feedback and surfaces what frustrates users.",
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

// Titles must match the published posts exactly.
export const writing: { title: string; url: string }[] = [
  {
    title: "My code comments are not for humans anymore",
    url: "https://medium.com/@abdulqudusaremu/my-code-comments-are-not-for-humans-anymore-db58510852c1",
  },
  {
    title: "The silence after the request",
    url: "https://medium.com/@abdulqudusaremu/the-silence-after-the-request-646aee3a44cb",
  },
];

export const press: { outlet: string; title: string; url: string; date?: string }[] = [
  {
    outlet: "The Guardian Nigeria",
    title: "Why AI governance should begin with engineers, not regulators",
    url: "https://guardian.ng/technology/ai-governance-africa-engineers-regulators-abdulqudus-aremu/",
  },
];
