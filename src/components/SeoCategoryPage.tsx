import Link from "next/link";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

type SeoCategoryPageProps = {
  title: string;
  description: string;
  intro: string;
  productsFilter: (product: (typeof products)[number]) => boolean;
  breadcrumb: string;
};

export default function SeoCategoryPage({ title, description, intro, productsFilter, breadcrumb }: SeoCategoryPageProps) {
  const filteredProducts = products.filter(productsFilter);

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold">SIAC <span className="text-blue-500">STUDIO</span></Link>
          <Link href="/carrinho" className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold hover:border-blue-500">🛒 Carrinho</Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-white">Início</Link><span className="mx-2">›</span><span className="text-gray-300">{breadcrumb}</span>
        </nav>
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-5 text-lg leading-8 text-gray-400">{description}</p>
          <p className="mt-4 leading-7 text-gray-500">{intro}</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} arquivo={product.downloadUrl} />
          ))}
        </div>

        {filteredProducts.length === 0 && <p className="mt-10 text-gray-400">Nenhuma arte encontrada no momento.</p>}

        <div className="mt-14 border-t border-gray-800 pt-8">
          <h2 className="text-xl font-bold">Continue navegando</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/artes-interclasse" className="rounded-lg border border-gray-800 px-4 py-2 hover:border-blue-500">Artes para Interclasse</Link>
            <Link href="/artes-para-sublimacao" className="rounded-lg border border-gray-800 px-4 py-2 hover:border-blue-500">Artes para Sublimação</Link>
            <Link href="/artes-para-camisa" className="rounded-lg border border-gray-800 px-4 py-2 hover:border-blue-500">Artes para Camisa</Link>
            <Link href="/mascotes-interclasse" className="rounded-lg border border-gray-800 px-4 py-2 hover:border-blue-500">Mascotes para Interclasse</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
