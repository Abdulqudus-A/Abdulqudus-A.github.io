import type { Metadata } from "next";
import Link from "next/link";
import { Decisions, type Decision } from "../../../components/Decisions";
import { Footer } from "../../../components/Footer";
import { TopBar } from "../../../components/TopBar";
import { Diagram } from "../../../components/diagrams/Diagram";
import { DiagramWalkthrough } from "../../../components/diagrams/DiagramWalkthrough";
import { crmDiagram, crmSteps } from "../../../content/diagrams/crm";

const title = "One database, many dealerships";
const dek =
  "A CRM for a direct-sales network. Eleven dealerships in three European countries share one Postgres database, and the database itself decides who can see what.";

export const metadata: Metadata = {
  title,
  description: dek,
};

const parts: { name: string; text: string }[] = [
  { name: "Browser app", text: "The whole interface. It queries the database through the data API and holds no secrets." },
  { name: "Auth", text: "Signs people in and issues the token that identifies them on every request." },
  {
    name: "Data API",
    text: "Generated from the schema. It runs each query as the signed-in person, not as a privileged service.",
  },
  {
    name: "Row policies",
    text: "Rules attached to every table. They decide, row by row, what a query may read or change, from the caller’s dealership, role and ownership.",
  },
  {
    name: "Tables",
    text: "Customers, leads, sales, invoices, commissions and the consultants themselves, each row tagged with its dealership.",
  },
  {
    name: "Server functions",
    text: "Privileged work: inviting a consultant, generating invoices and receipts, sending reminders, calculating overrides. They use the service role.",
  },
  { name: "Scheduler", text: "Runs the daily reminders and the weekly commission calculation." },
];

const decisions: Decision[] = [
  {
    title: "One database, one schema, a dealership key on every row",
    chose:
      "A dealerships table, and a foreign key to it on every business table. A consultant belongs to exactly one dealership.",
    alt: "A separate database, or a separate schema, for each dealership.",
    why: "The dealerships all work the same way. One migration updates all of them, and adding a dealership means adding a row, not running a deployment.",
    cost: "Isolation rests on every policy being right. One dealership’s heavy query slows the others. Restoring a single dealership from a backup is hard.",
  },
  {
    title: "Enforce isolation in the database, not in the application",
    chose: "Row-level security on every table. The policies check the caller’s dealership before anything else.",
    alt: "Adding a dealership filter to each query in application code.",
    why: "The browser reaches the database through a generated API, so there is no server code to put a filter in. A policy applies to every query, including the one somebody forgot to filter.",
    cost: "Policies are easy to get subtly wrong and hard to see. They run for every row, so they have to be cheap and indexed. “Why can’t I see this record” becomes harder to debug.",
  },
  {
    title: "Roles in their own table, checked through database functions",
    chose:
      "Admin and consultant roles live in a separate table that only admins can change. Policies call a function to check the role, and the function runs with its owner’s rights.",
    alt: "A role column on the consultant’s own profile.",
    why: "People can edit their own profile. If the role lived there, a consultant could make themselves an admin. Running the check as a function also lets a policy on one table consult another without recursing.",
    cost: "One more lookup on every check.",
  },
  {
    title: "Money calculations that are safe to repeat",
    chose:
      "The weekly override run writes one row per person per week with an upsert. The amount is last week’s sales by that person’s recruits, net of VAT, times the override rate for their level.",
    alt: "Inserting a new commission row on every run.",
    why: "Scheduled jobs get retried and get run by hand. A repeat must not pay anyone twice.",
    cost: "A rerun overwrites the week’s row, so there is no record of what an earlier run calculated.",
  },
  {
    title: "Promotion is proposed by the system and confirmed by a person",
    chose:
      "The dashboard measures each consultant against the next level’s criteria: sets delivered, active recruits, and sales over the last year. Those who qualify are listed for an admin, who confirms. Level and commission rate change together.",
    alt: "Promoting automatically when the numbers are met.",
    why: "A promotion changes what someone is paid and who reports to them. A person signs it off.",
    cost: "Eligibility is worked out in the browser, so today it is advice to the admin, not a rule the database enforces.",
  },
];

