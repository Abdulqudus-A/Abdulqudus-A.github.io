import type { Metadata } from "next";
import Link from "next/link";
import { Decisions, type Decision } from "../../../components/Decisions";
import { Footer } from "../../../components/Footer";
import { TopBar } from "../../../components/TopBar";
import { Diagram } from "../../../components/diagrams/Diagram";
import { DiagramWalkthrough } from "../../../components/diagrams/DiagramWalkthrough";
import { registrationDiagram, registrationSteps } from "../../../content/diagrams/registration";
import { docNumber } from "../../../content/site";

const title = "One registration, end to end";
const dek =
  "How a SIM registration gets from an agent’s device to an active line. The agent gets an answer in one request. The identity checks, the record keeping and the activation happen behind it, and each can fail without losing the registration or doing it twice.";

export const metadata: Metadata = {
  title,
  description: dek,
};

const parts: { name: string; text: string }[] = [
  {
    name: "Agent app",
    text: "Captures the customer’s details, fingerprints and portrait on a registered device, and gives each registration its own reference before it is sent.",
  },
  {
    name: "Intake API",
    text: "The only synchronous step. It checks the request, the agent and the device, refuses a reference it has seen before, stores the registration and queues it.",
  },
  {
    name: "Records and audit",
    text: "A tracking row per registration in the relational database holds its state. The full payload, the log of each check and every external request and response go to the document store.",
  },
  {
    name: "Verification",
    text: "A worker that checks the identity against the national database, compares the live portrait with the one on file, applies the limits on age and on lines per person, and then routes the registration by its type.",
  },
  { name: "National ID", text: "The national identity service. Outside the platform, and sometimes offline." },
  {
    name: "Record writer",
    text: "Turns a verified registration into the permanent records: the subscriber, the number, the biometrics and their audit trail.",
  },
  {
    name: "Review desk",
    text: "People. When review is switched on, a reviewer approves or rejects a record before it can be activated.",
  },
  {
    name: "Activation",
    text: "Calls the operator’s systems to make the line live, and records the result from each one separately.",
  },
  { name: "Network", text: "The operator’s own provisioning and billing systems. Outside the platform." },
  {
    name: "Parked records and retries",
    text: "Where work waits when a dependency is down: registrations parked with a reason, and delayed jobs that retry activation on a widening schedule.",
  },
];

const decisions: Decision[] = [
  {
    title: "Accept in the request, decide on a queue",
    chose:
      "The API does only what it can finish in the request: check the payload, the agent and the device, store the registration and queue it. Identity checks and activation run afterwards.",
    alt: "Verifying the identity and activating the line inside the request.",
    why: "The national identity service and the operator’s systems set their own pace. Tying the agent’s screen to them would turn every slow minute on their side into a failed registration on ours.",
    cost: "The agent leaves with “submitted”, not “active”. The platform needs a status the agent can check, a message to the customer when the line is live, and a way to say why when it is refused.",
  },
  {
    title: "The device names the registration",
    chose:
      "Each registration carries a reference created on the device. The API refuses a reference it has already stored, and every later stage keys its work on it.",
    alt: "Letting the server assign an ID when the request arrives.",
    why: "On a weak connection the app cannot tell a lost request from a lost reply, so it sends again. With a server-side ID that retry would be a second registration.",
    cost: "Devices have to generate references that never collide, and keep the same one when they retry.",
  },
  {
    title: "One verification stage for every kind of registration",
    chose:
      "New lines, re-registrations, SIM replacements and the corporate variants all pass through the same verification worker before they split by type.",
    alt: "Each registration type carrying its own copy of the identity checks.",
    why: "The rules that matter most, who the person is and what they are allowed to hold, live in one place and change in one place.",
    cost: "That stage is a shared bottleneck. A slow identity service backs up every type at once, and a mistake there reaches all of them.",
  },
  {
    title: "Park the record when the identity service is down",
    chose:
      "If the national service does not answer, the registration is parked with a reason code and handed to a retry job. It resumes from verification when the service is back.",
    alt: "Failing the registration and asking the customer to come back.",
    why: "The outage is not the customer’s fault and it usually passes. The fingerprints captured this morning are still good this afternoon.",
    cost: "A parked record is a promise. It needs its own monitoring, a limit on how long it may wait, and someone to look at the ones that never clear.",
  },
  {
    title: "A lock per person around the limit check",
    chose:
      "Before counting how many lines a person holds, the worker takes a short-lived lock on that identity. A registration that cannot get the lock is delayed and tried again.",
    alt: "Counting without a lock, or leaving it to a database constraint.",
    why: "The count covers lines that are active, pending and still in flight. Two registrations for the same person, started seconds apart in different shops, would each see room for one more.",
    cost: "The lock expires, so the work inside it has to finish well within that time. Under contention some registrations wait, and the wait has to be visible.",
  },
  {
    title: "Remember each activation step separately",
    chose:
      "The activation job records the outcome from each of the operator’s systems on its own. A retry calls only the ones still outstanding, and a line that is already active skips them all. The job is keyed on the registration and the number, so the same activation cannot be queued twice.",
    alt: "Retrying the whole activation from the first call.",
    why: "Repeating a call that already succeeded is wasted work at best and a duplicate request on the operator’s side at worst.",
    cost: "The job carries state that has to stay truthful. A system that reports success and fails later needs its own check.",
  },
  {
    title: "Retry on a widening schedule, for days",
    chose:
      "Failed activations are retried as delayed jobs: every few minutes at first, then hourly, then daily, up to a fixed number of attempts.",
    alt: "A handful of quick retries, then a dead-letter queue for someone to clear by hand.",
    why: "Most failures clear within the hour. The rest are outages that can last a day, and a registration should outlive them without an engineer.",
    cost: "A line can stay pending for days. The schedule is a guess about how the operator’s systems fail, and it has to be revisited when they change.",
  },
];

