"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// Shared behaviour and controls for the step-through figures in the design docs.
// Each doc supplies its own diagram and steps; this file supplies the stepping.

const noopSubscribe = () => () => {};

/** True once the page is interactive. Controls are only shown then. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function useWalkthrough(count: number, intervalMs = 5000) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = count - 1;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(
      () => {
        if (index >= last) setPlaying(false);
        else setIndex(index + 1);
      },
      index >= last ? 0 : intervalMs,
    );
    return () => window.clearTimeout(timer);
  }, [playing, index, last, intervalMs]);

  return {
    index,
    playing,
    go: (i: number) => {
      setPlaying(false);
      setIndex(Math.max(0, Math.min(last, i)));
    },
    toggle: () => {
      if (!playing && index >= last) setIndex(0);
      setPlaying(!playing);
    },
  };
}

export function WalkControls({
  index,
  count,
  playing,
  go,
  toggle,
}: {
  index: number;
  count: number;
  playing: boolean;
  go: (i: number) => void;
  toggle: () => void;
}) {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  return (
    <div className="walk-controls">
      <button type="button" onClick={() => go(index - 1)} disabled={index === 0}>
        Back
      </button>
      <button type="button" onClick={() => go(index + 1)} disabled={index === count - 1}>
        Next
      </button>
      <button type="button" onClick={toggle} aria-pressed={playing}>
        {playing ? "Pause" : "Play"}
      </button>
      <p className="label" aria-live="polite">
        Step {index + 1} of {count}
      </p>
    </div>
  );
}

export function WalkSteps({
  steps,
  index,
  go,
}: {
  steps: { title: string; body: string }[];
  index: number;
  go: (i: number) => void;
}) {
  return (
    <ol className="walk-steps">
      {steps.map((step, i) => (
        <li key={step.title} className={i === index ? "is-current" : undefined} aria-current={i === index ? "step" : undefined}>
          <button type="button" onClick={() => go(i)}>
            <span className="n">{i + 1}</span>
            {step.title}
          </button>
          <p>{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
