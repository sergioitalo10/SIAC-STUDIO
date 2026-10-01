import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { products } from "@/data/products";
import AddToCartButton from "@/components/AddToCartButton";
import CartButton from "@/components/CartButton";
import { getProductBySlug, getProductSlug, seoBaseUrl } from "@/lib/product-seo";

type ProductPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: getProductSlug(product) }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado | SIAC STUDIO", description: "Este produto não está disponível no momento." };
  const description = product.descricao ? product.descricao.substring(0, 155) : `Arte digital ${product.nome} para sublimação, disponível para download após a confirmação do pagamento.`;
  const canonical = `${seoBaseUrl}/produto/${getProductSlug(product)}`;
  return {
    title: `${product.nome} — Arte para Sublimação | SIAC STUDIO`,
    description,
    alternates: { canonical },
    openGraph: { type: "website", locale: "pt_BR", title: `${product.nome} — Arte para Sublimação | SIAC STUDIO`, description, url: canonical, images: [{ url: product.imagem, width: 1200, height: 1200, alt: product.nome }], siteName: "SIAC STUDIO" },
    twitter: { card: "summary_large_image", title: `${product.nome} — SIAC STUDIO`, description, images: [product.imagem] },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  if (/^\d+$/.test(slug)) {
    const legacyProduct = products.find((item) => item.id === Number(slug));
    if (legacyProduct) redirect(`/produto/${getProductSlug(legacyProduct)}`);
  }

  const product = getProductBySlug(slug);
  if (!product) notFound();

  const productSlug = getProductSlug(product);
  const category = Array.isArray(product.categoria) ? product.categoria[0] : product.categoria;
  const relatedProducts = products.filter((item) => item.id !== product.id && item.mascote && item.mascote === product.mascote).slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name: product.nome,
    image: [`${seoBaseUrl}${product.imagem}`], description: product.descricao || `Arte digital ${product.nome} para sublimação.`,
    brand: { "@type": "Brand", name: "SIAC STUDIO" }, category: category || "Artes para sublimação", sku: String(product.id),
    offers: { "@type": "Offer", url: `${seoBaseUrl}/produto/${productSlug}`, priceCurrency: "BRL", price: product.preco.toFixed(2), availability: "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition" },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: seoBaseUrl },
      { "@type": "ListItem", position: 2, name: "Artes para Interclasse", item: `${seoBaseUrl}/artes-interclasse` },
      ...(product.mascote ? [{ "@type": "ListItem", position: 3, name: product.mascote, item: `${seoBaseUrl}/mascotes-interclasse/${encodeURIComponent(product.mascote.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))}` }] : []),
      { "@type": "ListItem", position: product.mascote ? 4 : 3, name: product.nome, item: `${seoBaseUrl}/produto/${productSlug}` },
    ],
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <header className="border-b border-gray-800 bg-black"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/" className="text-2xl font-bold">SIAC <span className="text-blue-500">STUDIO</span></Link><CartButton /></div></header>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-gray-500"><Link href="/" className="hover:text-white">Início</Link><span className="mx-2">›</span><Link href="/artes-interclasse" className="hover:text-white">Artes para Interclasse</Link>{product.mascote && <><span className="mx-2">›</span><Link href={`/mascotes-interclasse/${encodeURIComponent(product.mascote.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))}`} className="hover:text-white">{product.mascote}</Link></>}<span className="mx-2">›</span><span className="text-gray-300">{product.nome}</span></nav>
        <div className="grid gap-12 lg:grid-cols-2">
          <div><div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-950"><img src={product.imagem} alt={`Arte ${product.nome} para camisa e sublimação`} className="aspect-square w-full object-cover" /></div><p className="mt-4 text-center text-sm text-gray-500">Preview da arte digital para sublimação.</p></div>
          <div className="flex flex-col justify-center">
            <span className="inline-block w-fit rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">{Array.isArray(product.categoria) ? product.categoria.join(" • ") : product.categoria}</span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">{product.nome}</h1>
            <p className="mt-6 text-lg leading-8 text-gray-400">{product.descricao || `Arte ${product.nome} preparada para criação de camisas e sublimação total.`}</p>
            <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-950 p-6"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-xl">📦</div><div><p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Produto digital</p><p className="mt-1 font-semibold">Arquivo para download</p></div></div><div className="mt-6 grid grid-cols-2 gap-4"><div className="rounded-xl border border-gray-800 p-4"><p className="text-xs uppercase tracking-wider text-gray-500">Formato</p><p className="mt-2 font-semibold">{product.formato || "RAR / arquivo digital"}</p></div><div className="rounded-xl border border-gray-800 p-4"><p className="text-xs uppercase tracking-wider text-gray-500">Tamanho</p><p className="mt-2 font-semibold">{product.tamanho || "Arquivo digital"}</p></div></div><div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/5 p-4"><p className="font-semibold text-green-400">✓ Download digital</p><p className="mt-1 text-sm leading-6 text-gray-400">O acesso ao arquivo será liberado após a confirmação do pagamento.</p></div></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-gray-800 p-4"><p className="font-semibold">✓ Alta resolução</p><p className="mt-1 text-sm text-gray-500">Arquivo preparado para produção.</p></div><div className="rounded-xl border border-gray-800 p-4"><p className="font-semibold">✓ Sublimação total</p><p className="mt-1 text-sm text-gray-500">Ideal para personalização de camisas.</p></div><div className="rounded-xl border border-gray-800 p-4"><p className="font-semibold">✓ Arquivo digital</p><p className="mt-1 text-sm text-gray-500">Sem envio físico.</p></div><div className="rounded-xl border border-gray-800 p-4"><p className="font-semibold">✓ Acesso após pagamento</p><p className="mt-1 text-sm text-gray-500">Download liberado após aprovação.</p></div></div>
            <div className="mt-8"><p className="text-sm text-gray-500">Por apenas</p><p className="mt-1 text-4xl font-bold text-blue-500">R$ {product.preco.toFixed(2).replace(".", ",")}</p></div>
            <div className="mt-8"><AddToCartButton product={product} /></div><Link href="/carrinho" className="mt-4 block rounded-lg border border-gray-700 px-6 py-4 text-center font-semibold transition hover:border-blue-500 hover:text-blue-400">🛒 Ver carrinho</Link><p className="mt-5 text-center text-xs leading-5 text-gray-500">Este produto é digital. Nenhum produto físico será enviado. O acesso ao arquivo será disponibilizado após a confirmação do pagamento.</p>
          </div>
        </div>
      </section>
      {relatedProducts.length > 0 && <section className="mx-auto max-w-7xl px-6 pb-16"><h2 className="text-2xl font-bold">Mais artes de {product.mascote}</h2><div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">{relatedProducts.map((related) => <Link key={related.id} href={`/produto/${getProductSlug(related)}`} className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950 transition hover:border-blue-500"><img src={related.imagem} alt={`Arte ${related.nome}`} className="aspect-square w-full object-cover" /><p className="p-3 text-sm font-semibold">{related.nome}</p></Link>)}</div></section>}
    </main>
  );
}
