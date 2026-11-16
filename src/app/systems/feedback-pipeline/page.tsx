import type { Metadata } from "next";
import Link from "next/link";
import { Decisions, type Decision } from "../../../components/Decisions";
import { Footer } from "../../../components/Footer";
import { TopBar } from "../../../components/TopBar";
import { Diagram } from "../../../components/diagrams/Diagram";
import { DiagramWalkthrough } from "../../../components/diagrams/DiagramWalkthrough";
import { feedbackDiagram, feedbackSteps, feedbackUsesDiagram } from "../../../content/diagrams/feedback";

const title = "From raw feedback to a ranked list of problems";
const dek =
  "The pipeline behind Reavil. Each piece of user feedback is scored, grouped with similar feedback and ranked, so a product team sees its biggest problem first.";

export const metadata: Metadata = {
  title,
  description: dek,
};

const parts: { name: string; text: string }[] = [
  {
    name: "Widget",
    text: "Collects a message and an emoji, attaches the page URL and title, and posts them with the project key.",
  },
  {
    name: "API",
    text: "Validates the payload, checks the project key and that the account is active, rate-limits by IP, stores the feedback as pending and answers 202.",
  },
  {
    name: "Enrich",
    text: "Runs in the background, after the API has replied. A model adds context to feedback that is too thin to classify, then the message goes on the feedback queue.",
  },
  {
    name: "Feedback worker",
    text: "Embeds the text, asks a model for sentiment, severity, tags and the product flow involved, then computes the critical score.",
  },
  {
    name: "Model API",
    text: "Enrichment, embeddings, classification and group summaries. The one dependency outside our control, so there is a second model to fall back to.",
  },
  {
    name: "Database",
    text: "Postgres with pgvector. Holds each piece of feedback with its vector and scores, and each group with its centroid.",
  },
  { name: "Cluster queue", text: "At most one waiting job per project, delayed by 30 seconds." },
  {
    name: "Cluster worker",
    text: "Assigns new feedback to existing groups by cosine similarity, forms new groups, and has each new group summarised once.",
  },
  { name: "Dashboard", text: "Lists the groups, highest critical score first." },
];

const decisions: Decision[] = [
  {
    title: "Accept first, understand later",
    chose: "Store the feedback as pending and answer 202 Accepted. Enrichment and scoring happen in background workers.",
    alt: "Calling the model inside the request.",
    why: "The widget’s response time does not depend on the model provider, and an outage there cannot lose feedback. The message is already stored.",
    cost: "Feedback is not scored the moment it arrives. Every row needs a state (pending, processing, processed, processed with fallback, failed), and someone has to watch for rows that get stuck.",
  },
  {
    title: "A score a person can read",
    chose:
      "A critical score from 0 to 100, computed in code: 50% severity, 40% negative sentiment and 10% the importance of the product flow involved. Payment weighs the most, settings the least.",
    alt: "Asking the model for a priority directly.",
    why: "The same inputs always give the same score. The weights can be explained to a product manager, and changed without touching a prompt.",
    cost: "The weights are judgment calls. They need tuning against what teams actually fix first.",
  },
  {
    title: "Tell the model what it may say, then check what it said",
    chose:
      "A few-shot prompt that asks for JSON only, with tags and product flows from fixed lists. In code, severity is clamped to 1–10, unknown flows become “other”, and a clearly positive message cannot keep a high severity. The emoji the person picked counts for a quarter of the sentiment, unless the text is strongly negative and the emoji is cheerful. Then the text wins.",
    alt: "Free-form labels from the model, trusted as returned.",
    why: "Free-form labels fragment. “Login bug”, “auth issue” and “can’t sign in” are one problem with three names, and everything downstream that groups or filters stops working.",
    cost: "A fixed list cannot name something new, so the list has to be maintained.",
  },
  {
    title: "Degrade, and say so",
    chose:
      "Each model call is retried with exponential backoff, then sent to a second model. If that fails too, classification falls back to keyword rules. The row is marked as scored by fallback, with the reason, and a later job scores it again.",
    alt: "Failing the job and retrying until the provider recovers.",
    why: "The team gets a rough score now instead of nothing, and no message is stuck behind an outage.",
    cost: "Until it is scored again, a fallback row has a crude score and no real embedding, so it cannot be grouped properly.",
  },
  {
    title: "Group incrementally, summarise once",
    chose:
      "Each group keeps a centroid, the mean of its members’ vectors. New feedback joins the nearest group when cosine similarity is above 0.72. Otherwise it starts a candidate group, which becomes a real one at six messages. Only feedback with a critical score above 50 is grouped at all. The model names and summarises a group once, when it is created.",
    alt: "Clustering all feedback again on every run, and summarising again each time.",
    why: "A problem keeps its identity and its name as feedback accumulates. Model cost is one summary per new problem, not one per run. The floor of six keeps a single angry message from becoming a “problem”.",
    cost: "Praise and minor remarks are never grouped. A summary can go stale as its group grows. A wrong early assignment stays wrong.",
  },
];

