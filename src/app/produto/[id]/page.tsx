import Link from "next/link";
import { products } from "@/data/products";
import AddToCartButton from "@/components/AddToCartButton";
import CartButton from "@/components/CartButton";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const product = products.find(
    (item) => item.id === Number(id)
  );

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            Produto não encontrado
          </h1>

          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
          >
            Voltar para a loja
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* CABEÇALHO */}
      <header className="border-b border-gray-800 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="text-2xl font-bold"
          >
            SIAC <span className="text-blue-500">STUDIO</span>
          </Link>

          <CartButton />

        </div>
      </header>

      {/* PRODUTO */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* VOLTAR */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm font-semibold text-gray-400 transition hover:text-white"
        >
          ← Voltar para a loja
        </Link>

        <div className="grid gap-12 lg:grid-cols-2">

          {/* IMAGEM */}
          <div>

            <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-950">
              <img
                src={product.imagem}
                alt={product.nome}
                className="aspect-square w-full object-cover"
              />
            </div>

            <p className="mt-4 text-center text-sm text-gray-500">
              Imagem ilustrativa do produto
            </p>

          </div>

          {/* INFORMAÇÕES */}
          <div className="flex flex-col justify-center">

            {/* CATEGORIA */}
            <div>
              <span className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400">
                {product.categoria}
              </span>
            </div>

            {/* NOME */}
            <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
              {product.nome}
            </h1>

            {/* DESCRIÇÃO */}
            <p className="mt-6 text-lg leading-8 text-gray-400">
              {product.descricao}
            </p>

            {/* INFORMAÇÕES DO ARQUIVO */}
            <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-950 p-6">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-xl">
                  📦
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Produto digital
                  </p>

                  <p className="mt-1 font-semibold">
                    Arquivo para download
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">

                <div className="rounded-xl border border-gray-800 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Formato
                  </p>

                  <p className="mt-2 font-semibold">
                    {product.formato}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-800 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Tamanho
                  </p>

                  <p className="mt-2 font-semibold">
                    {product.tamanho}
                  </p>
                </div>

              </div>

              <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/5 p-4">

                <p className="font-semibold text-green-400">
                  ✓ Download digital
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-400">
                  O acesso ao arquivo será liberado após a
                  confirmação do pagamento.
                </p>

              </div>

            </div>

            {/* BENEFÍCIOS */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">

              <div className="rounded-xl border border-gray-800 p-4">
                <p className="font-semibold">
                  ✓ Alta resolução
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Arquivo preparado para produção.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 p-4">
                <p className="font-semibold">
                  ✓ Sublimação total
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Ideal para personalização.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 p-4">
                <p className="font-semibold">
                  ✓ Arquivo digital
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Sem envio físico.
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 p-4">
                <p className="font-semibold">
                  ✓ Acesso após pagamento
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Download liberado após aprovação.
                </p>
              </div>

            </div>

            {/* PREÇO */}
            <div className="mt-8">

              <p className="text-sm text-gray-500">
                Por apenas
              </p>

              <p className="mt-1 text-4xl font-bold text-blue-500">
                R$ {product.preco.toFixed(2).replace(".", ",")}
              </p>

            </div>

            {/* ADICIONAR AO CARRINHO */}
            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>

            {/* VER CARRINHO */}
            <Link
              href="/carrinho"
              className="mt-4 block rounded-lg border border-gray-700 px-6 py-4 text-center font-semibold transition hover:border-blue-500 hover:text-blue-400"
            >
              🛒 Ver carrinho
            </Link>

            {/* AVISO */}
            <p className="mt-5 text-center text-xs leading-5 text-gray-500">
              Este produto é digital. Nenhum produto físico será
              enviado. O acesso ao arquivo será disponibilizado
              após a confirmação do pagamento.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}