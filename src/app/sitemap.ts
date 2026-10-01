import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { getProductSlug, seoBaseUrl } from "@/lib/product-seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const landingPages: MetadataRoute.Sitemap = [
    { url: seoBaseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${seoBaseUrl}/artes-interclasse`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${seoBaseUrl}/artes-para-sublimacao`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${seoBaseUrl}/artes-para-camisa`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${seoBaseUrl}/mascotes-interclasse`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${seoBaseUrl}/produto/${getProductSlug(product)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...landingPages, ...productPages];
}
