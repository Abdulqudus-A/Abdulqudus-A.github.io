export type Decision = {
  title: string;
  chose: string;
  /** The alternative that was not taken. */
  alt: string;
  why: string;
  cost: string;
};

export function Decisions({
  items,
  section,
  altLabel = "Rejected",
}: {
  items: Decision[];
  /** Section number, used to number each decision (5 gives 5.1, 5.2, ...). */
  section: number;
  /** Label for the alternative: "Rejected" for a design, "Instead of" for a system as built. */
  altLabel?: string;
}) {
  return (
    <>
      {items.map((d, i) => (
        <div className="decision" key={d.title}>
          <h3>
            <span className="n">
              {section}.{i + 1}
            </span>
            {d.title}
          </h3>
          <dl>
            <div>
              <dt className="label">Chose</dt>
              <dd>{d.chose}</dd>
            </div>
            <div>
              <dt className="label">{altLabel}</dt>
              <dd>{d.alt}</dd>
            </div>
            <div>
              <dt className="label">Why</dt>
              <dd>{d.why}</dd>
            </div>
            <div>
              <dt className="label">Cost</dt>
              <dd>{d.cost}</dd>
            </div>
          </dl>
        </div>
      ))}
    </>
  );
}
