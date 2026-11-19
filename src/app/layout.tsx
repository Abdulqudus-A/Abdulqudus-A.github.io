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
  "Senior backend engineer in Lagos. System design write-ups from work for mobile operators, a foreign ministry, universities and dealerships in five countries.";

// Set NEXT_PUBLIC_SITE_URL at build time once the final address is known.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://abdulqudus.reavil.io";

export const metadata: Metadata = {
  title: { default: title, template: "%s · Abdulqudus Aremu" },
  description,
  metadataBase: new URL(siteUrl),
  authors: [{ name: "Abdulqudus Aremu" }],
  openGraph: {
    type: "website",
    title,
    description,
    siteName: "Abdulqudus Aremu",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Abdulqudus Aremu, backend engineer" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
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
