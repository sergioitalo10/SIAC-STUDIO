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

export function getMascoteSlug(mascote: string): string {
  return slugify(mascote);
}

export function getMascoteBySlug(slug: string): string | undefined {
  const normalizedSlug = slugify(slug);
  const mascotes = products
    .filter((product) => {
      const categoria = Array.isArray(product.categoria) ? product.categoria : [product.categoria];
      return categoria.includes("Interclasses") && Boolean(product.mascote);
    })
    .map((product) => product.mascote as string);

  return mascotes.find((mascote) => getMascoteSlug(mascote) === normalizedSlug);
}

export function getProductsByMascote(mascote: string): Product[] {
  return products.filter((product) => {
    const categoria = Array.isArray(product.categoria) ? product.categoria : [product.categoria];
    return categoria.includes("Interclasses") && product.mascote === mascote;
  });
}

export function getInterclassesMascotes(): string[] {
  return Array.from(
    new Set(
      products
        .filter((product) => {
          const categoria = Array.isArray(product.categoria) ? product.categoria : [product.categoria];
          return categoria.includes("Interclasses") && Boolean(product.mascote);
        })
        .map((product) => product.mascote as string)
    )
  );
}

export const seoBaseUrl = "https://siac-studio.vercel.app";
