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

export const headline = "I build backend systems that millions of people use without noticing.";

export const lede = [
  "I’m a senior backend engineer at Seamfix. My work runs in production for telecom operators, a government ministry, universities and companies on three continents, and the largest of those systems serve more than 27 million people.",
  "Different domains, the same work: decide where the state lives, make every step safe to repeat, and plan for the dependency that will be down. Each system below is written up the way I would explain it to another engineer.",
];

// Results of my own work. Each one is explained in a design doc below.
export const figures: { label: string; value: string }[] = [
  { label: "Registration downtime, after the retry design", value: "−50%" },
  { label: "Services moved to one session model", value: "8+" },
  { label: "Pull requests across 16 repositories since 2024", value: "500+" },
];

export const facts: { label: string; value: string }[] = [
  { label: "Built for", value: "Mobile operators · a government ministry · four universities · eleven dealerships" },
  { label: "Reach", value: "Africa · Europe · North America" },
  { label: "Operators", value: "Globacom · MTN Côte d’Ivoire · Lebara" },
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
    slug: "end-to-end-registration",
    title: "One registration, end to end",
    summary:
      "How a SIM registration gets from an agent’s device to an active line. It is accepted in one request, then verified and activated on queues, with idempotent handlers, parked records and retries that resume at the step that failed. The pipeline handles hundreds of thousands of records a day, and this design cut registration downtime by half.",
    context: "Seamfix",
    tags: ["Queues", "Idempotency", "Identity"],
    published: true,
  },
  {
    slug: "single-session",
    title: "One account, one session",
    summary:
      "Single-session sign-on, built once in the auth service and rolled out to more than eight platform microservices and the product front-ends, instead of being rebuilt per product.",
    context: "Seamfix",
    tags: ["Auth", "8+ services"],
    published: true,
  },
  {
    slug: "remote-passport",
    title: "A passport application without the embassy",
    summary:
      "A reference design for taking passport applications from citizens abroad, entirely online: liveness the server can trust, a face comparison with three outcomes instead of two, and an officer deciding the cases the system will not decide alone.",
    context: "Reference design",
    tags: ["Identity", "Biometrics"],
    published: true,
  },
  {
    slug: "feedback-pipeline",
    title: "From raw feedback to a ranked list of problems",
    summary:
      "The pipeline behind Reavil. Each piece of user feedback is enriched and scored by a model, grouped with similar feedback by embedding similarity and ranked, so a product team sees its biggest problem first.",
    context: "Reavil",
    tags: ["AI pipeline", "Queues"],
    published: true,
  },
  {
    slug: "data-connectors",
    title: "Connectors that survive other people’s APIs",
    summary:
      "A reference design for loading marketing and ads data from many third-party platforms into one warehouse, so that one report can cover every source: pagination, rate limits, retries and schema changes on the other side.",
    context: "Reference design",
    tags: ["Data pipelines", "BigQuery"],
    published: true,
  },
  {
    slug: "multi-tenant-crm",
    title: "One database, many dealerships",
    summary:
      "A CRM for a direct-sales network. Eleven dealerships in three European countries share one Postgres database, and row-level security decides who can see what.",
    context: "Client work",
    tags: ["Multi-tenancy", "Postgres"],
    published: true,
  },
];

// "1.3" for the third doc in the list. Pages use this so the numbers follow the order above.
export function docNumber(slug: string): string {
  return `1.${designDocs.findIndex((d) => d.slug === slug) + 1}`;
}

export const alsoShipped: string[] = [
  "SIM-swap validation and a blocking module that locks a number after a rejected or abandoned swap.",
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
