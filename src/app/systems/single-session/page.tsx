import type { Metadata } from "next";
import Link from "next/link";
import { Decisions, type Decision } from "../../../components/Decisions";
import { Footer } from "../../../components/Footer";
import { TopBar } from "../../../components/TopBar";
import { Diagram } from "../../../components/diagrams/Diagram";
import { DiagramWalkthrough } from "../../../components/diagrams/DiagramWalkthrough";
import { sessionDiagram, sessionSteps } from "../../../content/diagrams/session";
import { docNumber } from "../../../content/site";

const title = "One account, one session";
const dek =
  "An account can be signed in on one device at a time. The rule was built once, in the auth service and a shared guard, and then switched on across more than eight services instead of being rebuilt in each product.";

export const metadata: Metadata = {
  title,
  description: dek,
};

const parts: { name: string; text: string }[] = [
  { name: "Device A, Device B", text: "The same account, on two devices at once." },
  {
    name: "Auth service",
    text: "The only place a session is created. It issues the signed token and records which session is the current one for the account.",
  },
  {
    name: "Session cache",
    text: "One small entry per account: the ID of its current session, with an expiry. It is shared by every service.",
  },
  {
    name: "Any service",
    text: "Each service validates tokens itself. A shared guard adds one comparison to that check: the session in the token against the session in the cache.",
  },
];

const decisions: Decision[] = [
  {
    title: "A session ID inside the token, and one entry per account",
    chose:
      "Sign-in creates a session ID, puts it in the signed token and stores it as the account’s current session. A request is valid only if the two agree.",
    alt: "A server-side session table that every request looks up, or a list of revoked tokens.",
    why: "The services already trusted signed tokens and held no session state. This adds one small lookup and nothing else. Ending a session is an overwrite, not a search for every token that has to die.",
    cost: "A token on its own no longer proves anything. Every authenticated request now depends on the cache being there.",
  },
  {
    title: "The newest sign-in wins",
    chose: "A second sign-in replaces the first. The older device finds out on its next request.",
    alt: "Refusing the second sign-in while a session exists.",
    why: "Devices get lost, crash and run out of battery. If the old session blocked the new one, a person with a dead phone would be locked out until the session expired or someone intervened.",
    cost: "Whoever has the credentials can push the rightful user out. That is at least visible: the user is told, on their next action, that the account was opened elsewhere.",
  },
  {
    title: "Enforce it in a shared guard, in every service",
    chose:
      "The comparison lives in one library that every service already uses to check tokens. Each service enforces the rule on its own requests.",
    alt: "Checking only in the auth service or at a gateway, or letting each product implement it.",
    why: "Services are reached directly, so a check in one place would leave the others open. One library means one behaviour, and one fix reaches everyone.",
    cost: "The rule is only as complete as the rollout. Every service needs the library, the cache connection and the same version, and a service left behind is a way around it.",
  },
  {
    title: "A switch per tenant, and named exemptions",
    chose:
      "The rule is turned on tenant by tenant. Guest access and accounts with a specific role, such as integrations that sign in from many places, are exempt.",
    alt: "On for everyone from the first release.",
    why: "It changes how people work. Operators could adopt it when their own teams were ready, and a problem in one could be switched off without a deployment.",
    cost: "An exemption is a hole by design. Who holds that role has to be reviewed like any other privilege.",
  },
  {
    title: "The session lives as long as it is used",
    chose: "Each accepted request pushes the session’s expiry forward. An idle session lapses on its own.",
    alt: "A fixed lifetime from the moment of sign-in.",
    why: "People in the middle of work should not be signed out by a clock. People who walked away from a device should be.",
    cost: "A write to the cache on every request, and a session that never ends for a device that never stops calling.",
  },
];

export default function SingleSessionDoc() {
  return (
    <div className="wrap doc">
      <TopBar />

      <main id="main">
        <header className="doc-head row">
          <div className="side">
            <dl className="meta">
              <div>
                <dt className="label">Built at</dt>
                <dd className="data">Seamfix</dd>
              </div>
              <div>
                <dt className="label">Reach</dt>
                <dd className="data">The auth service, a shared guard, 8+ services and the product front-ends</dd>
              </div>
              <div>
                <dt className="label">Stack</dt>
                <dd className="data">TypeScript, NestJS, Redis, signed tokens (JWT)</dd>
              </div>
            </dl>
          </div>
          <div>
            <p className="label kicker">
              <Link href="/#work">System design</Link> · {docNumber("single-session")}
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
              The people who register subscribers act with real authority: what they submit becomes someone’s legal
              identity on a network. Their accounts are meant to be personal. A login that is shared, across a shop
              or between shifts, means nobody can say who did what.
            </p>
            <p>
              The platform is a set of services behind several products, and each service checks signed tokens for
              itself. A token is valid until it expires, wherever it is used. So one account could be active on any
              number of devices at once.
            </p>
            <p>
              I implemented the rule in the auth service and the shared guard, and rolled it out across the platform
              services and the product front-ends. This document describes the design at the level of its patterns.
              Key formats, role names and settings are left out on purpose.
            </p>
          </div>
        </section>

        <section className="section row" aria-labelledby="s2">
          <p className="num">§2</p>
          <div className="prose">
            <h2 id="s2">Constraints</h2>
            <ul className="dash">
              <li>There are many services and no single door. Each one is called directly and validates tokens itself.</li>
              <li>Tokens are signed and self-contained. Nothing could revoke one before it expired.</li>
              <li>The check runs on every authenticated request, so it has to cost almost nothing.</li>
              <li>
                Several products and several operators share the platform. They could not all change on the same day.
              </li>
              <li>Some accounts legitimately sign in from many places: integrations and guest access.</li>
            </ul>
          </div>
        </section>

        <section className="section row" aria-labelledby="s3">
          <p className="num">§3</p>
          <div className="prose">
            <h2 id="s3">The design question</h2>
            <p className="question">
              How do you end a session that lives in a signed token, in every service at once, without making every
              request slow?
            </p>
          </div>
        </section>

        <section className="section row" aria-labelledby="s4">
          <p className="num">§4</p>
          <div className="prose">
            <h2 id="s4">Architecture</h2>
            <p>
              The token keeps doing what it did. One fact is added beside it: which session is the current one for this
              account. Signing in sets that fact. Every request is checked against it.
            </p>
            <figure className="fig">
              <div className="frame">
                <Diagram def={sessionDiagram} />
              </div>
              <figcaption>
                Fig. 1. Sign-in goes through the auth service, which records the current session. Requests go straight
                to a service, which compares.
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
            <h2 id="s6">Two devices, step by step</h2>
            <p>Five steps: a sign-in, a normal request, a second sign-in, and the two ways a session ends.</p>
            <DiagramWalkthrough def={sessionDiagram} steps={sessionSteps} />
          </div>
        </section>

        <section className="section row" aria-labelledby="s7">
          <p className="num">§7</p>
          <div className="prose">
            <h2 id="s7">Limits</h2>
            <ul className="dash">
              <li>
                It limits an account to one session. It does not prove that the person using that session is the
                account’s owner. That takes a second factor or a biometric at sign-in.
              </li>
              <li>
                The cache is now part of authentication. It has to be as available as the services that depend on it.
              </li>
              <li>
                The older device learns it has been signed out only when it next makes a request. A screen left open
                still shows what was on it.
              </li>
              <li>
                A shared rule is only shared if every service runs the same version of it. The rollout needs a list,
                and the list needs checking.
              </li>
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
