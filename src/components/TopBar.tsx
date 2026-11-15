import Link from "next/link";
import { profile } from "../content/site";

export function TopBar() {
  return (
    <header className="top">
      <Link className="brand" href="/">
        {profile.name}
      </Link>
      <nav aria-label="Sections">
        <Link href="/#work">Systems</Link>
        <Link href="/#record">Record</Link>
        <Link href="/#writing">Writing</Link>
        <Link href="/#contact">Contact</Link>
      </nav>
    </header>
  );
}
