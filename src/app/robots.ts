import type { MetadataRoute } from "next";
import { getAppBaseUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  const base = getAppBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/checkout",
        "/koszyk",
        "/dane",
        "/pobranie",
        "/sukces",
        "/platnosc/",
        "/zamowienie/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
