
"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import type { Order } from "@/types/order";
import type { DesignerProduct } from "@/types/designer";
import type { Product } from "@/data/products";
import { createOrder } from "@/lib/orders";
import SiteHeader from "@/components/SiteHeader";

export default function CheckoutPage() {
  const { cart } = useCart();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [erro, setErro] = useState("");
  const [pedidoCriado, setPedidoCriado] = useState<Order | null>(null);
  const [enviando, setEnviando] = useState(false);

  const total = cart.reduce(
    (sum, product) => sum + Number(product.preco || 0),
    0
  );

  async function finalizarPedido() {
    setErro("");

    if (enviando) return;

    if (!nome.trim()) {
      setErro("Informe seu nome completo.");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro("Informe um e-mail válido.");
      return;
    }

    if (!whatsapp.trim()) {
      setErro("Informe seu WhatsApp.");
      return;
    }

    if (cart.length === 0) {
      setErro("Seu carrinho está vazio.");
      return;
    }

    setEnviando(true);

    const numeroPedido = `SIAC-${Date.now()}`;

    const produtosAsProduct: Product[] = cart.map(
      (p: Product | DesignerProduct) => ({
        id: p.id ?? 0,
        nome: p.nome ?? "",
        categoria: p.categoria ?? "Outros",
        preco: p.preco ?? 0,
        imagem: p.imagem ?? "",
        ...((p as any).descricao !== undefined && {
          descricao: (p as any).descricao,
        }),
        ...((p as any).formato !== undefined && {
          formato: (p as any).formato,
        }),
        ...((p as any).tamanho !== undefined && {
          tamanho: (p as any).tamanho,
        }),
        ...((p as any).mascote !== undefined && {
          mascote: (p as any).mascote,
        }),
        ...((p as any).tags !== undefined && {
          tags: (p as any).tags,
        }),
        designerId: p.designerId ?? undefined,
        designerNome: p.designerNome ?? undefined,
        designerArtworkId: p.designerArtworkId ?? undefined,
      })
    );

    const novoPedido: Order = {
      id: numeroPedido,
      data: new Date().toISOString(),
      cliente: {
        nome: nome.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
      },
      produtos: produtosAsProduct,
      total,
      status: "aguardando_pagamento",
    };

    try {
      // Mantém o registro local para a interface do cliente.
      createOrder(novoPedido);

      localStorage.setItem(
        "siac-ultimo-pedido",
        JSON.stringify(novoPedido)
      );

      // O servidor cria o pedido e a preferência de pagamento.
      // Não chamar /api/orders separadamente, para evitar duplicação.
      const response = await fetch("/api/mercadopago/preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pedido: novoPedido,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Não foi possível iniciar o pagamento."
        );
      }

      const urlPagamento = data.init_point;

      if (!urlPagamento) {
        throw new Error(
          "O Mercado Pago não retornou o endereço de pagamento."
        );
      }

      window.location.href = urlPagamento;
    } catch (error) {
      console.error("Erro ao iniciar pagamento:", error);

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o pagamento."
      );

      setEnviando(false);
    }
  }

  if (cart.length === 0 && !pedidoCriado) {
    return (
      <main className="min-h-screen bg-black text-white">
        <SiteHeader />

        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="text-5xl">🛒</div>

          <h1 className="mt-6 text-3xl font-bold">
            Seu carrinho está vazio
          </h1>

          <p className="mt-3 text-gray-400">
            Adicione pelo menos um produto antes de continuar para o checkout.
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

  if (pedidoCriado) {
    return (
      <main className="min-h-screen bg-black text-white">
        <SiteHeader />

        <section className="mx-auto max-w-2xl px-6 py-20">
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-8 text-center md:p-12">
            <div className="text-6xl">✓</div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
              Pedido criado
            </p>

            <h1 className="mt-3 text-3xl font-bold md:text-4xl">
              Tudo certo, {pedidoCriado.cliente.nome}!
            </h1>

            <p className="mt-4 text-gray-400">
              Seu pedido foi registrado com sucesso.
            </p>

            <div className="mt-8 rounded-xl border border-gray-800 bg-black p-5">
              <p className="text-sm text-gray-500">Número do pedido</p>

              <p className="mt-2 text-xl font-bold text-blue-500">
                {pedidoCriado.id}
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
              <p className="font-semibold text-yellow-400">
                Pagamento pendente
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                O pedido está aguardando a confirmação do pagamento.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
              >
                Voltar para a loja
              </Link>

              <Link
                href="/carrinho"
                className="rounded-lg border border-gray-700 px-6 py-3 font-semibold transition hover:border-blue-500 hover:text-blue-400"
              >
                Ver carrinho
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteHeader>
        <Link
          href="/carrinho"
          className="text-sm font-semibold text-gray-300 transition hover:text-blue-500"
        >
          ← Voltar ao carrinho
        </Link>
      </SiteHeader>

      <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500">
            SIAC STUDIO
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            Finalizar compra
          </h1>

          <p className="mt-3 text-gray-400">
            Preencha seus dados para criar seu pedido.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-8">
            <h2 className="text-2xl font-bold">Seus dados</h2>

            <p className="mt-2 text-sm text-gray-500">
              Essas informações serão usadas para identificar seu pedido e
              liberar posteriormente o acesso aos arquivos.
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
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Digite seu nome"
                  autoComplete="name"
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
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
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
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  placeholder="(00) 00000-0000"
                  autoComplete="tel"
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500"
                />
              </div>
            </div>

            {erro && (
              <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm font-semibold text-red-400">{erro}</p>
              </div>
            )}

            <div className="mt-8 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <p className="font-semibold text-blue-400">📦 Compra digital</p>

              <p className="mt-2 text-sm leading-6 text-gray-400">
                Não é necessário informar endereço. Os produtos serão
                disponibilizados digitalmente após a confirmação do pagamento.
              </p>
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-gray-800 bg-gray-950 p-6 lg:sticky lg:top-6">
            <h2 className="text-xl font-bold">Resumo do pedido</h2>

            <div className="mt-6 space-y-4">
              {cart.map((product, index) => (
                <div
                  key={`${"artwork_id" in product ? product.artwork_id : product.id}-${index}`}
                  className="flex gap-4"
                >
                  <img
                    src={
                      ("thumbnail_url" in product
                        ? product.thumbnail_url
                        : null) ||
                      ("imagem_url" in product ? product.imagem_url : null) ||
                      product.imagem ||
                      ""
                    }
                    alt={product.nome || ("titulo" in product ? product.titulo : "")}
                    className="h-16 w-16 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {product.nome || ("titulo" in product ? product.titulo : "")}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">Arquivo digital</p>
                  </div>

                  <p className="font-semibold">
                    R$ {Number(product.preco || 0).toFixed(2).replace(".", ",")}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-800 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total estimado</span>

                <span className="text-3xl font-bold text-blue-500">
                  R$ {total.toFixed(2).replace(".", ",")}
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                O valor definitivo será validado pelo servidor antes da cobrança.
              </p>
            </div>

            <button
              type="button"
              onClick={finalizarPedido}
              disabled={enviando}
              className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-4 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? "Preparando pagamento..." : "Continuar para pagamento"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-gray-500">
              Você será redirecionado ao Mercado Pago para concluir o pagamento.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
