import type { DiagramDef } from "../../components/diagrams/Diagram";
import type { WalkStep } from "../../components/diagrams/DiagramWalkthrough";

export const connectorsDiagram: DiagramDef = {
  width: 680,
  height: 272,
  label:
    "Architecture: a scheduler puts sync jobs on a queue. A connector worker calls the third-party API, saves its cursor in sync state and writes each page to raw landing. A transform maps raw records to a shared model and merges them into the warehouse, which the report queries.",
  nodes: {
    scheduler: { x: 12, y: 16, w: 120, label: "Scheduler" },
    queue: { x: 172, y: 16, w: 120, label: "Job queue" },
    connector: { x: 332, y: 16, w: 120, label: "Connector" },
    api: { x: 508, y: 16, w: 160, label: "Third-party API", external: true },
    state: { x: 508, y: 104, w: 160, label: "Sync state" },
    raw: { x: 12, y: 212, w: 120, label: "Raw landing" },
    transform: { x: 188, y: 212, w: 120, label: "Transform" },
    warehouse: { x: 364, y: 212, w: 120, label: "Warehouse" },
    report: { x: 548, y: 212, w: 120, label: "Report" },
  },
  edges: {
    enqueue: { d: "M 132 38 H 164", label: "job", lx: 148, ly: 30 },
    lease: { d: "M 292 38 H 324" },
    call: { d: "M 460 38 H 500", both: true },
    cursor: { d: "M 420 60 V 126 H 500", label: "cursor", lx: 460, ly: 118 },
    land: { d: "M 372 60 V 176 H 72 V 204", label: "pages, as received", lx: 222, ly: 168 },
    toTransform: { d: "M 132 234 H 180" },
    merge: { d: "M 308 234 H 356", label: "merge", lx: 332, ly: 226 },
    query: { d: "M 484 234 H 540" },
  },
};

export const connectorsSteps: WalkStep[] = [
  {
    title: "A sync is due",
    body: "The scheduler finds that one account on one platform is due and puts a single job on the queue. The job names the connector, the account and the stream, and nothing else.",
    active: ["scheduler", "queue"],
    edges: ["enqueue"],
  },
  {
    title: "A worker reads pages",
    body: "A worker leases the job, loads the saved cursor and starts reading. Each page is written to raw landing exactly as received, and only then does the cursor move forward.",
    active: ["connector", "api", "state", "raw"],
    edges: ["lease", "call", "cursor", "land"],
  },
  {
    title: "The API says slow down",
    body: "Page 7 comes back as a rate-limit response. The shared runtime waits for as long as the API asks, with backoff and jitter, then tries again. The connector code does not handle this itself.",
    active: ["connector", "state"],
    failed: ["api"],
    edges: ["call"],
  },
  {
    title: "The worker dies",
    body: "The worker is killed mid-sync. The job was leased, not deleted, so it returns to the queue when the lease runs out. A second worker takes it, reads the cursor and resumes at page 7. Pages 1 to 6 are not fetched again.",
    active: ["queue", "state", "raw"],
    failed: ["connector"],
    edges: ["lease", "cursor"],
  },
  {
    title: "The source changes shape",
    body: "The platform renames a field. Raw landing stores the page unchanged. The transform fails loudly on the missing field and the load is skipped, so the report keeps its last correct numbers. Once the mapping is fixed the transform reruns from raw, with no new API calls.",
    active: ["raw", "warehouse", "report"],
    failed: ["transform"],
    edges: ["toTransform", "query"],
  },
  {
    title: "The load is safe to repeat",
    body: "Rows are merged into the warehouse on a natural key: source, account, campaign and date. Running the same sync twice, or pulling last week again because the platform revised it, replaces rows instead of adding them.",
    active: ["transform", "warehouse", "report"],
    edges: ["toTransform", "merge", "query"],
  },
];
