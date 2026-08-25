import ProductCard from "@/components/ProductCard";
import CartButton from "@/components/CartButton";
import { products } from "@/data/products";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* CABECALHO */}
      <header className="border-b border-gray-800 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="text-2xl font-bold">
            SIAC <span className="text-blue-500">STUDIO</span>
          </div>

          <nav className="hidden gap-8 md:flex">
            <a href="#" className="hover:text-blue-500">
              Loja
            </a>

            <a href="#" className="hover:text-blue-500">
              Categorias
            </a>

            <a href="#" className="hover:text-blue-500">
              Kits
            </a>

            <a href="#" className="hover:text-blue-500">
              Promoções
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="hover:text-blue-500">
              🔎
            </button>

            <CartButton />
          </div>

        </div>
      </header>

      {/* BANNER PRINCIPAL */}
      <section className="relative overflow-hidden bg-gray-950">

        <div className="mx-auto max-w-7xl px-6 py-24 text-center">

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
            SIAC STUDIO
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Artes profissionais
            <br />
            para sublimação total
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Arquivos digitais profissionais para estampadores,
            designers e empresas de personalização.
          </p>

          <button className="mt-10 rounded-lg bg-blue-600 px-8 py-4 font-semibold transition hover:bg-blue-500">
            Explorar artes
          </button>

        </div>

      </section>

      {/* CATEGORIAS */}
      <section className="mx-auto max-w-7xl px-6 py-16">

        <h2 className="mb-8 text-2xl font-bold">
          Categorias
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

          {[
            "Pesca",
            "Futebol",
            "Ciclismo",
            "Motocross",
            "Interclasses",
          ].map((categoria) => (
            <button
              key={categoria}
              className="rounded-xl border border-gray-800 bg-gray-950 p-6 text-center transition hover:border-blue-500 hover:text-blue-500"
            >
              {categoria}
            </button>
          ))}

        </div>

      </section>
      <section className="mx-auto max-w-7xl px-6 py-16">

  <div className="mb-8 flex items-center justify-between">
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-500">
        Destaques
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        Mais vendidos
      </h2>
    </div>

    <button className="text-sm font-semibold text-blue-500 hover:text-blue-400">
      Ver todos →
    </button>
  </div>

  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

    {/* PRODUTO */}
 {products.map((product) => (
  <ProductCard
    key={product.id}
    id={product.id}
    nome={product.nome}
    categoria={product.categoria}
    preco={product.preco}
    imagem={product.imagem}
  />
))}

  </div>

</section>

    </main>
  );
}