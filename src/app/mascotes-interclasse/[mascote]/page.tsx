import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import {
  getInterclassesMascotes,
  getMascoteBySlug,
  getMascoteSlug,
  getProductsByMascote,
  seoBaseUrl,
} from "@/lib/product-seo";

type MascotePageProps = {
  params: Promise<{ mascote: string }>;
};

export function generateStaticParams() {
  return getInterclassesMascotes().map((mascote) => ({
    mascote: getMascoteSlug(mascote),
  }));
}

export async function generateMetadata({ params }: MascotePageProps): Promise<Metadata> {
  const { mascote: slug } = await params;
  const mascote = getMascoteBySlug(slug);

  if (!mascote) {
    return {
      title: "Mascote não encontrado | SIAC STUDIO",
      description: "Esta coleção de mascotes não está disponível no momento.",
    };
  }

  const description = `Artes de ${mascote} para interclasse e camisas escolares. Encontre designs digitais para sublimação e arquivos para download no SIAC STUDIO.`;
  const canonical = `${seoBaseUrl}/mascotes-interclasse/${getMascoteSlug(mascote)}`;

  return {
    title: `Arte ${mascote} para Interclasse | SIAC STUDIO`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      title: `Arte ${mascote} para Interclasse | SIAC STUDIO`,
      description,
      url: canonical,
      siteName: "SIAC STUDIO",
    },
  };
}

export default async function MascotePage({ params }: MascotePageProps) {
  const { mascote: slug } = await params;
  const mascote = getMascoteBySlug(slug);

  if (!mascote) notFound();

  const products = getProductsByMascote(mascote);

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold">
            SIAC <span className="text-blue-500">STUDIO</span>
          </Link>
          <Link
            href="/carrinho"
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold hover:border-blue-500"
          >
            🛒 Carrinho
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-white">Início</Link>
          <span className="mx-2">›</span>
          <Link href="/mascotes-interclasse" className="hover:text-white">Mascotes para Interclasse</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-300">{mascote}</span>
        </nav>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Arte {mascote} para Interclasse
          </h1>
          <p className="mt-5 text-lg leading-8 text-gray-400">
            Artes de {mascote} para camisas de interclasse, jogos internos e projetos escolares. Escolha um design digital e utilize o arquivo para personalização e sublimação.
          </p>
          <p className="mt-4 leading-7 text-gray-500">
            O catálogo abaixo reúne as variações de {mascote} disponíveis no SIAC STUDIO. O produto é digital e o acesso ao arquivo é liberado após a confirmação do pagamento.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} arquivo={product.downloadUrl} />
          ))}
        </div>

        <div className="mt-14 border-t border-gray-800 pt-8">
          <h2 className="text-2xl font-bold">Explore outras artes para interclasse</h2>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link href="/artes-interclasse" className="rounded-lg border border-gray-800 px-4 py-2 hover:border-blue-500">
              Todas as artes de interclasse
            </Link>
            <Link href="/artes-para-sublimacao" className="rounded-lg border border-gray-800 px-4 py-2 hover:border-blue-500">
              Artes para sublimação
            </Link>
            <Link href="/artes-para-camisa" className="rounded-lg border border-gray-800 px-4 py-2 hover:border-blue-500">
              Artes para camisa
            </Link>
            <Link href="/mascotes-interclasse" className="rounded-lg border border-gray-800 px-4 py-2 hover:border-blue-500">
              Todos os mascotes
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
