"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Produto = {
  id: number;
  nome: string;
  arquivo: string;
  formato: string;
};

type Pedido = {
  id: string;
  status: string;
  produtos: Produto[];
};

export default function PagamentoSucessoPage() {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState(
    "Aguardando confirmação do pagamento..."
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get("pedido");

    if (!pedidoId) {
      setMensagem("Número do pedido não encontrado.");
      setCarregando(false);
      return;
    }

    let tentativas = 0;
    const maxTentativas = 20;

    const consultarPedido = async () => {
      try {
        const response = await fetch(
          `/api/orders?pedido=${encodeURIComponent(pedidoId)}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Pedido não encontrado.");
        }

        const data = await response.json();
        const pedidoAtual = data.order as Pedido;

        setPedido(pedidoAtual);

        if (pedidoAtual.status === "pagamento_aprovado") {
          setMensagem("Pagamento confirmado! Seu arquivo está disponível.");
          setCarregando(false);
          return;
        }

        if (pedidoAtual.status === "pagamento_recusado") {
          setMensagem("O pagamento não foi aprovado.");
          setCarregando(false);
          return;
        }

        tentativas++;

        if (tentativas >= maxTentativas) {
          setMensagem(
            "O pagamento ainda está sendo processado. Atualize esta página em alguns instantes."
          );
          setCarregando(false);
          return;
        }

        setMensagem(
          "Pagamento recebido. Aguardando confirmação final..."
        );

        setTimeout(consultarPedido, 3000);
      } catch (error) {
        console.error("ERRO AO CONSULTAR PEDIDO:", error);

        tentativas++;

        if (tentativas >= maxTentativas) {
          setMensagem(
            "Não foi possível consultar o pedido. Atualize a página para tentar novamente."
          );
          setCarregando(false);
          return;
        }

        setTimeout(consultarPedido, 3000);
      }
    };

    consultarPedido();
  }, []);

  const pagamentoAprovado =
    pedido?.status === "pagamento_aprovado";

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl text-center">

        <div
          className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl ${
            pagamentoAprovado
              ? "bg-green-500/20"
              : "bg-yellow-500/20"
          }`}
        >
          {pagamentoAprovado ? "✓" : "⏳"}
        </div>

        <h1 className="text-4xl font-bold">
          {pagamentoAprovado
            ? "Pagamento aprovado!"
            : "Pagamento recebido!"}
        </h1>

        <p className="mt-4 text-lg text-gray-300">
          {pagamentoAprovado
            ? "Obrigado pela sua compra."
            : "Estamos confirmando seu pagamento."}
        </p>

        <p className="mt-3 text-sm text-gray-400">
          {mensagem}
        </p>

        {pedido && (
          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6 text-left">
            <p className="text-sm text-gray-400">
              Número do pedido
            </p>

            <p className="mt-1 font-mono text-lg font-semibold">
              {pedido.id}
            </p>
          </div>
        )}

        {pagamentoAprovado && pedido?.produtos?.length ? (
          <div className="mt-8">
            <h2 className="mb-4 text-2xl font-bold">
              Seus arquivos
            </h2>

            <div className="space-y-4">
              {pedido.produtos.map((produto) => (
                <div
                  key={produto.id}
                  className="flex flex-col items-center justify-between gap-4 rounded-xl border border-green-500/20 bg-green-500/10 p-5 sm:flex-row"
                >
                  <div className="text-left">
                    <p className="font-semibold">
                      {produto.nome}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Formato: {produto.formato}
                    </p>
                  </div>

                  <a
                    href={`/api/download/${encodeURIComponent(
                      pedido.id
                    )}/${produto.id}`}
                    className="rounded-lg bg-green-600 px-6 py-3 font-semibold transition hover:bg-green-500"
                  >
                    Baixar arquivo
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : null}

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