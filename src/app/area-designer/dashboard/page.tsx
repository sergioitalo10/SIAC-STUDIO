"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Designer {
  id: number;
  nome: string;
  email: string;
}

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
}

interface Earnings {
  id: number;
  pedido_id: number;
  designer_artwork_id: number;
  valor_venda: number;
  valor_comissao: number;
  status: string;
  nome_arte: string;
  criado_em: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [designer, setDesigner] = useState<Designer | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [earnings, setEarnings] = useState<Earnings[]>([]);
  const [totalComissao, setTotalComissao] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const sessao = localStorage.getItem("designer_sessao");
    if (!sessao) {
      router.push("/area-designer");
      return;
    }

    try {
      const parsed: Designer | null = JSON.parse(sessao);
      setDesigner(parsed);
      // Carrega artworks e earnings apenas se designer for válido
      if (parsed && parsed.id) {
        Promise.all([
          fetch(`/api/designer/artworks?designer_id=${parsed.id}`)
            .then((r) => r.json())
            .catch(() => ({ artworks: [] })),
          fetch(`/api/designer/earnings?designer_id=${parsed.id}`)
            .then((r) => r.json())
            .catch(() => ({ earnings: [], total_comissao: 0 })),
        ])
          .then(([artData, earnData]) => {
            setArtworks(artData.artworks || []);
            setEarnings(earnData.earnings || []);
            setTotalComissao(earnData.total_comissao || 0);
          })
          .catch(() => setErro("Erro ao carregar dados"))
          .finally(() => setLoading(false));
      } else {
        router.push("/area-designer");
      }
    } catch {
      router.push("/area-designer");
    }
  }, [router]);

  const artPending = artworks.filter((a) => a.status === "pending").length;
  const artApproved = artworks.filter((a) => a.status === "approved").length;
  const artRejected = artworks.filter((a) => a.status === "rejected").length;
  const earningsPending = earnings.filter((e) => e.status === "pendente").length;
  const earningsPago = earnings.filter((e) => e.status === "pago").length;

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-400">Carregando dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-md px-6 py-12">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <p className="text-red-400 font-semibold">{erro}</p>
            <button
              onClick={() => router.push("/area-designer")}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Voltar ao login
            </button>
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
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-950/40 px-4 py-1.5 text-xs text-blue-400">
              <span className="font-semibold">{designer?.nome}</span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("designer_sessao");
                router.push("/area-designer");
              }}
              className="rounded-lg border border-gray-700 px-4 py-2 text-xs font-semibold text-gray-400 transition hover:bg-gray-800 hover:text-white"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        {/* RESUMO */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-5">
            <p className="text-sm font-semibold text-blue-400">Total ganho</p>
            <p className="mt-2 text-3xl font-black text-blue-400">
              R$ {totalComissao.toFixed(2).replace(".", ",")}
            </p>
            <p className="mt-1 text-xs text-gray-500">40% de todas as vendas</p>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm font-semibold text-gray-400">Arte enviada</p>
            <p className="mt-2 text-3xl font-black text-white">{artworks.length}</p>
            <p className="mt-1 text-xs text-gray-500">
              {artApproved} aprovada(s) • {artPending} pendente(s)
            </p>
          </div>
          <div className="rounded-2xl border border-green-500/20 bg-green-950/20 p-5">
            <p className="text-sm font-semibold text-green-400">Recebimentos</p>
            <p className="mt-2 text-2xl font-bold text-green-400">
              {earningsPago}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {earningsPending} pendente(s) de pagamento
            </p>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
            <p className="text-sm font-semibold text-gray-400">Status</p>
            <p className="mt-2 text-lg font-bold">
              {artApproved > 0 ? (
                <span className="text-green-400">Ativo</span>
              ) : artPending > 0 ? (
                <span className="text-yellow-400">Aguardando</span>
              ) : (
                <span className="text-gray-500">Sem artes</span>
              )}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {artApproved > 0
                ? "Suas artes estão no catálogo"
                : "Envie uma arte para começar"}
            </p>
          </div>
        </div>

        {/* TABELA DE ARTS */}
        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
          <h2 className="text-xl font-bold">Suas artes enviadas</h2>

          {artworks.length === 0 ? (
            <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
              <div className="text-4xl mb-3">🎨</div>
              <p className="text-gray-400">Você ainda não enviou nenhuma arte.</p>
              <button
                onClick={() => router.push("/area-designer/submit")}
                className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Enviar primeira arte
              </button>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 text-left text-xs font-semibold uppercase text-gray-400">
                    <th className="pb-3 pr-4">Título</th>
                    <th className="pb-3 pr-4">Categoria</th>
                    <th className="pb-3 pr-4">Preço</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {artworks.map((art) => (
                    <tr key={art.id} className="border-b border-gray-800/50">
                      <td className="py-3 pr-4">
                        <div className="max-w-[200px]">
                          <p className="font-semibold">{art.titulo}</p>
                          {art.descricao && (
                            <p className="truncate text-xs text-gray-500">{art.descricao}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-400">{art.categoria}</td>
                      <td className="py-3 pr-4 font-semibold text-blue-400">
                        R$ {Number(art.preco).toFixed(2).replace(".", ",")}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            art.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : art.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {art.status === "approved" ? "Aprovada" : art.status === "pending" ? "Pendente" : "Rejeitada"}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => router.push(`/area-designer/submit?edit=${art.id}`)}
                          className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-400 transition hover:bg-gray-800 hover:text-white"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* TABELA DE EARNINGS */}
        {earnings.length > 0 && (
          <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-950 p-6">
            <h2 className="text-xl font-bold">Recebimentos (40% por venda)</h2>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 text-left text-xs font-semibold uppercase text-gray-400">
                    <th className="pb-3 pr-4">Arte</th>
                    <th className="pb-3 pr-4">Valor da venda</th>
                    <th className="pb-3 pr-4">Sua comissão</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Pedido</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((e) => (
                    <tr key={e.id} className="border-b border-gray-800/50">
                      <td className="py-3 pr-4 font-medium">{e.nome_arte}</td>
                      <td className="py-3 pr-4 text-sm text-gray-400">
                        R$ {Number(e.valor_venda).toFixed(2).replace(".", ",")}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-green-400">
                        R$ {Number(e.valor_comissao).toFixed(2).replace(".", ",")}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            e.status === "pago"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {e.status === "pago" ? "Pago" : "Pendente"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-500">#{e.pedido_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
