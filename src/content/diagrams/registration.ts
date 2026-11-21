import type { DiagramDef } from "../../components/diagrams/Diagram";
import type { WalkStep } from "../../components/diagrams/DiagramWalkthrough";

// Sources for this file:
// - The stages, the order they run in and how each one fails: the author's
//   work on the platform.
// - Deliberately left out: service and queue names, endpoints, partner system
//   names, business rules, thresholds, lock and retry timings.

export const registrationDiagram: DiagramDef = {
  width: 680,
  height: 252,
  label:
    "Architecture: an agent app sends a registration to an intake API, which stores it in the records and audit stores and queues it. A verification worker checks it against the national identity service, a record writer creates the permanent records, a review desk can approve or reject, and an activation worker calls the operator's network. Parked records and retry jobs sit underneath, connected to verification and to activation.",
  nodes: {
    idsvc: { x: 260, y: 16, w: 124, label: "National ID", external: true },
    review: { x: 416, y: 16, w: 116, label: "Review desk" },
    network: { x: 564, y: 16, w: 104, label: "Network", external: true },
    app: { x: 12, y: 104, w: 96, label: "Agent app" },
    intake: { x: 132, y: 104, w: 104, label: "Intake API" },
    verify: { x: 260, y: 104, w: 124, label: "Verification" },
    writer: { x: 408, y: 104, w: 132, label: "Record writer" },
    activate: { x: 564, y: 104, w: 104, label: "Activation" },
    store: { x: 96, y: 192, w: 176, label: "Records and audit" },
    retry: { x: 296, y: 192, w: 372, label: "Parked records and retries" },
  },
  edges: {
    submit: { d: "M 108 126 H 124" },
    toVerify: { d: "M 236 126 H 252" },
    toWriter: { d: "M 384 126 H 400" },
    toActivate: { d: "M 540 126 H 556" },
    idCheck: { d: "M 322 96 V 68", both: true },
    reviewEdge: { d: "M 474 96 V 68", both: true },
    netCall: { d: "M 616 96 V 68", both: true },
    toStore: { d: "M 184 148 V 184" },
    park: { d: "M 340 156 V 184", both: true, label: "park, resume", lx: 350, ly: 174, anchor: "start" },
    retryEdge: { d: "M 616 156 V 184", both: true, label: "retry", lx: 606, ly: 174, anchor: "end" },
  },
};

export const registrationSteps: WalkStep[] = [
  {
    title: "The agent captures the customer",
    body: "Details, fingerprints and a portrait are captured on a registered device. The app gives the registration a reference of its own before anything is sent.",
    active: ["app"],
    edges: [],
  },
  {
    title: "The API accepts it",
    body: "The request is checked: the payload, the agent, the device, and whether this reference has been seen before. The registration is stored and queued, and the agent gets an answer. Nothing has been verified yet.",
    active: ["app", "intake", "store"],
    edges: ["submit", "toStore"],
  },
  {
    title: "The same request arrives again",
    body: "The reply was lost on a weak connection, so the app sends the registration again. The API finds the reference already stored and refuses the duplicate. One registration exists, not two.",
    active: ["app", "intake", "store"],
    edges: ["submit"],
  },
  {
    title: "Identity is verified",
    body: "A worker checks the identity number against the national database, compares the live portrait with the photograph on file, and applies the rules on age and on lines per person. The count is taken under a lock on that person, so two registrations at once cannot both pass.",
    active: ["intake", "verify", "idsvc"],
    edges: ["toVerify", "idCheck"],
  },
  {
    title: "The identity service is down",
    body: "The national service does not answer. The registration is parked with a reason, and a retry job takes it. When the service is back it resumes from this step. The agent and the customer do nothing.",
    active: ["verify", "retry"],
    failed: ["idsvc"],
    edges: ["idCheck", "park"],
  },
  {
    title: "The permanent records are written",
    body: "A verified registration becomes the subscriber, the number and the biometric records, each with its audit entry. If review is switched on, the record now waits for a person.",
    active: ["verify", "writer"],
    edges: ["toWriter"],
  },
  {
    title: "A reviewer decides",
    body: "A reviewer looks at the record and approves or rejects it. A rejection ends here, with the reason recorded.",
    active: ["writer", "review"],
    edges: ["reviewEdge"],
  },
  {
    title: "Activation starts, and one system fails",
    body: "Activation calls several of the operator’s systems. Two answer and one does not. The job records which calls succeeded and goes back on the queue with a delay.",
    active: ["writer", "activate", "retry"],
    failed: ["network"],
    edges: ["toActivate", "netCall", "retryEdge"],
  },
  {
    title: "The retry finishes the job",
    body: "On the next attempt only the outstanding call is made. When the last system confirms, the line is marked active and the customer is told by SMS. If the attempts run out, the registration stays visible as failed, for a person to pick up.",
    active: ["activate", "network", "retry"],
    edges: ["retryEdge", "netCall"],
  },
];
