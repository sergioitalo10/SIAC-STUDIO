"use client";

import { useEffect, useState } from "react";

/* ---------- tipagens ---------- */

interface Cliente {
  id: number;
  nome: string;
  email: string;
  created_at: string;
}

interface Designer {
  id: number;
  nome: string;
  email: string;
  pix: string | null;
  created_at: string;
}

interface PedidoItem {
  id: number;
  produto_id: number | null;
  nome: string | null;
  quantidade: number;
  preco: number;
}

interface Pedido {
  id: number;
  cliente: string;
  email: string;
  total: number;
  status: string;
  criado_em: string;
  itens: PedidoItem[];
}

type Tab = "clientes" | "designers" | "pedidos";

/* ---------- estado ---------- */

export default function AdminResidenciesPage() {
  const [tab, setTab] = useState<Tab>("clientes");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);

  /* ---------- cargas ---------- */

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/clientes").then((r) => r.json()),
      fetch("/api/deletar-designer").then((r) => r.json()),
      fetch("/api/admin/pedidos").then((r) => r.json()),
    ])
      .then(([c, d, p]) => {
        setClientes(c.clientes || []);
        setDesigners(d.designers || []);
        setPedidos(p.pedidos || []);
      })
      .catch(() => setMsg({ tipo: "err", texto: "Erro ao carregar dados" }))
      .finally(() => setLoading(false));
  }, []);

  /* ---------- deleções ---------- */

  async function apagarCliente(id: number) {
    if (!confirm("Apagar este cliente permanentemente?")) return;
    setDeletingId(id);
    setMsg(null);
    try {
      const res = await fetch(`/api/deletar-cliente?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha");
      setClientes((prev) => prev.filter((c) => c.id !== id));
      setMsg({ tipo: "ok", texto: data.message || "Cliente removido." });
    } catch (e: any) {
      setMsg({ tipo: "err", texto: e.message || "Erro ao remover" });
    } finally {
      setDeletingId(null);
    }
  }

  async function apagarDesigner(id: number) {
    if (!confirm("Apagar este designer permanentemente?")) return;
    setDeletingId(id);
    setMsg(null);
    try {
      const res = await fetch(`/api/deletar-designer?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha");
      setDesigners((prev) => prev.filter((d) => d.id !== id));
      setMsg({ tipo: "ok", texto: data.message || "Designer removido." });
    } catch (e: any) {
      setMsg({ tipo: "err", texto: e.message || "Erro ao remover" });
    } finally {
      setDeletingId(null);
    }
  }

  async function apagarPedido(id: number) {
    if (!confirm("Apagar este pedido e seus itens permanentemente?")) return;
    setDeletingId(id);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/pedidos?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha");
      setPedidos((prev) => prev.filter((p) => p.id !== id));
      setMsg({ tipo: "ok", texto: data.message || "Pedido removido." });
    } catch (e: any) {
      setMsg({ tipo: "err", texto: e.message || "Erro ao remover" });
    } finally {
      setDeletingId(null);
    }
  }

  /* ---------- helpers ---------- */

  const formatBrl = (n: number) =>
    "R$ " + Number(n).toFixed(2).replace(".", ",");
  const isoToDate = (s: string) => s.slice(0, 10);

  /* ---------- renderização ---------- */

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">Carregando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* mensagem 률osa */}
      {msg && (
        <div
          className={`mx-auto max-w-4xl mx-6 mb-6 rounded-xl border p-4 text-center text-sm transition ${
            msg.tipo === "ok"
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {msg.texto}
        </div>
      )}

      {/* HEADER */}
      <header className="border-b border-gray-800 sticky top-0 z-40 bg-black/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="/" className="text-2xl font-bold">
              SIAC{" "}
              <span className="text-blue-500">STUDIO</span>
            </a>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
              Painel Admin
            </span>
          </div>
          <a
            href="/"
            className="rounded-lg border border-gray-700 px-4 py-2 text-xs font-semibold text-gray-400 transition hover:bg-gray-800 hover:text-white"
          >
            Voltar ao site
          </a>
        </div>
      </header>

      {/* TABS */}
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <div className="rounded-xl border border-gray-800 bg-gray-950 p-1">
          {(["clientes", "designers", "pedidos"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                tab === t
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              {t === "clientes"
                ? "👥 Clientes"
                : t === "designers"
                ? "🎨 Designers"
                : "📦 Pedidos"}
            </button>
          ))}
        </div>
      </div>

      {/* CONTEÚDO */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        {/* == CLIENTES == */}
        {tab === "clientes" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Clientes cadastrados</h2>
              <span className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-1 text-xs text-gray-400">
                {clientes.length} registro(s)
              </span>
            </div>

            {clientes.length === 0 ? (
              <div className="rounded-2xl border border-gray-800 bg-gray-950 p-10 text-center">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-xl font-bold">Nenhum cliente</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Clientes que se cadastraram no site aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientes.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-col gap-3 rounded-2xl border border-gray-800 bg-gray-950 p-5 transition hover:border-gray-700"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Cliente #{c.id}
                        </p>
                        <h3 className="text-lg font-bold">{c.nome}</h3>
                        <p className="text-sm text-gray-400">{c.email}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>Cadastrado em {isoToDate(c.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => apagarCliente(c.id)}
                        disabled={deletingId === c.id}
                        className="rounded-lg border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {deletingId === c.id ? "Apagando..." : "Remover ✓"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* == DESIGNERS == */}
        {tab === "designers" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Designers colaboradores</h2>
              <span className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-1 text-xs text-gray-400">
                {designers.length} registro(s)
              </span>
            </div>

            {designers.length === 0 ? (
              <div className="rounded-2xl border border-gray-800 bg-gray-950 p-10 text-center">
                <div className="text-5xl mb-4">🎨</div>
                <h3 className="text-xl font-bold">Nenhum designer</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Designers que se cadastram na área dele aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {designers.map((d) => (
                  <div
                    key={d.id}
                    className="flex flex-col gap-3 rounded-2xl border border-gray-800 bg-gray-950 p-5 transition hover:border-gray-700"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Designer #{d.id}
                        </p>
                        <h3 className="text-lg font-bold">{d.nome}</h3>
                        <p className="text-sm text-gray-400">{d.email}</p>
                        {d.pix ? (
                          <p className="mt-1 text-xs text-green-400">
                            Chave PIX: {d.pix}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-yellow-500">
                            Sem chave PIX cadastrada
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>Cadastrado em {isoToDate(d.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => apagarDesigner(d.id)}
                        disabled={deletingId === d.id}
                        className="rounded-lg border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {deletingId === d.id ? "Apagando..." : "Remover ✓"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* == PEDIDOS == */}
        {tab === "pedidos" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Pedidos</h2>
              <span className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-1 text-xs text-gray-400">
                {pedidos.length} registro(s)
              </span>
            </div>

            {pedidos.length === 0 ? (
              <div className="rounded-2xl border border-gray-800 bg-gray-950 p-10 text-center">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-xl font-bold">Nenhum pedido</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Pedidos de compra aparecerão aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pedidos.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col gap-3 rounded-2xl border border-gray-800 bg-gray-950 p-5 transition hover:border-gray-700"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                          Pedido #{p.id}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-3 text-sm">
                          <span className="font-semibold">{p.cliente}</span>
                          <span className="text-gray-400">{p.email}</span>
                          <span className="font-semibold text-blue-400">
                            {formatBrl(p.total)}
                          </span>
                        </div>
                        {p.itens && p.itens.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {p.itens.map((it) => (
                              <span
                                key={it.id}
                                className="rounded-full border border-gray-800 bg-gray-900 px-2 py-0.5 text-xs text-gray-400"
                              >
                                {it.nome || `Produto #${it.produto_id}`} ×{it.quantidade}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 text-xs text-gray-500">
                        <span>Cadastro: {isoToDate(p.criado_em)}</span>
                        <span
                          className={
                            p.status === "pago"
                              ? "text-green-400"
                              : p.status === "pendente" || p.status === "Pendente"
                              ? "text-yellow-400"
                              : p.status === "aguardando_pagamento"
                              ? "text-blue-400"
                              : "text-gray-400"
                          }
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => apagarPedido(p.id)}
                        disabled={deletingId === p.id}
                        className="rounded-lg border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {deletingId === p.id ? "Apagando..." : "Remover ✓"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
