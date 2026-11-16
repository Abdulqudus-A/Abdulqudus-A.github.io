import type { DiagramDef } from "../../components/diagrams/Diagram";
import type { WalkStep } from "../../components/diagrams/DiagramWalkthrough";

// Written from the Reavil pipeline code: the Fastify ingest route, the BullMQ
// feedback worker, the AI service and the cluster worker.

export const feedbackDiagram: DiagramDef = {
  width: 680,
  height: 292,
  label:
    "Architecture: a widget posts feedback to the API, which stores it as pending in the database and puts a job on the feedback queue. A feedback worker calls the model API, writes scores and a vector to the database, and schedules one delayed job on the cluster queue. A cluster worker groups scored feedback in the database, asks the model API for one summary per new group, and the dashboard reads the ranked groups.",
  nodes: {
    widget: { x: 12, y: 16, w: 84, label: "Widget" },
    api: { x: 132, y: 16, w: 64, label: "API" },
    fqueue: { x: 232, y: 16, w: 128, label: "Feedback queue" },
    fworker: { x: 396, y: 16, w: 136, label: "Feedback worker" },
    model: { x: 568, y: 16, w: 100, label: "Model API", external: true },
    dashboard: { x: 12, y: 212, w: 100, label: "Dashboard" },
    db: { x: 148, y: 212, w: 100, label: "Database" },
    cworker: { x: 284, y: 212, w: 136, label: "Cluster worker" },
    cqueue: { x: 456, y: 212, w: 128, label: "Cluster queue" },
  },
  edges: {
    submit: { d: "M 96 38 H 124" },
    enqueue: { d: "M 196 38 H 224", label: "job", lx: 210, ly: 30 },
    lease: { d: "M 360 38 H 388" },
    call: { d: "M 540 38 H 560", both: true },
    store: { d: "M 164 60 V 204", label: "pending", lx: 172, ly: 112, anchor: "start" },
    write: { d: "M 420 60 V 150 H 222 V 204", label: "scores, vector", lx: 322, ly: 142 },
    schedule: { d: "M 500 60 V 204", label: "delayed job", lx: 510, ly: 136, anchor: "start" },
    run: { d: "M 456 234 H 428" },
    group: { d: "M 276 234 H 256", both: true },
    summarise: { d: "M 352 256 V 268 H 640 V 68", label: "one summary per new group", lx: 496, ly: 284 },
    read: { d: "M 148 234 H 120" },
  },
};

export const feedbackSteps: WalkStep[] = [
  {
    title: "Accepted before it is understood",
    body: "The API validates the message, checks the project key and the per-IP rate limit, stores the feedback as pending and puts a job on the queue. It answers 202 Accepted. No model has been called yet.",
    active: ["widget", "api", "db", "fqueue"],
    edges: ["submit", "store", "enqueue"],
  },
  {
    title: "A worker scores it",
    body: "The worker embeds the text and asks a model for sentiment, severity, tags and the product flow involved. The answer must be JSON. Severity is clamped, unknown flows become “other”, and the critical score is computed in code, not by the model.",
    active: ["fworker", "model", "db"],
    edges: ["lease", "call", "write"],
  },
  {
    title: "The model does not answer",
    body: "A rate limit, an outage or a reply that is not valid JSON. Each call is retried with exponential backoff. If it still fails, classification falls back to keyword rules, and the row records that it was scored by fallback and why. Nothing is lost and nothing waits on the provider.",
    active: ["fworker", "db"],
    failed: ["model"],
    edges: ["call", "write"],
  },
  {
    title: "One clustering run for a burst",
    body: "After scoring, the worker schedules clustering for that project as a single delayed job with a fixed ID. If one is already waiting, nothing is added. Thirty seconds later it runs once, however many messages arrived in between.",
    active: ["fworker", "cqueue"],
    edges: ["schedule"],
  },
  {
    title: "New feedback joins an existing problem",
    body: "The cluster worker compares each new message with the centre of every open group, by cosine similarity. Above the threshold it joins the closest group. The group keeps its name and summary. Only its numbers change.",
    active: ["cqueue", "cworker", "db"],
    edges: ["run", "group"],
  },
  {
    title: "A new problem needs six voices",
    body: "Messages that match nothing form candidate groups. A candidate becomes a problem only when it reaches six messages; until then it waits for more. A new problem is named and summarised by the model once, then appears on the dashboard in order of critical score.",
    active: ["cworker", "model", "db", "dashboard"],
    edges: ["group", "summarise", "read"],
  },
];
