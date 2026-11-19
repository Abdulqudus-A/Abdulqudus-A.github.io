"use client";

import { useEffect, useRef } from "react";
import { WalkControls, WalkSteps, useWalkthrough } from "../Walkthrough";
import { Diagram, type DiagramDef, type Tone } from "./Diagram";

export type WalkStep = {
  title: string;
  body: string;
  /** Nodes in play at this step. Everything else is dimmed. */
  active: string[];
  /** Nodes that have failed at this step. */
  failed?: string[];
  /** Edges in play at this step. */
  edges: string[];
};

export function DiagramWalkthrough({ def, steps }: { def: DiagramDef; steps: WalkStep[] }) {
  const walk = useWalkthrough(steps.length);
  const step = steps[walk.index];
  const frame = useRef<HTMLDivElement>(null);

  // On a narrow screen the diagram is wider than its frame and scrolls sideways.
  // Keep the part of it that this step is about in view.
  useEffect(() => {
    const el = frame.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const ids = [...(step.failed ?? []), ...step.active];
    const xs = ids.map((id) => def.nodes[id]).filter(Boolean);
    if (xs.length === 0) return;
    const left = Math.min(...xs.map((n) => n.x));
    const right = Math.max(...xs.map((n) => n.x + n.w));
    const scale = el.scrollWidth / def.width;
    const target = ((left + right) / 2) * scale - el.clientWidth / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: Math.max(0, target), behavior: reduce ? "auto" : "smooth" });
  }, [step, def]);

  const nodeTones: Record<string, Tone> = {};
  for (const id of Object.keys(def.nodes)) {
    nodeTones[id] = step.failed?.includes(id) ? "failed" : step.active.includes(id) ? "active" : "dim";
  }
  const edgeTones: Record<string, Tone> = {};
  for (const id of Object.keys(def.edges)) {
    edgeTones[id] = step.edges.includes(id) ? "active" : "dim";
  }

  return (
    <div className="walk">
      <p className="label scroll-hint">The diagram scrolls sideways and follows each step</p>
      <div className="frame" ref={frame}>
        <Diagram
          def={def}
          nodeTones={nodeTones}
          edgeTones={edgeTones}
          label={`Step ${walk.index + 1}: ${step.title}. ${step.body}`}
        />
      </div>
      <WalkControls index={walk.index} count={steps.length} playing={walk.playing} go={walk.go} toggle={walk.toggle} />
      <WalkSteps steps={steps} index={walk.index} go={walk.go} />
    </div>
  );
}
