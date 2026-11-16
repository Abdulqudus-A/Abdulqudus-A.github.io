import type { Metadata } from "next";
import Link from "next/link";
import { Decisions, type Decision } from "../../../components/Decisions";
import { Footer } from "../../../components/Footer";
import { TopBar } from "../../../components/TopBar";
import { Diagram } from "../../../components/diagrams/Diagram";
import { DiagramWalkthrough } from "../../../components/diagrams/DiagramWalkthrough";
import { connectorsDiagram, connectorsSteps } from "../../../content/diagrams/connectors";

const title = "Connectors that survive other people’s APIs";
const dek =
  "A reference design for loading marketing and ads data from many third-party platforms into one warehouse, so that one report can cover every source.";

export const metadata: Metadata = {
  title,
  description: dek,
};

const parts: { name: string; text: string }[] = [
  { name: "Scheduler", text: "Decides which account and stream is due, and puts one job on the queue for each." },
  {
    name: "Job queue",
    text: "Holds sync jobs durably. A job is leased to a worker and returns to the queue if that worker disappears.",
  },
  {
    name: "Connector",
    text: "The only source-specific code. It implements a small contract: authenticate, list the streams, read one page from a cursor.",
  },
  {
    name: "Sync state",
    text: "One row per account and stream: the cursor, the last successful sync and the current status.",
  },
  {
    name: "Raw landing",
    text: "Every page exactly as the API returned it, tagged with the sync and the page number. Append-only.",
  },
  { name: "Transform", text: "Maps raw records into one shared model: accounts, campaigns and daily metrics." },
  { name: "Warehouse", text: "BigQuery tables partitioned by date. Every load is a merge on a natural key." },
  { name: "Report", text: "Queries the shared model, so it works for any mix of sources without knowing which ones exist." },
];

const decisions: Decision[] = [
  {
    title: "Land raw data first, transform second",
    chose: "Write each API page to raw storage untouched, then transform it as a separate step.",
    alt: "Transforming inside the connector and loading only the clean result.",
    why: "When a mapping is wrong or a source changes shape, the fix is a rerun of the transform. It needs no API calls, spends no rate limit, and does not depend on the source still serving old data.",
    cost: "More storage, and a second step to operate and monitor.",
  },
  {
    title: "Merge on a natural key",
    chose: "Load through a merge keyed on source, account, campaign and date.",
    alt: "Appending every sync and removing duplicates inside the report queries.",
    why: "A retry and a re-pull both become harmless: the same key replaces the same row. Every query against the warehouse stays simple.",
    cost: "A merge costs more than an append. Partitioning by date limits each merge to the days being synced.",
  },
  {
    title: "Re-pull a trailing window on every sync",
    chose: "Sync forward from the cursor, and also re-pull the last few days. The window is set per connector.",
    alt: "A strict “only what is new since the cursor”, and a full refresh on every run.",
    why: "The strict cursor misses revised numbers. The full refresh is slow and burns the rate limit. The window catches revisions at a known, bounded cost.",
    cost: "The same days are fetched more than once. The merge makes that safe, not free.",
  },
];

