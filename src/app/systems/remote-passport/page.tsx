import type { Metadata } from "next";
import Link from "next/link";
import { Decisions, type Decision } from "../../../components/Decisions";
import { Footer } from "../../../components/Footer";
import { TopBar } from "../../../components/TopBar";
import { Diagram } from "../../../components/diagrams/Diagram";
import { DiagramWalkthrough } from "../../../components/diagrams/DiagramWalkthrough";
import { passportDiagram, passportSteps } from "../../../content/diagrams/passport";
import { docNumber } from "../../../content/site";

const title = "A passport application without the embassy";
const dek =
  "A reference design for taking passport applications from citizens abroad, entirely online. The hard part is not the form. It is deciding that the person holding the phone is the person in the record, when no official will ever see them.";

export const metadata: Metadata = {
  title,
  description: dek,
};

const parts: { name: string; text: string }[] = [
  {
    name: "Applicant",
    text: "A citizen abroad, on their own phone or laptop. Everything the state learns about them arrives through this camera and this form.",
  },
  {
    name: "Applications",
    text: "The API and the state machine behind it. An application is always in exactly one state, and only a listed event can move it to the next.",
  },
  {
    name: "Payments",
    text: "The payment provider. It confirms by callback, some time after the applicant pays, and sometimes more than once.",
  },
  {
    name: "Document vault",
    text: "Encrypted storage for scans and face images. Files are reached through links that expire in minutes, never through public ones.",
  },
  {
    name: "Identity checks",
    text: "A worker that runs the checks in order: photo quality, liveness, then a face comparison against the registry’s record.",
  },
  {
    name: "Face engine",
    text: "The biometric engine that scores liveness and similarity. Treated as a dependency that can be slow, wrong or replaced.",
  },
  {
    name: "Registry",
    text: "The state’s existing record of the citizen: the previous passport or the national ID, with its photograph.",
  },
  {
    name: "Officer desk",
    text: "Consular officers. They decide the cases the system will not decide alone, and they sign off every approval.",
  },
  { name: "Issuance", text: "Producing the booklet and delivering it. Outside this design." },
];

const decisions: Decision[] = [
  {
    title: "The server decides whether the person was live",
    chose:
      "The liveness check runs as a session opened by the server. The result comes back signed by the liveness service, tied to that session and that applicant, and usable once. The backend verifies it before anything else happens.",
    alt: "Running liveness in the app and sending the backend a “passed” flag.",
    why: "The app runs on the applicant’s device, the one machine in the system that an attacker fully controls. A flag from it proves nothing.",
    cost: "One more service and one more round trip, and capture that fails outright when that service is down.",
  },
  {
    title: "Three outcomes for a face comparison, not two",
    chose:
      "A similarity score falls into one of three bands: clear match, clear mismatch, or uncertain. Only the first passes on its own. Uncertain goes to an officer, with both images side by side.",
    alt: "One threshold: above it passes, below it fails.",
    why: "Faces change in ten years and cameras differ. A single line either rejects honest people or lets look-alikes through. The middle band puts human attention where the machine is least sure.",
    cost: "Officers’ time, a queue that needs staffing, and bands that have to be tuned from real outcomes and not guessed once.",
  },
  {
    title: "Check the photo at capture, not at production",
    chose:
      "The passport photo is tested against the international photo standard on the device and again on the server, while the applicant is still there to retake it.",
    alt: "Accepting any photo and rejecting the bad ones during review.",
    why: "A photo rejected a week later costs a week and an email. One rejected in two seconds costs a retake.",
    cost: "Strict rules frustrate people with poor cameras or poor light, so the app has to say what is wrong and how to fix it.",
  },
  {
    title: "An application is a state machine with a log",
    chose:
      "Every application is in one named state. Each move is an event appended to a log: who, what and when. The current state follows from the log.",
    alt: "A row with status columns, updated in place.",
    why: "“Why was this person issued a passport” needs an answer years later. An updated row forgets; a log does not. It also makes picking up on another device simple.",
    cost: "More storage and more thought. A question like “everything waiting on payment” needs a summary table kept in step with the log.",
  },
  {
    title: "Payment confirmations are safe to receive twice",
    chose:
      "Each payment attempt has its own reference. A callback is verified, matched to that reference and applied once. A repeat changes nothing.",
    alt: "Marking the application paid on the first callback that mentions it.",
    why: "Providers retry callbacks, and applicants press pay twice. Neither should produce two payments or move an application forward twice.",
    cost: "The callback that never arrives still needs a job that asks the provider what happened.",
  },
  {
    title: "Sensitive files behind short-lived links, with an end date",
    chose:
      "Scans and face images are encrypted at rest, served only through links that expire in minutes, and deleted on a schedule once the application is closed.",
    alt: "Keeping everything indefinitely in case it is needed.",
    why: "The safest copy of an identity document is the one that no longer exists. What has to be kept is the decision and its trail of evidence, not every raw image.",
    cost: "Each kind of data needs a retention period with a legal basis, and deletion has to be provable.",
  },
];

