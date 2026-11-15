import type { NextConfig } from "next";

// The site is fully static: every page is pre-rendered to HTML at build time
// and can be hosted on any static host (Vercel, Cloudflare Pages, GitHub Pages).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