export default function DataConnectorsDoc() {
  return (
    <div className="wrap doc">
      <TopBar />

      <main id="main">
        <header className="doc-head row">
          <div className="side">
            <dl className="meta">
              <div>
                <dt className="label">Type</dt>
                <dd className="data">Reference design</dd>
              </div>
              <div>
                <dt className="label">Stack</dt>
                <dd className="data">TypeScript, Node.js, BigQuery</dd>
              </div>
              <div>
                <dt className="label">Basis</dt>
                <dd className="data">Contract work building production connectors</dd>
              </div>
            </dl>
          </div>
          <div>
            <p className="label kicker">
              <Link href="/#work">System design</Link> · 1.4
            </p>
            <h1>{title}</h1>
            <p className="lede">{dek}</p>
            <div className="note">
              <p className="label">About this document</p>
              <p>
                I built production connectors of this kind on contract. That client’s system is confidential, so this is
                my own design for the same class of problem. It does not describe theirs.
              </p>
            </div>
          </div>
        </header>

        <section className="section row" aria-labelledby="s1">
          <p className="num">§1</p>
          <div className="prose">
            <h2 id="s1">Context</h2>
            <p>
              A marketing team runs campaigns on several platforms. Each platform has its own API, its own login flow,
              its own way of paging through results and its own names for the same thing. The team wants one report:
              spend, clicks and conversions across every platform, by day.
            </p>
            <p>
              The obvious build is one script per platform, each writing to its own table. It works for three sources.
              It does not work for thirty, because every script solves retries, rate limits and duplicates again, each
              time slightly differently.
            </p>
          </div>
        </section>

        <section className="section row" aria-labelledby="s2">
          <p className="num">§2</p>
          <div className="prose">
            <h2 id="s2">Constraints</h2>
            <ul className="dash">
              <li>
                The sources are not ours. They rate-limit, time out, expire tokens and rename fields without notice.
              </li>
              <li>
                The numbers move. Ad platforms revise recent days as late conversions are attributed, so the figure
                loaded yesterday for last Tuesday can be wrong today.
              </li>
              <li>
                Every sync must be safe to run twice. Retries are normal, and a repeat must never double the spend in a
                report.
              </li>
              <li>A new connector should take days, not weeks. Only the API-specific part should be new code.</li>
            </ul>
          </div>
        </section>

        <section className="section row" aria-labelledby="s3">
          <p className="num">§3</p>
          <div className="prose">
            <h2 id="s3">The design question</h2>
            <p className="question">How do many unreliable sources become one report you can trust?</p>
          </div>
        </section>

        <section className="section row" aria-labelledby="s4">
          <p className="num">§4</p>
          <div className="prose">
            <h2 id="s4">Architecture</h2>
            <p>
              Many connectors feed one pipeline, one warehouse and one report. Nothing downstream of the connector
              knows which source a record came from, except as a value in a column.
            </p>
            <figure className="fig">
              <div className="frame">
                <Diagram def={connectorsDiagram} />
              </div>
              <figcaption>
                Fig. 1. One sync, end to end. Retries, rate limiting, state and logging live in a shared runtime around
                the connector, not inside it.
              </figcaption>
            </figure>
            <dl className="parts">
              {parts.map((part) => (
                <div key={part.name}>
                  <dt className="label">{part.name}</dt>
                  <dd>{part.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="section row" aria-labelledby="s5">
          <p className="num">§5</p>
          <div className="prose">
            <h2 id="s5">Decisions</h2>
            <Decisions items={decisions} section={5} />
          </div>
        </section>

        <section className="section row" aria-labelledby="s6">
          <p className="num">§6</p>
          <div className="prose">
            <h2 id="s6">What happens when it fails</h2>
            <p>Six moments in the life of one sync. Step through them, or press play.</p>
            <DiagramWalkthrough def={connectorsDiagram} steps={connectorsSteps} />
          </div>
        </section>

        <section className="section row" aria-labelledby="s7">
          <p className="num">§7</p>
          <div className="prose">
            <h2 id="s7">What this design does not do</h2>
            <ul className="dash">
              <li>
                It is batch. Data is as fresh as the last sync, which suits daily reporting and does not suit live
                bidding.
              </li>
              <li>
                It trusts the natural key. If a platform reuses or changes its IDs, that source needs a different key.
              </li>
              <li>
                It does not hide an outage. If a platform is down, its part of the report goes stale, and the report
                should say how stale.
              </li>
              <li>
                It is not always worth building. For common sources at modest volume, a managed tool does this job.
                Building it makes sense when the connectors are the product, or the sources are unusual.
              </li>
            </ul>
          </div>
        </section>

        <section className="section row" aria-labelledby="s8">
          <p className="num">§8</p>
          <div className="prose">
            <h2 id="s8">What I would measure</h2>
            <ul className="dash">
              <li>Freshness per source: the age of the newest row, against the schedule.</li>
              <li>Sync success rate, split by cause: rate limit, auth, schema, our own bugs.</li>
              <li>Rows changed by re-pulls, which shows whether the trailing window is the right length.</li>
              <li>Time to add a connector, from first API call to first correct report.</li>
            </ul>
          </div>
        </section>

        <p className="doc-nav">
          <Link href="/#work">All systems</Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
