"use client";

import Link from "next/link";

export default function PagamentoSucessoPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-4xl">
          ✓
        </div>

        <h1 className="text-4xl font-bold">
          Pagamento aprovado!
        </h1>

        <p className="mt-4 text-lg text-gray-300">
          Obrigado pela sua compra.
        </p>

        <p className="mt-2 text-sm text-gray-400">
          Seu pagamento foi recebido e seu pedido está sendo processado.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
          >
            Voltar para a loja
          </Link>

          <Link
            href="/carrinho"
            className="rounded-lg border border-white/20 px-6 py-3 font-semibold transition hover:bg-white/10"
          >
            Ver carrinho
          </Link>
        </div>
      </div>
    </main>
  );
}