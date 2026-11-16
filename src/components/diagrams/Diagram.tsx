// Generic box-and-arrow diagram used by every design doc.
// A diagram is plain data (see src/content/diagrams), so the same definition
// renders as a static figure and inside the step-through walkthrough.

export type Tone = "active" | "failed" | "dim";

export type NodeDef = { x: number; y: number; w: number; label: string; external?: boolean };

export type EdgeDef = {
  /** Path made of M, H and V segments. It stops 8px short of the node it points at. */
  d: string;
  /** Draw an arrowhead at the start as well. The path must then start 8px from its node. */
  both?: boolean;
  label?: string;
  lx?: number;
  ly?: number;
  anchor?: "start" | "middle" | "end";
};

export type DiagramDef = {
  width: number;
  height: number;
  /** Plain-language description for screen readers. */
  label: string;
  nodes: Record<string, NodeDef>;
  edges: Record<string, EdgeDef>;
};

export const NODE_H = 44;

function points(d: string) {
  const parts = d.trim().split(/\s+/);
  const pts: { x: number; y: number }[] = [];
  let x = 0;
  let y = 0;
  for (let i = 0; i < parts.length; i++) {
    const cmd = parts[i];
    if (cmd === "M") {
      x = Number(parts[i + 1]);
      y = Number(parts[i + 2]);
      i += 2;
    } else if (cmd === "H") {
      x = Number(parts[i + 1]);
      i += 1;
    } else if (cmd === "V") {
      y = Number(parts[i + 1]);
      i += 1;
    }
    pts.push({ x, y });
  }
  return pts;
}

// Arrowhead that starts at `from` and points away from `prev`, 8px long.
function head(from: { x: number; y: number }, prev: { x: number; y: number }) {
  const s = 5;
  if (prev.y === from.y) {
    const dir = from.x > prev.x ? 1 : -1;
    return `M ${from.x + dir * 8} ${from.y} L ${from.x} ${from.y - s} L ${from.x} ${from.y + s} Z`;
  }
  const dir = from.y > prev.y ? 1 : -1;
  return `M ${from.x} ${from.y + dir * 8} L ${from.x - s} ${from.y} L ${from.x + s} ${from.y} Z`;
}

export function Diagram({
  def,
  nodeTones = {},
  edgeTones = {},
  label,
}: {
  def: DiagramDef;
  nodeTones?: Record<string, Tone>;
  edgeTones?: Record<string, Tone>;
  label?: string;
}) {
  return (
    <svg className="dg" viewBox={`0 0 ${def.width} ${def.height}`} role="img" aria-label={label ?? def.label}>
      {Object.entries(def.edges).map(([id, e]) => {
        const tone = edgeTones[id];
        const pts = points(e.d);
        const end = pts[pts.length - 1];
        const beforeEnd = pts[pts.length - 2];
        return (
          <g key={id} className={`dg-edge${tone ? ` is-${tone}` : ""}`}>
            <path className="dg-line" d={e.d} />
            <path className="dg-head" d={head(end, beforeEnd)} />
            {e.both && <path className="dg-head" d={head(pts[0], pts[1])} />}
            {e.label && (
              <text className="dg-elabel" x={e.lx} y={e.ly} textAnchor={e.anchor ?? "middle"}>
                {e.label}
              </text>
            )}
          </g>
        );
      })}

      {Object.entries(def.nodes).map(([id, n]) => {
        const tone = nodeTones[id];
        return (
          <g key={id} className={`dg-node${n.external ? " is-external" : ""}${tone ? ` is-${tone}` : ""}`}>
            <rect x={n.x} y={n.y} width={n.w} height={NODE_H} />
            <text x={n.x + n.w / 2} y={n.y + NODE_H / 2 + 4.5} textAnchor="middle">
              {tone === "failed" ? `${n.label}  ✕` : n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
