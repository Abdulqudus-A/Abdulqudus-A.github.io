// Static figure for now. In the next build this becomes the interactive demo:
// the visitor stops a worker and watches a second one resume from the checkpoint.

const BOX_W = 120;
const BOX_H = 44;
const XS = [100, 236, 372, 508];
const ROW_A = 22;
const ROW_B = 138;

const text = {
  fontFamily: "var(--mono)",
  fontSize: 13,
} as const;

function Step({
  x,
  y,
  label,
  tone = "ink",
}: {
  x: number;
  y: number;
  label: string;
  tone?: "ink" | "accent" | "ghost";
}) {
  const stroke = tone === "accent" ? "var(--accent)" : tone === "ghost" ? "var(--rule)" : "var(--ink)";
  const fill = tone === "ghost" ? "none" : "var(--paper)";
  const color = tone === "accent" ? "var(--accent)" : tone === "ghost" ? "var(--muted)" : "var(--ink)";
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={BOX_W}
        height={BOX_H}
        fill={fill}
        stroke={stroke}
        strokeWidth={tone === "ghost" ? 1 : 1.5}
        strokeDasharray={tone === "ghost" ? "4 4" : undefined}
      />
      <text x={x + BOX_W / 2} y={y + BOX_H / 2 + 4.5} textAnchor="middle" fill={color} style={text}>
        {label}
      </text>
    </g>
  );
}

export function RecoveryFigure() {
  const cp2 = XS[1] + BOX_W / 2;
  const midB = ROW_B + BOX_H / 2;
  return (
    <figure className="fig">
      <div className="frame">
        <svg viewBox="0 0 640 196" role="img" aria-labelledby="fig1-title fig1-desc">
          <title id="fig1-title">Checkpoint recovery</title>
          <desc id="fig1-desc">
            Worker A completes steps 1 and 2 and saves a checkpoint after each. It is lost during step 3. Worker B
            resumes the same job at step 3 and finishes step 4. Steps 1 and 2 are not repeated.
          </desc>

          <text x={0} y={ROW_A + BOX_H / 2 + 4.5} fill="var(--muted)" style={text}>
            worker A
          </text>
          <Step x={XS[0]} y={ROW_A} label="step 1  ✓" />
          <Step x={XS[1]} y={ROW_A} label="step 2  ✓" />
          <Step x={XS[2]} y={ROW_A} label="step 3  ✕" tone="accent" />
          <Step x={XS[3]} y={ROW_A} label="step 4" tone="ghost" />

          {/* checkpoints */}
          <circle cx={XS[0] + BOX_W / 2} cy={ROW_A + BOX_H + 16} r={3.5} fill="var(--ink)" />
          <circle cx={cp2} cy={ROW_A + BOX_H + 16} r={3.5} fill="var(--ink)" />
          <text x={XS[0] + BOX_W / 2 + 10} y={ROW_A + BOX_H + 20.5} fill="var(--muted)" style={{ ...text, fontSize: 12 }}>
            checkpoint
          </text>
          <text x={cp2 + 10} y={ROW_A + BOX_H + 20.5} fill="var(--muted)" style={{ ...text, fontSize: 12 }}>
            checkpoint
          </text>
          <text
            x={XS[2] + BOX_W / 2}
            y={ROW_A + BOX_H + 20.5}
            textAnchor="middle"
            fill="var(--accent)"
            style={{ ...text, fontSize: 12 }}
          >
            worker lost
          </text>

          {/* resume path */}
          <path
            d={`M ${cp2} ${ROW_A + BOX_H + 26} V ${midB} H ${XS[2] - 9}`}
            fill="none"
            stroke="var(--ink)"
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
          <path d={`M ${XS[2] - 10} ${midB - 5} L ${XS[2] - 1} ${midB} L ${XS[2] - 10} ${midB + 5} Z`} fill="var(--ink)" />

          <text x={0} y={midB + 4.5} fill="var(--muted)" style={text}>
            worker B
          </text>
          <text x={XS[0]} y={midB + 4.5} fill="var(--muted)" style={{ ...text, fontSize: 12 }}>
            steps 1–2 not repeated
          </text>
          <Step x={XS[2]} y={ROW_B} label="step 3  ✓" />
          <Step x={XS[3]} y={ROW_B} label="step 4  ✓" />
        </svg>
      </div>
      <figcaption>
        Fig. 1. Checkpoint recovery. A second worker resumes the job at the failed step instead of starting over, so
        nothing is processed twice.
      </figcaption>
    </figure>
  );
}
