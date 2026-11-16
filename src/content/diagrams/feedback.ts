import type { DiagramDef } from "../../components/diagrams/Diagram";
import type { WalkStep } from "../../components/diagrams/DiagramWalkthrough";

// Sources for this file:
// - Ingest, scoring and grouping: the pipeline code (Fastify route, BullMQ
//   workers, AI service, cluster worker).
// - Enrichment, the second-model fallback, the chat agent and the PRD
//   generator: the author's description of the current version.

export const feedbackDiagram: DiagramDef = {
  width: 680,
  height: 318,
  label:
    "Architecture: a widget posts feedback to the API, which stores it as pending in the database and replies. In the background an enrich step asks the model API to add context to thin feedback, then puts the message on the feedback queue. A feedback worker calls the model API, writes scores and a vector to the database, and schedules one delayed job on the cluster queue. A cluster worker groups scored feedback in the database, asks the model API for one summary per new group, and the dashboard reads the ranked groups.",
  nodes: {
    widget: { x: 12, y: 40, w: 84, label: "Widget" },
    api: { x: 124, y: 40, w: 56, label: "API" },
    enrich: { x: 208, y: 40, w: 84, label: "Enrich" },
    fqueue: { x: 320, y: 40, w: 128, label: "Feedback queue" },
    fworker: { x: 476, y: 40, w: 136, label: "Feedback worker" },
    model: { x: 556, y: 138, w: 112, label: "Model API", external: true },
    dashboard: { x: 12, y: 236, w: 100, label: "Dashboard" },
    db: { x: 148, y: 236, w: 100, label: "Database" },
    cworker: { x: 284, y: 236, w: 136, label: "Cluster worker" },
    cqueue: { x: 456, y: 236, w: 128, label: "Cluster queue" },
  },
  edges: {
    submit: { d: "M 96 62 H 116" },
    toEnrich: { d: "M 180 62 H 200" },
    enqueue: { d: "M 292 62 H 312" },
    lease: { d: "M 448 62 H 468" },
    enrichCall: {
      d: "M 250 32 V 14 H 640 V 130",
      both: true,
      label: "adds context to thin feedback",
      lx: 445,
      ly: 30,
    },
    call: { d: "M 590 92 V 130", both: true },
    store: { d: "M 152 84 V 228", label: "pending", lx: 160, ly: 150, anchor: "start" },
    write: { d: "M 500 84 V 194 H 222 V 228", label: "scores, vector", lx: 360, ly: 186 },
    schedule: { d: "M 540 84 V 228", label: "delayed job", lx: 532, ly: 216, anchor: "end" },
    run: { d: "M 456 258 H 428" },
    group: { d: "M 276 258 H 256", both: true },
    summarise: { d: "M 352 280 V 292 H 620 V 190", label: "one summary per new group", lx: 486, ly: 308 },
    read: { d: "M 148 258 H 120" },
  },
};

export const feedbackSteps: WalkStep[] = [
  {
    title: "Accepted before it is understood",
    body: "The API validates the message, checks the project key and the per-IP rate limit, stores the feedback as pending and answers 202 Accepted. No model has been called yet.",
    active: ["widget", "api", "db"],
    edges: ["submit", "store"],
  },
  {
    title: "Thin feedback gets context",
    body: "In the background, a model adds context to feedback that is too thin to classify on its own. The enriched message then goes on the feedback queue.",
    active: ["enrich", "model", "fqueue"],
    edges: ["toEnrich", "enrichCall", "enqueue"],
  },
  {
    title: "A worker scores it",
    body: "The worker embeds the text and asks a model for sentiment, severity, tags and the product flow involved. The answer must be JSON. Severity is clamped, unknown flows become “other”, and the critical score is computed in code, not by the model.",
    active: ["fworker", "model", "db"],
    edges: ["lease", "call", "write"],
  },
  {
    title: "The model does not answer",
    body: "A rate limit, an outage or a reply that is not valid JSON. The call is retried with backoff, then sent to a second model. If that fails too, classification falls back to keyword rules and the row is marked as scored by fallback, so a later job can score it again. Nothing is lost and nothing waits on the provider.",
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

// Figure 2: what reads the stored feedback.
export const feedbackUsesDiagram: DiagramDef = {
  width: 680,
  height: 252,
  label:
    "What is built on the stored feedback: from the analytics portal a product manager asks the chat agent a question. The chat agent retrieves this project's feedback from the feedback store and answers with the model API. From the same portal a product manager sends a group of feature requests to the PRD generator, which reads the group's feedback, calls the model API and returns an editable draft PRD.",
  nodes: {
    portal: { x: 12, y: 104, w: 144, label: "Analytics portal" },
    chat: { x: 232, y: 16, w: 120, label: "Chat agent" },
    prd: { x: 232, y: 192, w: 120, label: "PRD generator" },
    store: { x: 428, y: 104, w: 128, label: "Feedback store" },
    model: { x: 568, y: 16, w: 100, label: "Model API", external: true },
  },
  edges: {
    ask: { d: "M 84 104 V 38 H 224", label: "question", lx: 150, ly: 30 },
    chatStore: { d: "M 292 68 V 126 H 420", both: true, label: "this project only", lx: 358, ly: 118 },
    chatModel: { d: "M 360 38 H 560", both: true },
    pick: { d: "M 60 148 V 214 H 224", label: "feature group", lx: 146, ly: 206 },
    draft: { d: "M 252 192 V 170 H 108 V 156", label: "draft PRD, editable", lx: 182, ly: 162 },
    prdStore: { d: "M 292 184 V 126 H 420", both: true },
    prdModel: { d: "M 360 214 H 652 V 68", both: true },
  },
};
