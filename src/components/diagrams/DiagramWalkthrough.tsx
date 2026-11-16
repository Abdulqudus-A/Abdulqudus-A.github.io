"use client";

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
      <div className="frame">
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
