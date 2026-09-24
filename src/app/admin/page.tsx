"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ---------- tipagens ---------- */

interface Cliente {
  id: number;
  nome: string;
  email: string;
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

type Tab = "clientes" | "designers" | "pedidos" | "configuracoes" | "relatorios";

/* ---------- estado ---------- */

export default function AdminResidenciesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("clientes");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  /* ---------- relatórios ---------- */

  const REPORT_LABELS: Record<string, string> = {
    vendas: "Vendas (pedidos pagos)",
    faturamento: "Faturamento total",
    "artes-vendidas": "Artes vendidas por designer",
    "pagamentos-designers": "Pagamentos para designers",
  };

  const [checkboxes, setCheckboxes] = useState<Record<string, boolean>>({
    vendas: false,
    faturamento: false,
    "artes-vendidas": false,
    "pagamentos-designers": false,
  });
  const [loadingReports, setLoadingReports] = useState(false);
  const [relatoriosPreview, setRelatoriosPreview] = useState<
    Array<{ id: string; label: string; content: React.ReactNode }>
  >([]);

  async function imprimirRelatorios() {
    const selecionadas = Object.entries(checkboxes).filter(([, v]) => v);
    if (selecionadas.length === 0) return;

    setLoadingReports(true);
    setRelatoriosPreview([]);
    try {
      const res = await fetch("/api/admin/relatorios");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao carregar relatórios");

      const previews: Array<{ id: string; label: string; content: React.ReactNode }> = [];

      for (const [id] of selecionadas) {
        const label = REPORT_LABELS[id] || id;
        if (id === "vendas") {
          const rows = (data.vendas || []) as Array<{
            id: number;
            cliente_email: string;
            total: number;
            status: string;
            criado_em: string;
          }>;
          const formatoData = (s: string) => s.slice(0, 10);
          previews.push({
            id: id,
            label: label,
            content: (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="pb-2 text-left text-xs uppercase text-gray-500">ID</th>
                    <th className="pb-2 text-left text-xs uppercase text-gray-500">Cliente</th>
                    <th className="pb-2 text-left text-xs uppercase text-gray-500">Valor</th>
                    <th className="pb-2 text-left text-xs uppercase text-gray-500">Status</th>
                    <th className="pb-2 text-left text-xs uppercase text-gray-500">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-500">
                        Nenhuma venda registrada.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.id} className="border-b border-gray-800/60">
                        <td className="py-2 text-gray-300">#{r.id}</td>
                        <td className="py-2 text-gray-300">{r.cliente_email}</td>
                        <td className="py-2 font-semibold text-blue-400">
                          R$ {Number(r.total).toFixed(2).replace(".", ",")}
                        </td>
                        <td className="py-2 text-gray-400">{r.status}</td>
                        <td className="py-2 text-gray-400">{formatoData(r.criado_em)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ),
          });
        } else if (id === "faturamento") {
          const total = Number((data.faturamento as number) || 0);
          previews.push({
            id: id,
            label: label,
            content: (
              <div className="flex flex-col items-center gap-2 py-4">
                <span className="text-4xl font-bold text-green-400">
                  R$ {total.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-sm text-gray-400">
                  Total de pedidos pagos no sistema
                </span>
              </div>
            ),
          });
        } else if (id === "artes-vendidas") {
          const artistas = (data.artistas || []) as Array<{
            id: number;
            nome: string;
            email: string;
            vendas: { total_vendido: number; qtde_pedidos: number };
            sem_vendas: boolean;
          }>;
          const rows = artistas
            .map((a) => ({
              ...a,
              total_vendido: Number(a.vendas.total_vendido || 0),
              qtde_pedidos: Number(a.vendas.qtde_pedidos || 0),
            }))
            .sort((a, b) => b.total_vendido - a.total_vendido);
          const totalGeral = rows.reduce((s, a) => s + a.total_vendido, 0);
          previews.push({
            id: id,
            label: label,
            content: (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-gray-400">Total geral:</span>
                  <span className="font-semibold text-green-400">
                    R$ {totalGeral.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="pb-2 text-left text-xs uppercase text-gray-500">Designer</th>
                      <th className="pb-2 text-left text-xs uppercase text-gray-500">E-mail</th>
                      <th className="pb-2 text-left text-xs uppercase text-gray-500">Vendido</th>
                      <th className="pb-2 text-left text-xs uppercase text-gray-500">Pedidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-gray-500">
                          Nenhum designer cadastrado.
                        </td>
                      </tr>
                    ) : (
                      rows.map((a) => (
                        <tr key={a.id} className="border-b border-gray-800/60">
                          <td className="py-2 font-medium text-white">{a.nome}</td>
                          <td className="py-2 text-gray-400">{a.email}</td>
                          <td className="py-2 font-semibold text-blue-400">
                            R$ {a.total_vendido.toFixed(2).replace(".", ",")}
                          </td>
                          <td className="py-2 text-gray-400">{a.qtde_pedidos}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {artistas.some((a) => a.sem_vendas) && (
                  <div className="mt-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-400">
                    {artistas.filter((a) => a.sem_vendas).length} designer(es) sem vendas até o momento.
                  </div>
                )}
              </>
            ),
          });
        } else if (id === "pagamentos-designers") {
          const artistas = (data.artistas || []) as Array<{
            id: number;
            nome: string;
            email: string;
            vendas: { total_vendido: number; qtde_pedidos: number };
          }>;
          const rows = artistas
            .map((a) => ({
              id: a.id,
              nome: a.nome,
              email: a.email,
              total_vendido: Number(a.vendas.total_vendido || 0),
              comissao: Number(a.vendas.total_vendido || 0) * 0.4,
            }))
            .filter((a) => a.total_vendido > 0)
            .sort((a, b) => b.comissao - a.comissao);
          const totalComissao = rows.reduce((s, a) => s + a.comissao, 0);
          previews.push({
            id: id,
            label: label,
            content: (
              <>
                <div className="mb-3 flex flex-col items-center gap-2 py-4">
                  <span className="text-sm text-gray-400">Total de comissões (40% para designers):</span>
                  <span className="text-3xl font-bold text-green-400">
                    R$ {totalComissao.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="pb-2 text-left text-xs uppercase text-gray-500">Designer</th>
                      <th className="pb-2 text-left text-xs uppercase text-gray-500">E-mail</th>
                      <th className="pb-2 text-left text-xs uppercase text-gray-500">Vendido</th>
                      <th className="pb-2 text-left text-xs uppercase text-gray-500">Comissão (40%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-gray-500">
                          Nenhum designer com vendas.
                        </td>
                      </tr>
                    ) : (
                      rows.map((a) => (
                        <tr key={a.id} className="border-b border-gray-800/60">
                          <td className="py-2 font-medium text-white">{a.nome}</td>
                          <td className="py-2 text-gray-400">{a.email}</td>
                          <td className="py-2 text-gray-300">
                            R$ {a.total_vendido.toFixed(2).replace(".", ",")}
                          </td>
                          <td className="py-2 font-semibold text-green-400">
                            R$ {a.comissao.toFixed(2).replace(".", ",")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            ),
          });
        }
      }

      setRelatoriosPreview(previews);
    } catch (e: any) {
      setMsg({ tipo: "err", texto: e.message || "Erro ao gerar relatórios" });
    } finally {
      setLoadingReports(false);
    }
  }

  /* ---------- configurações ---------- */

  const [configUsername, setConfigUsername] = useState("");
  const [configNewUsername, setConfigNewUsername] = useState("");
  const [configNewPassword, setConfigNewPassword] = useState("");
  const [configConfirmPassword, setConfigConfirmPassword] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMsg, setConfigMsg] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);

  async function loadConfig() {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.admin_users && data.admin_users.length > 0) {
        setConfigUsername(data.admin_users[0].username);
        setConfigNewUsername(data.admin_users[0].username);
      } else {
        setConfigUsername("admin");
        setConfigNewUsername("admin");
      }
    } catch {
      // ignora erro de carregamento
    }
  }

  async function salvarConfig() {
    if (!configNewUsername.trim()) {
      setConfigMsg({ tipo: "err", texto: "O novo nome de usuário é obrigatório." });
      return;
    }
    if (!configNewPassword.trim()) {
      setConfigMsg({ tipo: "err", texto: "A nova senha é obrigatória." });
      return;
    }
    if (configNewPassword !== configConfirmPassword) {
      setConfigMsg({ tipo: "err", texto: "As senhas não conferem." });
      return;
    }

    setSavingConfig(true);
    setConfigMsg(null);
    try {
      const res = await fetch("/api/admin/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: configNewUsername.trim(),
          currentPassword: configUsername,
          newPassword: configNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao salvar.");
      setConfigUsername(configNewUsername);
      setConfigMsg({ tipo: "ok", texto: data.message || "Configurações atualizadas." });
      // Atualiza credenciais locais para uso futuro
      localStorage.setItem("admin_username", configNewUsername);
      localStorage.setItem("admin_password", configNewPassword);
    } catch (e: any) {
      setConfigMsg({ tipo: "err", texto: e.message || "Erro ao salvar." });
    } finally {
      setSavingConfig(false);
    }
  }

  /* ---------- autenticação e cargas ---------- */

  useEffect(() => {
    async function verificarEcarregar() {
      try {
        const authRes = await fetch("/api/admin/auth", { credentials: "include" });
        const authData = await authRes.json();

        if (!authData.authenticated) {
          router.push("/admin/login");
          return;
        }

        setAuthenticated(true);
        await loadConfig();

        const [cRes, dRes, pRes] = await Promise.all([
          fetch("/api/admin/clientes", { credentials: "include" }),
          fetch("/api/deletar-designer", { credentials: "include" }),
          fetch("/api/admin/pedidos", { credentials: "include" }),
        ]);

        const cData = await cRes.json();
        const dData = await dRes.json();
        const pData = await pRes.json();

        setClientes(cData.clientes || []);
        setDesigners(dData.designers || []);
        setPedidos(pData.pedidos || []);
      } catch (e: any) {
        console.error("[ADMIN] Erro de carregamento:", e);
        setMsg({ tipo: "err", texto: "Erro ao carregar. Tente recarregar." });
      } finally {
        setLoading(false);
      }
    }

    verificarEcarregar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          {(["clientes", "designers", "pedidos", "configuracoes"] as Tab[]).map((t) => (
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
                : t === "pedidos"
                ? "📦 Pedidos"
                : t === "configuracoes"
                ? "⚙️ Configurações"
                : "📊 Relatórios"}
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

        {/* == CONFIGURAÇÕES == */}
        {tab === "configuracoes" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Configurações</h2>
            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Login atual
                </label>
                <input
                  type="text"
                  value={configUsername}
                  readOnly
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Novo login
                </label>
                <input
                  type="text"
                  value={configNewUsername}
                  onChange={(e) => setConfigNewUsername(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nova senha
                </label>
                <input
                  type="password"
                  value={configNewPassword}
                  onChange={(e) => setConfigNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  value={configConfirmPassword}
                  onChange={(e) => setConfigConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white text-sm"
                />
              </div>
              <button
                onClick={salvarConfig}
                disabled={savingConfig}
                className="w-full rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/20 disabled:opacity-50"
              >
                {savingConfig ? "Salvando..." : "Salvar alterações"}
              </button>
              {configMsg && (
                <p className={`text-sm text-center ${configMsg.tipo === "ok" ? "text-green-400" : "text-red-400"}`}>
                  {configMsg.texto}
                </p>
              )}
            </div>
          </div>
        )}

        {/* == RELATÓRIOS == */}
        {tab === "relatorios" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Relatórios</h2>
              <span className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-1 text-xs text-gray-400">
                Selecione para imprimir
              </span>
            </div>

            <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-950 p-6">
              <p className="mb-4 text-sm text-gray-400">
                Marque os relatórios que deseja gerar e imprimir.
              </p>

              <div className="space-y-3">
                {[
                  { id: "vendas", label: "Vendas (pedidos pagos)", desc: "Lista todos os pedidos pagos com dados do cliente." },
                  { id: "faturamento", label: "Faturamento total", desc: "Soma de todos os pedidos pagos no sistema." },
                  { id: "artes-vendidas", label: "Artes vendidas por designer", desc: "Quanto cada designer vendeu em pedidos pagos." },
                  { id: "pagamentos-designers", label: "Pagamentos para designers", desc: "Relatório de pagamentos aos designers colaboradores." },
                ].map((r) => (
                  <label
                    key={r.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 transition hover:border-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={checkboxes[r.id]}
                      onChange={() => setCheckboxes((prev) => ({ ...prev, [r.id]: !prev[r.id] }))}
                      className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-gray-800 accent-blue-600"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">{r.label}</span>
                      <span className="text-xs text-gray-400">{r.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={imprimirRelatorios}
                  disabled={loadingReports || !Object.values(checkboxes).some(Boolean)}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingReports ? "Gerando..." : "Imprimir ✓"}
                </button>
              </div>
            </div>

            {relatoriosPreview.length > 0 && (
              <div className="space-y-6">
                {relatoriosPreview.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold">{r.label}</h3>
                      <span className="text-xs text-gray-500">{new Date().toLocaleDateString("pt-BR")}</span>
                    </div>
                    {r.content}
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