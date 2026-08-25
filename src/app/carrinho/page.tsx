"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();

  const total = cart.reduce(
    (sum, product) => sum + product.preco,
    0
  );

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

          <Link
            href="/"
            className="text-sm font-semibold text-gray-300 transition hover:text-blue-500"
          >
            ← Voltar para a loja
          </Link>

        </div>
      </header>

      {/* CONTEÚDO */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
            SIAC STUDIO
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            Seu carrinho
          </h1>

          {cart.length > 0 && (
            <p className="mt-3 text-gray-400">
              {cart.length}{" "}
              {cart.length === 1
                ? "produto no carrinho"
                : "produtos no carrinho"}
            </p>
          )}
        </div>

        {/* CARRINHO VAZIO */}
        {cart.length === 0 ? (

          <div className="mt-10 rounded-2xl border border-gray-800 bg-gray-950 px-6 py-16 text-center">

            <div className="text-5xl">
              🛒
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Seu carrinho está vazio
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-400">
              Escolha algumas artes profissionais para começar
              sua compra.
            </p>

            <Link
              href="/"
              className="mt-8 inline-block rounded-lg bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-500"
            >
              Explorar artes
            </Link>

          </div>

        ) : (

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">

            {/* PRODUTOS */}
            <div className="space-y-4">

              {cart.map((product, index) => (

                <div
                  key={`${product.id}-${index}`}
                  className="rounded-2xl border border-gray-800 bg-gray-950 p-4 transition hover:border-gray-700 sm:p-5"
                >

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                    {/* IMAGEM */}
                    <Link
                      href={`/produto/${product.id}`}
                      className="shrink-0"
                    >
                      <img
                        src={product.imagem}
                        alt={product.nome}
                        className="h-32 w-full rounded-xl object-cover transition hover:opacity-80 sm:h-28 sm:w-28"
                      />
                    </Link>

                    {/* INFORMAÇÕES */}
                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-medium text-blue-500">
                        {product.categoria}
                      </p>

                      <Link
                        href={`/produto/${product.id}`}
                        className="mt-1 block text-xl font-semibold transition hover:text-blue-400"
                      >
                        {product.nome}
                      </Link>

                      <p className="mt-2 text-sm text-gray-500">
                        📦 Arquivo digital
                      </p>

                    </div>

                    {/* PREÇO / REMOVER */}
                    <div className="flex items-center justify-between gap-5 sm:block sm:text-right">

                      <p className="text-xl font-bold text-blue-500">
                        R$ {product.preco.toFixed(2).replace(".", ",")}
                      </p>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="mt-0 text-sm text-red-400 transition hover:text-red-300 sm:mt-3"
                      >
                        Remover
                      </button>

                    </div>

                  </div>

                </div>

              ))}

              {/* LIMPAR */}
              <div className="pt-2">
                <button
                  onClick={clearCart}
                  className="text-sm font-semibold text-gray-500 transition hover:text-red-400"
                >
                  Limpar carrinho
                </button>
              </div>

            </div>

            {/* RESUMO */}
            <aside className="h-fit rounded-2xl border border-gray-800 bg-gray-950 p-6 lg:sticky lg:top-6">

              <h2 className="text-xl font-bold">
                Resumo da compra
              </h2>

              <div className="mt-6 space-y-4">

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    Produtos
                  </span>

                  <span>
                    {cart.length}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    Entrega
                  </span>

                  <span className="font-medium text-green-400">
                    Digital
                  </span>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <div className="flex items-center justify-between">

                    <span className="text-gray-400">
                      Total
                    </span>

                    <span className="text-3xl font-bold text-blue-500">
                      R$ {total.toFixed(2).replace(".", ",")}
                    </span>

                  </div>
                </div>

              </div>

              {/* INFORMAÇÃO */}
              <div className="mt-6 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">

                <p className="font-semibold text-blue-400">
                  📦 Produto digital
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Os produtos deste carrinho são arquivos digitais.
                  Não haverá envio físico.
                </p>

              </div>

              {/* AÇÕES */}
              <div className="mt-6 space-y-3">

                <button
                  className="w-full rounded-lg bg-blue-600 px-6 py-4 font-semibold transition hover:bg-blue-500"
                >
                  Finalizar compra
                </button>

                <Link
                  href="/"
                  className="block w-full rounded-lg border border-gray-700 px-6 py-4 text-center font-semibold transition hover:border-blue-500 hover:text-blue-400"
                >
                  Continuar comprando
                </Link>

              </div>

              <p className="mt-5 text-center text-xs leading-5 text-gray-500">
                O checkout e o pagamento serão integrados nas
                próximas etapas do projeto.
              </p>

            </aside>

          </div>

        )}

      </section>

    </main>
  );
}