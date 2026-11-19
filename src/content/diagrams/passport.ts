import type { DiagramDef } from "../../components/diagrams/Diagram";
import type { WalkStep } from "../../components/diagrams/DiagramWalkthrough";

// This is a reference design. It is the author's own design for the problem of
// remote passport applications, informed by building such a platform. It does
// not describe that platform, and nothing here is taken from it.

export const passportDiagram: DiagramDef = {
  width: 680,
  height: 252,
  label:
    "Architecture: an applicant sends an application to the applications service, which takes payment through a payment provider and stores documents in a vault. An identity checks worker uses a face engine and the state's registry. Cases go to an officer desk, and approved applications go on to issuance.",
  nodes: {
    pay: { x: 132, y: 16, w: 124, label: "Payments", external: true },
    engine: { x: 280, y: 16, w: 152, label: "Face engine", external: true },
    app: { x: 12, y: 104, w: 96, label: "Applicant" },
    api: { x: 132, y: 104, w: 124, label: "Applications" },
    checks: { x: 280, y: 104, w: 152, label: "Identity checks" },
    desk: { x: 456, y: 104, w: 124, label: "Officer desk" },
    vault: { x: 120, y: 192, w: 148, label: "Document vault" },
    registry: { x: 280, y: 192, w: 152, label: "Registry", external: true },
    issue: { x: 456, y: 192, w: 124, label: "Issuance", external: true },
  },
  edges: {
    apply: { d: "M 108 126 H 124" },
    toChecks: { d: "M 256 126 H 272" },
    toDesk: { d: "M 432 126 H 448" },
    payEdge: { d: "M 194 96 V 68", both: true },
    engineEdge: { d: "M 356 96 V 68", both: true },
    toVault: { d: "M 194 148 V 184" },
    regEdge: { d: "M 356 156 V 184", both: true },
    toIssue: { d: "M 518 148 V 184" },
  },
};

export const passportSteps: WalkStep[] = [
  {
    title: "The applicant starts, stops and comes back",
    body: "They fill in part of the form on a phone and close it. The application stays in its draft state. Two days later they open it on a laptop and continue from the same step.",
    active: ["app", "api"],
    edges: ["apply"],
  },
  {
    title: "Documents and the passport photo",
    body: "Scans go to the vault. The photo is tested against the passport-photo standard while the applicant is still there to retake it, and the app says what is wrong, not just that something is.",
    active: ["app", "api", "vault"],
    edges: ["apply", "toVault"],
  },
  {
    title: "Payment is confirmed twice",
    body: "The provider confirms the payment, then sends the same confirmation again a minute later. The second one matches a payment already applied and changes nothing.",
    active: ["api", "pay"],
    edges: ["payEdge"],
  },
  {
    title: "Is this a live person?",
    body: "The server opens a liveness session and the applicant follows the prompts on camera. The result comes back signed, tied to that session, and is verified on the server. The app’s own opinion is ignored.",
    active: ["api", "checks", "engine"],
    edges: ["toChecks", "engineEdge"],
  },
  {
    title: "The face engine is down",
    body: "The comparison times out. The application stays in the state it was in, the check is queued to run again, and the applicant is told that nothing is lost. No decision is made without a score.",
    active: ["checks"],
    failed: ["engine"],
    edges: ["engineEdge"],
  },
  {
    title: "The face is compared with the record",
    body: "The live image is compared with the photograph on the citizen’s existing record. Ten years have passed since that photograph. The score lands in the uncertain band.",
    active: ["checks", "engine", "registry"],
    edges: ["engineEdge", "regEdge"],
  },
  {
    title: "An officer decides",
    body: "The officer sees both images side by side, the scores and the documents, and approves. The decision is added to the application’s log with their name and the time.",
    active: ["checks", "desk"],
    edges: ["toDesk"],
  },
  {
    title: "Issuance, and the clock on the raw images",
    body: "The approved application goes to production. The decision and its evidence trail are kept. The raw scans and face images start their countdown to deletion.",
    active: ["desk", "issue", "vault"],
    edges: ["toIssue"],
  },
];
