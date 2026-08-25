"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { cart } = useCart();

  const total = cart.reduce(
    (sum, product) => sum + product.preco,
    0
  );

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white">

        <header className="border-b border-gray-800">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <Link
              href="/"
              className="text-2xl font-bold"
            >
              SIAC <span className="text-blue-500">STUDIO</span>
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-3xl px-6 py-20 text-center">

          <div className="text-5xl">
            🛒
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Seu carrinho está vazio
          </h1>

          <p className="mt-3 text-gray-400">
            Adicione pelo menos um produto antes de continuar
            para o checkout.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block rounded-lg bg-blue-600 px-7 py-3 font-semibold transition hover:bg-blue-500"
          >
            Voltar para a loja
          </Link>

        </section>

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

          <Link
            href="/carrinho"
            className="text-sm font-semibold text-gray-300 transition hover:text-blue-500"
          >
            ← Voltar ao carrinho
          </Link>

        </div>
      </header>

      {/* CHECKOUT */}
      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">

        <div className="mb-10">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
            SIAC STUDIO
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            Finalizar compra
          </h1>

          <p className="mt-3 text-gray-400">
            Preencha seus dados para continuar com o pedido.
          </p>

        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* DADOS DO CLIENTE */}
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">

            <h2 className="text-2xl font-bold">
              Seus dados
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Essas informações serão usadas para identificar
              seu pedido e liberar o acesso aos arquivos.
            </p>

            <div className="mt-8 space-y-5">

              <div>
                <label
                  htmlFor="nome"
                  className="mb-2 block text-sm font-semibold"
                >
                  Nome completo
                </label>

                <input
                  id="nome"
                  type="text"
                  placeholder="Digite seu nome"
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold"
                >
                  E-mail
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="whatsapp"
                  className="mb-2 block text-sm font-semibold"
                >
                  WhatsApp
                </label>

                <input
                  id="whatsapp"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
                />
              </div>

            </div>

            <div className="mt-8 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">

              <p className="font-semibold text-blue-400">
                📦 Compra digital
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Não é necessário informar endereço. Os produtos
                serão disponibilizados digitalmente após a
                confirmação do pagamento.
              </p>

            </div>

          </div>

          {/* RESUMO */}
          <aside className="h-fit rounded-2xl border border-gray-800 bg-gray-950 p-6 lg:sticky lg:top-6">

            <h2 className="text-xl font-bold">
              Resumo do pedido
            </h2>

            <div className="mt-6 space-y-4">

              {cart.map((product, index) => (

                <div
                  key={`${product.id}-${index}`}
                  className="flex gap-4"
                >

                  <img
                    src={product.imagem}
                    alt={product.nome}
                    className="h-16 w-16 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="font-semibold">
                      {product.nome}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {product.formato}
                    </p>

                  </div>

                  <p className="font-semibold">
                    R$ {product.preco.toFixed(2).replace(".", ",")}
                  </p>

                </div>

              ))}

            </div>

            <div className="mt-6 border-t border-gray-800 pt-6">

              <div className="flex items-center justify-between">

                <span className="text-gray-400">
                  Total
                </span>

                <span className="text-3xl font-bold text-blue-500">
                  R$ {total.toFixed(2).replace(".", ",")}
                </span>

              </div>

            </div>

            <button
              type="button"
              className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-4 font-semibold transition hover:bg-blue-500"
            >
              Continuar para pagamento
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-gray-500">
              O pagamento será integrado nas próximas etapas.
            </p>

          </aside>

        </div>

      </section>

    </main>
  );
}

