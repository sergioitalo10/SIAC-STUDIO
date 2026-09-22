"use client";

import { useEffect, useState } from "react";

interface Artwork {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  preco: number;
  imagem_url: string;
  thumbnail_url: string;
  status: string;
  criado_em: string;
  aprovado_em: string | null;
  rejeitado_em: string | null;
  observacoes: string | null;
  designer_nome: string;
  designer_email: string;
}

export default function AdminArtworksPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [acaoLoading, setAcaoLoading] = useState<number | null>(null);
  const [erro, setErro] = useState("");
  const [acaoSelecionada, setAcaoSelecionada] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/designer/admin/artworks")
      .then((r) => r.json())
      .then((data) => {
        setArtworks(data.artworks || []);
      })
      .catch(() => setErro("Erro ao carregar"))
      .finally(() => setLoading(false));
  }, []);

  async function handleAcao(artworkId: number, acao: "approve" | "reject", observacoes?: string) {
    setAcaoLoading(artworkId);
    setErro("");

    try {
      const res = await fetch("/api/designer/admin/artworks/acao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artwork_id: artworkId, acao, observacoes }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao processar");
        return;
      }

      // Atualiza o estado local
      setArtworks((prev) =>
        prev.map((a) =>
          a.id === artworkId
            ? {
                ...a,
                status: acao === "approve" ? "approved" : "rejected",
                aprovado_em: acao === "approve" ? new Date().toISOString() : a.aprovado_em,
                rejeitado_em: acao === "reject" ? new Date().toISOString() : a.rejeitado_em,
                observacoes: acao === "reject" ? (observacoes ?? a.observacoes) : a.observacoes,
              }
            : a
        )
      );
    } catch {
      setErro("Erro de conexão");
    } finally {
      setAcaoLoading(null);
      setAcaoSelecionada(null);
    }
  }

  const pendentes = artworks.filter((a) => a.status === "pending");
  const aprovadas = artworks.filter((a) => a.status === "approved");
  const rejeitadas = artworks.filter((a) => a.status === "rejected");

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">Carregando...</p>
        </div>
      </main>
    );
  }

  if (erro && artworks.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-lg px-6 py-12">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <p className="text-red-400 font-semibold">{erro}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="border-b border-gray-800 sticky top-0 z-40 bg-black/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-2xl font-bold"
            >
              SIAC <span className="text-blue-500">STUDIO</span>
            </a>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
              Painel Admin
            </span>
          </div>
          <a
            href="/area-designer"
            className="rounded-lg border border-gray-700 px-4 py-2 text-xs font-semibold text-gray-400 transition hover:bg-gray-800 hover:text-white"
          >
            Área do Designer
          </a>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        {/* RESUMO */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-950/20 p-5">
            <p className="text-sm font-semibold text-yellow-400">Aguardando aprovação</p>
            <p className="mt-2 text-3xl font-black text-yellow-400">{pendentes.length}</p>
            <p className="mt-1 text-xs text-gray-500">Precisam de decisão do admin</p>
          </div>
          <div className="rounded-2xl border border-green-500/20 bg-green-950/20 p-5">
            <p className="text-sm font-semibold text-green-400">Aprovadas</p>
            <p className="mt-2 text-3xl font-black text-green-400">{aprovadas.length}</p>
            <p className="mt-1 text-xs text-gray-500">No catálogo do site</p>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-5">
            <p className="text-sm font-semibold text-red-400">Rejeitadas</p>
            <p className="mt-2 text-3xl font-black text-red-400">{rejeitadas.length}</p>
            <p className="mt-1 text-xs text-gray-500">Não entrarão no catálogo</p>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm font-semibold text-gray-400">Total de entregas</p>
            <p className="mt-2 text-3xl font-black text-white">{artworks.length}</p>
            <p className="mt-1 text-xs text-gray-500">Todas as épocas</p>
          </div>
        </div>

        {/* LISTA DE PENDENTES (destaque) */}
        {pendentes.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-bold">⏳ Aguardando aprovação</h2>
            <div className="space-y-4">
              {pendentes.map((art) => (
                <div
                  key={art.id}
                  className="rounded-2xl border border-gray-800 bg-gray-950 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                      {art.thumbnail_url && (
                        <img
                          src={art.thumbnail_url}
                          alt={art.titulo}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                          Pendente • {art.criado_em?.substring(0, 10)}
                        </p>
                        <h3 className="mt-1 text-lg font-bold">{art.titulo}</h3>
                        {art.descricao && (
                          <p className="mt-1 text-sm text-gray-400 line-clamp-2">{art.descricao}</p>
                        )}
                        <div className="mt-2 flex gap-4 text-sm">
                          <span className="text-gray-500"> por <span className="text-gray-300">{art.designer_nome}</span></span>
                          <span className="font-semibold text-blue-400">
                            R$ {Number(art.preco).toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                        {art.designer_email && (
                          <p className="mt-1 text-xs text-gray-600">{art.designer_email}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:mr-4">
                      <button
                        onClick={() => handleAcao(art.id, "approve")}
                        disabled={acaoLoading === art.id}
                        className="rounded-lg bg-green-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-green-500 disabled:opacity-50"
                      >
                        {acaoLoading === art.id ? "Processando..." : "Aprovar ✓"}
                      </button>
                      <button
                        onClick={() => setAcaoSelecionada(art.id)}
                        disabled={acaoLoading === art.id}
                        className="rounded-lg border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                      >
                        Rejeitar ✕
                      </button>
                    </div>
                  </div>

                  {/* Form de rejeição */}
                  {acaoSelecionada === art.id && (
                    <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                      <p className="text-xs font-semibold text-red-400 mb-2">Motivo da rejeição (opcional):</p>
                      <textarea
                        className="w-full rounded-lg border border-gray-700 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 focus:border-red-500 resize-none"
                        rows={2}
                        placeholder="Ex: Imagem muito baixa resolução..."
                        defaultValue={art.observacoes || ""}
                        onBlur={(e) => handleAcao(art.id, "reject", e.target.value)}
                        autoFocus
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => setAcaoSelecionada(null)}
                          className="rounded-lg border border-gray-700 px-3 py-1 text-xs text-gray-400 transition hover:bg-gray-800"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleAcao(art.id, "reject", "Rejeitada pelo admin")}
                          className="rounded-lg bg-red-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-red-500"
                        >
                          Confirmar rejeição
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TABELA DE APROVADAS */}
        {aprovadas.length > 0 && (
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
            <h2 className="mb-4 text-xl font-bold">✅ Aprovadas</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 text-left text-xs font-semibold uppercase text-gray-400">
                    <th className="pb-3 pr-4">Título</th>
                    <th className="pb-3 pr-4">Designer</th>
                    <th className="pb-3 pr-4">Preço</th>
                    <th className="pb-3 pr-4">Aprovado em</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {aprovadas.map((art) => (
                    <tr key={art.id} className="border-b border-gray-800/50">
                      <td className="py-3 pr-4">
                        <p className="font-semibold">{art.titulo}</p>
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-400">{art.designer_nome}</td>
                      <td className="py-3 pr-4 font-semibold text-blue-400">
                        R$ {Number(art.preco).toFixed(2).replace(".", ",")}
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-500">
                        {art.aprovado_em?.substring(0, 10)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-semibold text-green-400">
                          Aprovada
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABELA DE REJEITADAS */}
        {rejeitadas.length > 0 && (
          <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-950 p-6">
            <h2 className="mb-4 text-xl font-bold">✕ Rejeitadas</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 text-left text-xs font-semibold uppercase text-gray-400">
                    <th className="pb-3 pr-4">Título</th>
                    <th className="pb-3 pr-4">Designer</th>
                    <th className="pb-3 pr-4">Motivo</th>
                    <th className="pb-3 pr-4">Rejeitado em</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rejeitadas.map((art) => (
                    <tr key={art.id} className="border-b border-gray-800/50">
                      <td className="py-3 pr-4">
                        <p className="font-semibold">{art.titulo}</p>
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-400">{art.designer_nome}</td>
                      <td className="py-3 pr-4 text-sm text-gray-500">
                        {art.observacoes || "Sem motivo"}
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-500">
                        {art.rejeitado_em?.substring(0, 10)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-400">
                          Rejeitada
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {artworks.length === 0 && (
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-10 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold">Nenhuma entrega ainda</h3>
            <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
              Quando um designer enviar uma arte, ela aparecerá aqui para você aprovar ou rejeitar.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
