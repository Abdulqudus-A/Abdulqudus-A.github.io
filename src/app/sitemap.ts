import type { MetadataRoute } from "next";
import { designDocs } from "../content/site";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://abdulqudus-a.github.io";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/` },
    ...designDocs.filter((d) => d.published).map((d) => ({ url: `${siteUrl}/systems/${d.slug}/` })),
  ];
}
