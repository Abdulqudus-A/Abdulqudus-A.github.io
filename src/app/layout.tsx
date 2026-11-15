import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Fonts are self-hosted: no third-party requests, and they are preloaded with the page.
const serif = localFont({
  src: "./fonts/SourceSerif4-Variable.woff2",
  weight: "200 900",
  variable: "--font-serif",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const mono = localFont({
  src: [
    { path: "./fonts/IBMPlexMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

const title = "Abdulqudus Aremu, backend engineer";
const description =
  "Senior Software Engineer at Seamfix. I build SIM-registration and identity systems for telcos: case studies, writing and contact.";

export const metadata: Metadata = {
  title: { default: title, template: "%s · Abdulqudus Aremu" },
  description,
  authors: [{ name: "Abdulqudus Aremu" }],
  openGraph: { type: "website", title, description, siteName: "Abdulqudus Aremu" },
  twitter: { card: "summary", title, description },
};

export const viewport: Viewport = {
  themeColor: "#faf8f3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
