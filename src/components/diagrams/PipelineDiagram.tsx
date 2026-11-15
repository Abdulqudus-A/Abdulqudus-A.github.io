// Architecture diagram for the data-connectors design doc.
// Pure component: used as a static figure and, with `nodes`/`edges` state,
// inside the failure walkthrough.

export type NodeId = "scheduler" | "queue" | "connector" | "api" | "state" | "raw" | "transform" | "warehouse" | "report";
export type EdgeId = "enqueue" | "lease" | "call" | "cursor" | "land" | "toTransform" | "merge" | "query";
export type Tone = "active" | "failed" | "dim";

const W = 120;
const H = 44;

const NODES: Record<NodeId, { x: number; y: number; w?: number; label: string; external?: boolean }> = {
  scheduler: { x: 12, y: 16, label: "Scheduler" },
  queue: { x: 172, y: 16, label: "Job queue" },
  connector: { x: 332, y: 16, label: "Connector" },
  api: { x: 508, y: 16, w: 160, label: "Third-party API", external: true },
  state: { x: 508, y: 104, w: 160, label: "Sync state" },
  raw: { x: 12, y: 212, label: "Raw landing" },
  transform: { x: 188, y: 212, label: "Transform" },
  warehouse: { x: 364, y: 212, label: "Warehouse" },
  report: { x: 548, y: 212, label: "Report" },
};

const EDGES: Record<EdgeId, { d: string; label?: string; lx?: number; ly?: number; both?: boolean }> = {
  enqueue: { d: "M 132 38 H 164", label: "job", lx: 148, ly: 30 },
  lease: { d: "M 292 38 H 324" },
  call: { d: "M 460 38 H 500", both: true },
  cursor: { d: "M 420 60 V 126 H 500", label: "cursor", lx: 460, ly: 118 },
  land: { d: "M 372 60 V 176 H 72 V 204", label: "pages, as received", lx: 222, ly: 168 },
  toTransform: { d: "M 132 234 H 180" },
  merge: { d: "M 308 234 H 356", label: "merge", lx: 332, ly: 226 },
  query: { d: "M 484 234 H 540" },
};

// Paths are made of M, H and V segments and stop 8px short of the node they
// point at; the arrowhead fills that gap.
function endPoints(d: string) {
  const parts = d.trim().split(/\s+/);
  let x = 0;
  let y = 0;
  let px = 0;
  let py = 0;
  for (let i = 0; i < parts.length; i++) {
    const cmd = parts[i];
    if (cmd === "M") {
      x = Number(parts[i + 1]);
      y = Number(parts[i + 2]);
      i += 2;
    } else if (cmd === "H") {
      px = x;
      py = y;
      x = Number(parts[i + 1]);
      i += 1;
    } else if (cmd === "V") {
      px = x;
      py = y;
      y = Number(parts[i + 1]);
      i += 1;
    }
  }
  return { x, y, px, py };
}

function arrowHead(d: string) {
  const { x, y, px, py } = endPoints(d);
  const s = 5;
  if (py === y) {
    const dir = x > px ? 1 : -1;
    return `M ${x + dir * 8} ${y} L ${x} ${y - s} L ${x} ${y + s} Z`;
  }
  const dir = y > py ? 1 : -1;
  return `M ${x} ${y + dir * 8} L ${x - s} ${y} L ${x + s} ${y} Z`;
}

function startHead(d: string) {
  // Arrow at the start of a horizontal path (for two-way edges).
  const parts = d.trim().split(/\s+/);
  const x = Number(parts[1]);
  const y = Number(parts[2]);
  const s = 5;
  return `M ${x - 8} ${y} L ${x} ${y - s} L ${x} ${y + s} Z`;
}

export function PipelineDiagram({
  nodes = {},
  edges = {},
  label = "Architecture: a scheduler puts sync jobs on a queue. A connector worker calls the third-party API, saves its cursor in sync state and writes each page to raw landing. A transform maps raw records to a shared model and merges them into the warehouse, which the report queries.",
}: {
  nodes?: Partial<Record<NodeId, Tone>>;
  edges?: Partial<Record<EdgeId, Tone>>;
  label?: string;
}) {
  return (
    <svg className="dg" viewBox="0 0 680 272" role="img" aria-label={label}>
      {(Object.keys(EDGES) as EdgeId[]).map((id) => {
        const e = EDGES[id];
        const tone = edges[id];
        return (
          <g key={id} className={`dg-edge${tone ? ` is-${tone}` : ""}`}>
            <path className="dg-line" d={e.d} />
            <path className="dg-head" d={arrowHead(e.d)} />
            {e.both && <path className="dg-head" d={startHead(e.d)} />}
            {e.label && (
              <text className="dg-elabel" x={e.lx} y={e.ly} textAnchor="middle">
                {e.label}
              </text>
            )}
          </g>
        );
      })}

      {(Object.keys(NODES) as NodeId[]).map((id) => {
        const n = NODES[id];
        const w = n.w ?? W;
        const tone = nodes[id];
        return (
          <g key={id} className={`dg-node${n.external ? " is-external" : ""}${tone ? ` is-${tone}` : ""}`}>
            <rect x={n.x} y={n.y} width={w} height={H} />
            <text x={n.x + w / 2} y={n.y + H / 2 + 4.5} textAnchor="middle">
              {tone === "failed" ? `${n.label}  ✕` : n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
