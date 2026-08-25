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

      {/* CARRINHO */}
      <section className="mx-auto max-w-5xl px-6 py-16">

        <p className="text-sm font-semibold uppercase tracking-wider text-blue-500">
          SIAC STUDIO
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Seu carrinho
        </h1>

        {/* CARRINHO VAZIO */}

        {cart.length === 0 ? (

          <div className="mt-10 rounded-2xl border border-gray-800 bg-gray-950 p-10 text-center">

            <div className="text-5xl">
              🛒
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Seu carrinho está vazio
            </h2>

            <p className="mt-3 text-gray-400">
              Escolha algumas artes para começar sua compra.
            </p>

            <Link
              href="/"
              className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              Explorar artes
            </Link>

          </div>

        ) : (

          /* CARRINHO COM PRODUTOS */

          <div className="mt-10">

            <div className="space-y-4">

              {cart.map((product, index) => (

                <div
                  key={`${product.id}-${index}`}
                  className="flex flex-col gap-5 rounded-2xl border border-gray-800 bg-gray-950 p-5 sm:flex-row sm:items-center"
                >

                  {/* IMAGEM */}

                  <img
                    src={product.imagem}
                    alt={product.nome}
                    className="h-28 w-28 rounded-lg object-cover"
                  />

                  {/* INFORMAÇÕES */}

                  <div className="flex-1">

                    <p className="text-sm text-gray-400">
                      {product.categoria}
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                      {product.nome}
                    </h2>

                  </div>

                  {/* PREÇO */}

                  <div className="text-left sm:text-right">

                    <p className="text-lg font-bold text-blue-500">
                      R$ {product.preco.toFixed(2).replace(".", ",")}
                    </p>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="mt-2 text-sm text-red-400 transition hover:text-red-300"
                    >
                      Remover
                    </button>

                  </div>

                </div>

              ))}

            </div>

            {/* RESUMO */}

            <div className="mt-10 rounded-2xl border border-gray-800 bg-gray-950 p-6">

              <div className="flex items-center justify-between">

                <span className="text-gray-400">
                  Total da compra
                </span>

                <span className="text-3xl font-bold text-blue-500">
                  R$ {total.toFixed(2).replace(".", ",")}
                </span>

              </div>

              {/* BOTÕES */}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">

                <Link
                  href="/"
                  className="rounded-lg border border-gray-700 px-5 py-3 text-center font-semibold transition hover:border-blue-500 hover:text-blue-500"
                >
                  Continuar comprando
                </Link>

                <button
                  onClick={clearCart}
                  className="rounded-lg border border-gray-700 px-5 py-3 font-semibold transition hover:border-gray-500"
                >
                  Limpar carrinho
                </button>

                <button
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                >
                  Finalizar compra
                </button>

              </div>

            </div>

          </div>

        )}

      </section>

    </main>
  );
}