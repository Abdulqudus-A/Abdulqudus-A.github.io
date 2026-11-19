import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "../components/Footer";
import { TopBar } from "../components/TopBar";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="wrap">
      <TopBar />
      <main id="main" className="notfound row">
        <p className="label side">404</p>
        <div>
          <h1>This page does not exist.</h1>
          <p>The address may be mistyped, or the page may have moved.</p>
          <p className="read">
            <Link href="/">Go to the front page</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