export default function RemotePassportDoc() {
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
                <dt className="label">Basis</dt>
                <dd className="data">A remote e-passport platform built for a foreign ministry</dd>
              </div>
              <div>
                <dt className="label">Themes</dt>
                <dd className="data">Liveness, face comparison, human review, audit, data retention</dd>
              </div>
            </dl>
          </div>
          <div>
            <p className="label kicker">
              <Link href="/#work">System design</Link> · {docNumber("remote-passport")}
            </p>
            <h1>{title}</h1>
            <p className="lede">{dek}</p>
            <div className="note">
              <p className="label">About this document</p>
              <p>
                At Seamfix I built a remote e-passport platform for Benin’s Ministry of Foreign Affairs. That system is
                not mine to publish, so this is my own design for the same problem. It does not describe theirs.
              </p>
            </div>
          </div>
        </header>

        <section className="section row" aria-labelledby="s1">
          <p className="num">§1</p>
          <div className="prose">
            <h2 id="s1">Context</h2>
            <p>
              A citizen living abroad needs a passport. The nearest embassy may be in another city or another country,
              and a visit costs days of travel and time off work. A remote service lets them apply from a phone.
            </p>
            <p>
              The state still has to be sure who it is issuing a passport to. In person, an officer looks at the
              applicant and at their documents. Online, both arrive as images from a device the state does not control.
            </p>
          </div>
        </section>

        <section className="section row" aria-labelledby="s2">
          <p className="num">§2</p>
          <div className="prose">
            <h2 id="s2">Constraints</h2>
            <ul className="dash">
              <li>Nobody sees the applicant. Everything known about them arrives through their own camera.</li>
              <li>
                A passport is worth attacking. Expect printed photos, replayed video, masks and other people’s
                documents.
              </li>
              <li>The photo has to meet the international standard for passport photos, or the booklet cannot be made.</li>
              <li>
                An application has many steps. Applicants stop and come back, on phones, on poor connections, from many
                time zones.
              </li>
              <li>Payment is confirmed asynchronously, from many countries, and sometimes twice.</li>
              <li>The data is as sensitive as data gets: identity documents and faces.</li>
              <li>Any decision has to be explainable years later.</li>
            </ul>
          </div>
        </section>

        <section className="section row" aria-labelledby="s3">
          <p className="num">§3</p>
          <div className="prose">
            <h2 id="s3">The design question</h2>
            <p className="question">How does a state say yes to someone it never meets?</p>
          </div>
        </section>

        <section className="section row" aria-labelledby="s4">
          <p className="num">§4</p>
          <div className="prose">
            <h2 id="s4">Architecture</h2>
            <p>
              The system never decides alone that a person should get a passport. It gathers evidence, scores it, and
              puts the uncertain cases in front of an officer. What it does decide alone is what to reject early and
              what to ask the applicant to do again.
            </p>
            <figure className="fig">
              <div className="frame">
                <Diagram def={passportDiagram} />
              </div>
              <figcaption>
                Fig. 1. An application moves left to right. The outlined boxes are outside the system: the payment
                provider, the face engine, the state’s registry and issuance.
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
            <h2 id="s6">One application, step by step</h2>
            <p>
              Eight steps, including a payment confirmed twice, a face engine that is down, and a comparison the
              machine cannot settle.
            </p>
            <DiagramWalkthrough def={passportDiagram} steps={passportSteps} />
          </div>
        </section>

        <section className="section row" aria-labelledby="s7">
          <p className="num">§7</p>
          <div className="prose">
            <h2 id="s7">What this design does not solve</h2>
            <ul className="dash">
              <li>
                Liveness is an arms race. The design assumes the check will be beaten one day, and keeps a person in
                the loop for that reason.
              </li>
              <li>
                Face comparison does not perform equally well for everyone. The bands have to be measured group by
                group, not on average, and the officer is there partly because of that.
              </li>
              <li>
                A first-time applicant has no photograph on record to compare with. They need a different anchor: a
                document check and, in the end, a step in person.
              </li>
              <li>Producing the booklet, the chip inside it and delivery are outside this document.</li>
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
