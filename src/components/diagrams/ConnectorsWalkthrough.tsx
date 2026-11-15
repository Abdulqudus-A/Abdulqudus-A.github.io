"use client";

import { WalkControls, WalkSteps, useWalkthrough } from "../Walkthrough";
import { PipelineDiagram, type EdgeId, type NodeId, type Tone } from "./PipelineDiagram";

type Step = {
  title: string;
  body: string;
  active: NodeId[];
  failed?: NodeId[];
  edges: EdgeId[];
};

const ALL_NODES: NodeId[] = ["scheduler", "queue", "connector", "api", "state", "raw", "transform", "warehouse", "report"];
const ALL_EDGES: EdgeId[] = ["enqueue", "lease", "call", "cursor", "land", "toTransform", "merge", "query"];

const STEPS: Step[] = [
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

function tones(step: Step) {
  const nodes: Partial<Record<NodeId, Tone>> = {};
  for (const id of ALL_NODES) {
    nodes[id] = step.failed?.includes(id) ? "failed" : step.active.includes(id) ? "active" : "dim";
  }
  const edges: Partial<Record<EdgeId, Tone>> = {};
  for (const id of ALL_EDGES) {
    edges[id] = step.edges.includes(id) ? "active" : "dim";
  }
  return { nodes, edges };
}

export function ConnectorsWalkthrough() {
  const walk = useWalkthrough(STEPS.length);
  const step = STEPS[walk.index];
  const { nodes, edges } = tones(step);

  return (
    <div className="walk">
      <div className="frame">
        <PipelineDiagram nodes={nodes} edges={edges} label={`Step ${walk.index + 1}: ${step.title}. ${step.body}`} />
      </div>
      <WalkControls index={walk.index} count={STEPS.length} playing={walk.playing} go={walk.go} toggle={walk.toggle} />
      <WalkSteps steps={STEPS} index={walk.index} go={walk.go} />
    </div>
  );
}
