import Link from "next/link";
import { RecoveryFigure } from "../components/RecoveryFigure";
import {
  alsoShipped,
  education,
  glance,
  headline,
  lede,
  profile,
  record,
  selectedWork,
  sideProjects,
} from "../content/site";

export default function Home() {
  const [registrations, subscribers, ...facts] = glance;

  return (
    <div className="wrap">
      <header className="top">
        <Link className="brand" href="/">
          {profile.name}
        </Link>
        <nav aria-label="Sections">
          <a href="#work">Work</a>
          <a href="#record">Record</a>
          <a href="#writing">Writing</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main id="main">
        <section className="intro row" aria-labelledby="headline">
          <div className="side">
            <dl className="meta">
              <div>
                <dt className="label">Role</dt>
                <dd className="data">
                  {profile.role}, {profile.employer}
                </dd>
              </div>
              <div>
                <dt className="label">Based</dt>
                <dd className="data">
                  {profile.location} ({profile.timezone})
                </dd>
              </div>
              <div>
                <dt className="label">Experience</dt>
                <dd className="data">{profile.experience}</dd>
              </div>
              <div>
                <dt className="label">Status</dt>
                <dd className="data status">{profile.status}</dd>
              </div>
            </dl>
          </div>
          <div>
            <p className="label kicker">Backend engineer</p>
            <h1 id="headline">{headline}</h1>
            <p className="lede">{lede[0]}</p>
            <p>{lede[1]}</p>
          </div>
        </section>

        <section className="glance row" aria-label="At a glance">
          <p className="label side">At a glance</p>
          <div>
            <div className="figures">
              {[registrations, subscribers].map((f) => (
                <p key={f.label}>
                  <span className="num">{f.value}</span>
                  <span className="label">{f.label}</span>
                </p>
              ))}
            </div>
            <dl className="facts">
              {facts.map((f) => (
                <div key={f.label}>
                  <dt className="label">{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="work" aria-labelledby="work-title">
          <div className="section row">
            <p className="num">§1</p>
            <div>
              <h2 id="work-title">Selected work</h2>
              <p className="intro-line">Four systems, each with a problem worth explaining.</p>
            </div>
          </div>

          {selectedWork.map((work, i) => (
            <article className="entry row" key={work.slug}>
              <div className="side">
                <p className="idx">1.{i + 1}</p>
                <ul className="tags">
                  {work.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>{work.published ? <a href={`/work/${work.slug}/`}>{work.title}</a> : work.title}</h3>
                <p>{work.summary}</p>
                {i === 0 && <RecoveryFigure />}
                {!work.published && <p className="label state">Case study in progress</p>}
              </div>
            </article>
          ))}

          <div className="block row">
            <p className="label side">Also shipped</p>
            <ul className="dash">
              {alsoShipped.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id="record" aria-labelledby="record-title">
          <div className="section row">
            <p className="num">§2</p>
            <h2 id="record-title">Record</h2>
          </div>

          {record.map((job) => (
            <div className="block row" key={job.org}>
              <p className="label side">{job.period}</p>
              <div>
                <h3>{job.org}</h3>
                <p className="data sub">
                  {job.role} · {job.place}
                </p>
                <p>{job.note}</p>
              </div>
            </div>
          ))}

          <div className="block row">
            <p className="label side">Outside work</p>
            <div>
              {sideProjects.map((p) => (
                <div className="item" key={p.name}>
                  <h3>
                    <a href={p.url}>{p.name}</a>
                  </h3>
                  <p className="data sub">
                    {p.role} · {p.host}
                  </p>
                  <p>{p.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="block row">
            <p className="label side">Education</p>
            <div>
              <h3>{education.degree}</h3>
              <p className="data sub">
                {education.honours} · {education.school}
              </p>
            </div>
          </div>
        </section>

        <section id="writing" aria-labelledby="writing-title">
          <div className="section row">
            <p className="num">§3</p>
            <div>
              <h2 id="writing-title">Writing</h2>
              <div className="note">
                <p className="label">Draft note</p>
                <p>Posts and the press mention are listed here once the blog link and the article are in.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="contact" aria-labelledby="contact-title">
          <div className="section row">
            <p className="num">§4</p>
            <div>
              <h2 id="contact-title">Contact</h2>
              <p>Email is the fastest way to reach me. For a role or a contract, book a call.</p>
              <dl className="links">
                <div>
                  <dt className="label">Email</dt>
                  <dd>
                    <a href={`mailto:${profile.email}`}>{profile.email}</a>
                  </dd>
                </div>
                <div>
                  <dt className="label">Call</dt>
                  <dd>
                    <a href={profile.links.calendar}>Book a call</a>
                  </dd>
                </div>
                <div>
                  <dt className="label">Code</dt>
                  <dd>
                    <a href={profile.links.github}>github.com/Abdulqudus-A</a>
                  </dd>
                </div>
                <div>
                  <dt className="label">LinkedIn</dt>
                  <dd>
                    <a href={profile.links.linkedin}>linkedin.com/in/abdulqudus-aremu</a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <p className="label">© 2026 {profile.name}</p>
        <p className="label">Pre-rendered HTML · Self-hosted fonts · No trackers</p>
      </footer>
    </div>
  );
}
