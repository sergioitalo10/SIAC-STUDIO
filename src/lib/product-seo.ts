import { products } from "@/data/products";
import type { Product } from "@/data/products";

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getProductSlug(product: Product): string {
  return slugify(product.nome);
}

export function getProductBySlug(slug: string): Product | undefined {
  const normalizedSlug = slugify(slug);
  return products.find((product) => getProductSlug(product) === normalizedSlug);
}

export function getProductUrl(product: Product): string {
  return `/produto/${getProductSlug(product)}`;
}

export const seoBaseUrl = "https://siac-studio.vercel.app";
