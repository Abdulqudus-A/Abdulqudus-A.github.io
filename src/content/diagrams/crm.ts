import type { DiagramDef } from "../../components/diagrams/Diagram";
import type { WalkStep } from "../../components/diagrams/DiagramWalkthrough";

// Sources for this file:
// - Roles, policies, hierarchy, promotion and commission logic: the CRM code.
// - The dealership (tenant) model and its enforcement in the policies: the
//   author's description of the multi-dealership version.

export const crmDiagram: DiagramDef = {
  width: 680,
  height: 252,
  label:
    "Architecture: the browser app signs in through auth and sends queries to a data API generated from the schema. Row policies in the database decide which rows of the tables each query can touch. Privileged actions and scheduled jobs run in server functions, which use the service role and reach the tables without passing through the policies.",
  nodes: {
    browser: { x: 12, y: 16, w: 112, label: "Browser app" },
    dataapi: { x: 160, y: 16, w: 92, label: "Data API" },
    policies: { x: 288, y: 16, w: 120, label: "Row policies" },
    tables: { x: 444, y: 16, w: 84, label: "Tables" },
    auth: { x: 12, y: 104, w: 64, label: "Auth" },
    cron: { x: 160, y: 192, w: 100, label: "Scheduler" },
    functions: { x: 296, y: 192, w: 148, label: "Server functions" },
  },
  edges: {
    toApi: { d: "M 124 38 H 152" },
    toPolicies: { d: "M 252 38 H 280" },
    toTables: { d: "M 408 38 H 436" },
    signin: { d: "M 44 68 V 96", both: true, label: "sign in", lx: 52, ly: 86, anchor: "start" },
    invoke: { d: "M 110 60 V 160 H 370 V 184", label: "privileged actions", lx: 235, ly: 152 },
    schedule: { d: "M 260 214 H 288" },
    bypass: { d: "M 444 214 H 486 V 68", label: "service role: no policies", lx: 496, ly: 150, anchor: "start" },
  },
};

export const crmSteps: WalkStep[] = [
  {
    title: "A consultant signs in",
    body: "Auth issues a token that identifies the person. It carries no role. The role is looked up in the database on every request, so a change takes effect at once.",
    active: ["browser", "auth"],
    edges: ["signin"],
  },
  {
    title: "They ask for customers",
    body: "The browser sends an ordinary query with the token. The policy on the customers table adds two conditions the browser never wrote: the row belongs to this consultant’s dealership, and this consultant owns it.",
    active: ["browser", "dataapi", "policies", "tables"],
    edges: ["toApi", "toPolicies", "toTables"],
  },
  {
    title: "An admin sees the dealership, and nothing beyond it",
    body: "The same query from an admin returns every customer in that dealership. The role comes from a separate roles table, checked by a database function, so nobody becomes an admin by editing their own profile.",
    active: ["browser", "dataapi", "policies", "tables"],
    edges: ["toApi", "toPolicies", "toTables"],
  },
  {
    title: "Another dealership asks for the same row",
    body: "An admin from a different dealership requests that customer by ID. The policy filters the row out and the query returns nothing. There is no error that would tell “not yours” apart from “does not exist”.",
    active: ["browser", "dataapi", "policies"],
    edges: ["toApi", "toPolicies"],
  },
  {
    title: "A server function skips the policies",
    body: "Creating a consultant, generating an invoice and calculating commissions run in server functions with the service role, which bypasses every policy. Each of those functions has to apply the dealership filter itself. This is the part of the system the policies do not protect.",
    active: ["browser", "functions", "tables"],
    edges: ["invoke", "bypass"],
  },
  {
    title: "Monday, 06:00: overrides are calculated",
    body: "A scheduled job totals last week’s sales for the recruits of each team leader and distributor, takes off VAT and applies the override rate for that person’s level. The result is written with an upsert keyed on the week and the person, so running the job twice changes nothing.",
    active: ["cron", "functions", "tables"],
    edges: ["schedule", "bypass"],
  },
];
