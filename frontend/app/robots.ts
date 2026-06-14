import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep authenticated, per-user pages out of search results.
      disallow: ["/home", "/board/", "/create-board", "/archive"],
    },
    sitemap: "https://kittytask.hamzaalsafi.com/sitemap.xml",
  };
}
