import { redirect } from "next/navigation";
import { products } from "@/data/products";
import { getProductSlug } from "@/lib/product-seo";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = products.find((item) => item.id === Number(id));

  if (!product) {
    redirect("/");
  }

  redirect(`/produto/${getProductSlug(product)}`);
}
