import { profile } from "../content/site";

export function Footer() {
  return (
    <footer className="foot">
      <p className="label">© 2026 {profile.name}</p>
      <p className="label">Pre-rendered HTML · Self-hosted fonts · No trackers</p>
    </footer>
  );
}