export default function EndToEndRegistrationDoc() {
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
                <dt className="label">Scale</dt>
                <dd className="data">Hundreds of thousands of records a day</dd>
              </div>
              <div>
                <dt className="label">Stack</dt>
                <dd className="data">TypeScript, NestJS, RabbitMQ, BullMQ, Redis, PostgreSQL, MongoDB</dd>
              </div>
            </dl>
          </div>
          <div>
            <p className="label kicker">
              <Link href="/#work">System design</Link> · {docNumber("end-to-end-registration")}
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
              In Nigeria a SIM card may only be activated for a person whose identity has been checked against the
              national identity database. An operator’s agents register customers in shops and in the field, on handheld
              devices, often on a poor connection. Seamfix builds the platform that takes those registrations, checks
              them and activates the line.
            </p>
            <p>
              This document follows one registration through that platform. It describes the design at the level of its
              patterns. Service names, business rules and thresholds are left out on purpose.
            </p>
            <p>
              The platform is the work of a team. Since 2024 my part has run along this whole path: the intake and
              verification services, the activation and retry path, corporate and bulk registration, the checks around
              SIM replacement, and the integration with the national identity service.
            </p>
          </div>
        </section>

        <section className="section row" aria-labelledby="s2">
          <p className="num">§2</p>
          <div className="prose">
            <h2 id="s2">Constraints</h2>
            <ul className="dash">
              <li>
                The agent is standing in front of a customer. The answer has to come back in seconds, on a weak
                connection.
              </li>
              <li>
                The national identity service is outside the platform’s control. It is slow at times and unavailable at
                others.
              </li>
              <li>
                A person may hold only a limited number of lines, and two agents can register the same person at the
                same moment.
              </li>
              <li>
                Activation depends on several of the operator’s own systems, and any of them can be down for hours.
              </li>
              <li>Messages are delivered at least once, so every step can be asked to run again.</li>
              <li>
                Every decision has to be explainable later: who registered whom, on which device, and what each check
                returned.
              </li>
            </ul>
          </div>
        </section>

        <section className="section row" aria-labelledby="s3">
          <p className="num">§3</p>
          <div className="prose">
            <h2 id="s3">The design question</h2>
            <p className="question">
              How do you accept a registration in seconds when the checks it depends on can take minutes, or be down
              for a day?
            </p>
          </div>
        </section>

        <section className="section row" aria-labelledby="s4">
          <p className="num">§4</p>
          <div className="prose">
            <h2 id="s4">Architecture</h2>
            <p>
              A registration is accepted first and decided afterwards. The request is checked, stored and acknowledged.
              Everything else happens on queues, one stage at a time, and each stage records what it did before it
              hands over.
            </p>
            <figure className="fig">
              <div className="frame">
                <Diagram def={registrationDiagram} />
              </div>
              <figcaption>
                Fig. 1. The path of one registration, left to right. The two outlined boxes at the top are outside the
                platform. The bottom row is where a registration waits when one of them is down.
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
            <h2 id="s6">One registration, step by step</h2>
            <p>
              Nine steps, including a request that arrives twice, an identity service that is down, and an activation
              that fails part of the way through.
            </p>
            <DiagramWalkthrough def={registrationDiagram} steps={registrationSteps} />
          </div>
        </section>

        <section className="section row" aria-labelledby="s7">
          <p className="num">§7</p>
          <div className="prose">
            <h2 id="s7">Limits</h2>
            <ul className="dash">
              <li>
                Eventual consistency is visible to people. An agent sees “submitted” and a customer waits for a
                message. The design depends on that message arriving.
              </li>
              <li>
                At-least-once delivery puts the burden on every handler. One handler that is not safe to repeat is
                enough to create a duplicate.
              </li>
              <li>
                Two stores mean two writes. The API stores the payload and the tracking row separately and removes the
                first if the second fails. A crash between the two still needs a job that reconciles them.
              </li>
              <li>
                Long retries can hide problems. A registration that will fail on its last attempt looks the same as one
                that will succeed on the next, unless the reason is recorded with every attempt.
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