export default function MultiTenantCrmDoc() {
  return (
    <div className="wrap doc">
      <TopBar />

      <main id="main">
        <header className="doc-head row">
          <div className="side">
            <dl className="meta">
              <div>
                <dt className="label">Client</dt>
                <dd className="data">Confidential</dd>
              </div>
              <div>
                <dt className="label">Scale</dt>
                <dd className="data">11 dealerships, 3 countries</dd>
              </div>
              <div>
                <dt className="label">Stack</dt>
                <dd className="data">TypeScript, React, Supabase (Postgres, Auth, Edge Functions)</dd>
              </div>
            </dl>
          </div>
          <div>
            <p className="label kicker">
              <Link href="/#work">System design</Link> · 1.5
            </p>
            <h1>{title}</h1>
            <p className="lede">{dek}</p>
          </div>
        </header>

        <section className="section row" aria-labelledby="s1">
          <p className="num">§1</p>
          <div className="prose">
            <h2 id="s1">Context</h2>
            <p>
              A direct-sales network sells through consultants. Each dealership has its own consultants, customers,
              leads and sales. Consultants are organised in teams, move up through six levels, and earn commission both
              on their own sales and on the sales of the people they recruited.
            </p>
            <p>
              The CRM puts all of that in one place: the customer record, the lead pipeline, the sale from order to
              delivery, invoices and receipts, recruitment, and the commission that follows from it.
            </p>
          </div>
        </section>

        <section className="section row" aria-labelledby="s2">
          <p className="num">§2</p>
          <div className="prose">
            <h2 id="s2">Constraints</h2>
            <ul className="dash">
              <li>A dealership must never see another dealership’s customers, leads or sales.</li>
              <li>
                The browser talks to the database through a generated API. There is no application server to hide a
                missing filter behind.
              </li>
              <li>
                Inside a dealership, access follows the hierarchy. A consultant sees their own work. An admin sees the
                dealership.
              </li>
              <li>
                Commission depends on levels and on who recruited whom, and a calculation that pays people has to be
                safe to run twice.
              </li>
              <li>It has to stay simple to change: one schema, one deployment, one set of migrations.</li>
            </ul>
          </div>
        </section>

        <section className="section row" aria-labelledby="s3">
          <p className="num">§3</p>
          <div className="prose">
            <h2 id="s3">The design question</h2>
            <p className="question">
              How do eleven dealerships share one database without ever seeing each other’s customers?
            </p>
          </div>
        </section>

        <section className="section row" aria-labelledby="s4">
          <p className="num">§4</p>
          <div className="prose">
            <h2 id="s4">Architecture</h2>
            <p>
              There are two ways to reach the data. Almost everything goes through the row policies. A small amount of
              privileged work goes around them, and that path needs its own discipline.
            </p>
            <figure className="fig">
              <div className="frame">
                <Diagram def={crmDiagram} />
              </div>
              <figcaption>
                Fig. 1. Two paths to the tables. The top path is checked by the row policies on every query. The bottom
                path uses the service role and is not.
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
            <Decisions items={decisions} section={5} altLabel="Instead of" />
          </div>
        </section>

        <section className="section row" aria-labelledby="s6">
          <p className="num">§6</p>
          <div className="prose">
            <h2 id="s6">Who can see what, step by step</h2>
            <p>Six requests, including the one that should return nothing and the one the policies never see.</p>
            <DiagramWalkthrough def={crmDiagram} steps={crmSteps} />
          </div>
        </section>

        <section className="section row" aria-labelledby="s7">
          <p className="num">§7</p>
          <div className="prose">
            <h2 id="s7">What I would change</h2>
            <ul className="dash">
              <li>
                Test the policies as code. A suite that signs in as two dealerships and proves neither can read the
                other, run on every migration.
              </li>
              <li>
                Scope server functions by default. A shared helper that will not run without a dealership, so a
                function cannot forget the filter the policies would have applied.
              </li>
              <li>
                Move promotion eligibility into the database, so the criteria are a rule and not a calculation in the
                browser.
              </li>
              <li>Keep a history of commission runs, so a rerun adds a record instead of replacing one.</li>
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