export default function FeedbackPipelineDoc() {
  return (
    <div className="wrap doc">
      <TopBar />

      <main id="main">
        <header className="doc-head row">
          <div className="side">
            <dl className="meta">
              <div>
                <dt className="label">Product</dt>
                <dd className="data">
                  <a href="https://reavil.io">Reavil</a>
                </dd>
              </div>
              <div>
                <dt className="label">Stack</dt>
                <dd className="data">TypeScript, Fastify, BullMQ, Postgres with pgvector, OpenAI</dd>
              </div>
            </dl>
          </div>
          <div>
            <p className="label kicker">
              <Link href="/#work">System design</Link> · 1.3
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
              Product teams get feedback as a stream of short messages. Read one at a time, the loudest message wins
              and the common one is missed. Reavil turns that stream into a short list of problems, ranked, each with
              the feedback behind it.
            </p>
            <p>
              Feedback arrives through a widget embedded in the customer’s product, on the web or inside a mobile app’s
              web view. A person picks one of five emoji and writes at least 20 characters. The widget adds the page
              they were on.
            </p>
          </div>
        </section>

        <section className="section row" aria-labelledby="s2">
          <p className="num">§2</p>
          <div className="prose">
            <h2 id="s2">Constraints</h2>
            <ul className="dash">
              <li>Sending feedback must feel instant. The person who wrote it will not wait for a language model.</li>
              <li>
                The model provider will fail. It rate-limits, times out and sometimes returns text that is not valid
                JSON. The pipeline has to finish anyway, and record when it guessed.
              </li>
              <li>Model calls cost money. Anything that can be computed once should be.</li>
              <li>
                The ranking has to be explainable. A product manager should be able to see why one problem outranks
                another.
              </li>
              <li>
                Groups have to be stable. Yesterday’s problem should be the same problem today with more feedback in
                it, not a new group with a new name.
              </li>
            </ul>
          </div>
        </section>

        <section className="section row" aria-labelledby="s3">
          <p className="num">§3</p>
          <div className="prose">
            <h2 id="s3">The design question</h2>
            <p className="question">
              How do you turn a stream of messy messages into a ranked list a product team will trust?
            </p>
          </div>
        </section>

        <section className="section row" aria-labelledby="s4">
          <p className="num">§4</p>
          <div className="prose">
            <h2 id="s4">Architecture</h2>
            <p>
              Everything after the API’s reply happens in the background, in three stages: enrich one message, score
              it, then group the scored messages of one project.
            </p>
            <figure className="fig">
              <div className="frame">
                <Diagram def={feedbackDiagram} />
              </div>
              <figcaption>
                Fig. 1. One message, from the widget to the dashboard. The model API is called in three places: to
                add context to thin feedback, to score each message, and to name each new group.
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
            <h2 id="s6">What happens, step by step</h2>
            <p>Seven moments in the life of one message, including the one where the model does not answer.</p>
            <DiagramWalkthrough def={feedbackDiagram} steps={feedbackSteps} />
          </div>
        </section>

        <section className="section row" aria-labelledby="s7">
          <p className="num">§7</p>
          <div className="prose">
            <h2 id="s7">What is built on the list</h2>
            <p>
              Two features read what the pipeline has stored. Both are reached from the analytics portal, and neither
              changes the stored feedback.
            </p>
            <figure className="fig">
              <div className="frame">
                <Diagram def={feedbackUsesDiagram} />
              </div>
              <figcaption>Fig. 2. What reads the stored feedback: a chat agent and a PRD generator.</figcaption>
            </figure>
            <dl className="parts">
              <div>
                <dt className="label">Chat agent</dt>
                <dd>
                  A product manager asks a question in plain language, or picks a suggested one such as “bugs from the
                  last three months”. The agent answers from this project’s stored feedback, using similarity search
                  and structured queries. It does not go outside that data unless asked to.
                </dd>
              </div>
              <div>
                <dt className="label">PRD generator</dt>
                <dd>
                  The classifier marks each message as a problem or a feature request, from written rules and
                  examples. From a group of similar feature requests, a product manager can generate a draft PRD: what
                  the feature involves, user stories and a timeline. The draft is editable before anyone acts on it.
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="section row" aria-labelledby="s8">
          <p className="num">§8</p>
          <div className="prose">
            <h2 id="s8">What I would change</h2>
            <ul className="dash">
              <li>
                Keep fallback rows out of grouping until they have been scored again. A row without a real embedding
                should not be compared with anything.
              </li>
              <li>
                Retry at the queue, not only inside the call. Jobs should retry with backoff and end in a dead-letter
                queue, not in a log line.
              </li>
              <li>
                Close the gap in scheduling. Feedback scored while a clustering run is in progress waits until the next
                message triggers a run. A periodic sweep would catch it.
              </li>
              <li>
                Refresh summaries at size milestones. A group that has grown tenfold deserves a second look from the
                model.
              </li>
              <li>
                Tune the thresholds on labelled examples. The similarity cut-off, the floor of six and the score
                weights were set by hand.
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
