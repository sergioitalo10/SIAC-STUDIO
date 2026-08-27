"use client";

import Link from "next/link";

export default function PagamentoPendentePage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/20 text-4xl">
          !
        </div>

        <h1 className="text-4xl font-bold">
          Pagamento pendente
        </h1>

        <p className="mt-4 text-lg text-gray-300">
          Seu pagamento ainda está sendo processado.
        </p>

        <p className="mt-2 text-sm text-gray-400">
          Assim que o Mercado Pago confirmar o pagamento,
          atualizaremos o status do seu pedido.
        </p>

        <div className="mt-10">
          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
          >
            Voltar para a loja
          </Link>
        </div>
      </div>
    </main>
  );
}