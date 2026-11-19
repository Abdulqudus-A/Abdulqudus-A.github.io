import Link from "next/link";
import { Footer } from "../components/Footer";
import { TopBar } from "../components/TopBar";
import { Diagram } from "../components/diagrams/Diagram";
import { registrationDiagram } from "../content/diagrams/registration";
import {
  alsoShipped,
  designDocs,
  education,
  facts,
  figures,
  headline,
  lede,
  press,
  profile,
  record,
  sideProjects,
  writing,
} from "../content/site";

export default function Home() {
  return (
    <div className="wrap">
      <TopBar />

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
              {figures.map((f) => (
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
              <h2 id="work-title">System design</h2>
              <p className="intro-line">
                Each system is written up as a design doc: the constraints, the architecture, the decisions and what
                happens when something fails.
              </p>
            </div>
          </div>

          {designDocs.map((doc, i) => (
            <article className="entry row" key={doc.slug}>
              <div className="side">
                <p className="idx">
                  1.{i + 1} · {doc.context}
                </p>
                <ul className="tags">
                  {doc.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>{doc.published ? <Link href={`/systems/${doc.slug}/`}>{doc.title}</Link> : doc.title}</h3>
                <p>{doc.summary}</p>
                {i === 0 && (
                  <figure className="fig">
                    <div className="frame">
                      <Diagram def={registrationDiagram} />
                    </div>
                    <figcaption>
                      The path of one registration. The doc walks through it, including the three places it fails.
                    </figcaption>
                  </figure>
                )}
                {doc.published ? (
                  <p className="read">
                    <Link href={`/systems/${doc.slug}/`}>Read the design doc</Link>
                  </p>
                ) : (
                  <p className="label state">Design doc in progress</p>
                )}
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
                  <p className="data sub">{p.role ? `${p.role} · ${p.host}` : p.host}</p>
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
            </div>
          </div>

          <div className="block row">
            <p className="label side">Posts</p>
            <div>
              <ul className="dash">
                {writing.map((post) => (
                  <li key={post.url}>
                    <a href={post.url}>{post.title}</a>
                  </li>
                ))}
              </ul>
              <p className="more">
                <a href={profile.links.medium}>All posts on Medium</a>
              </p>
            </div>
          </div>

          <div className="block row press">
            <p className="label side">Press</p>
            <div>
              {press.map((item) => (
                <div className="item" key={item.url}>
                  <p>
                    <a href={item.url}>{item.title}</a>
                  </p>
                  <p className="data sub">{item.date ? `${item.outlet} · ${item.date}` : item.outlet}</p>
                </div>
              ))}
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

      <Footer />
    </div>
  );
}
