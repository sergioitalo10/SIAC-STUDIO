"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ItemPedido {
  id: number;
  nome: string;
  arquivo: string;
}

interface Pedido {
  id: number;
  status: string;
  criado_em?: string;
  itens: ItemPedido[];
}

export default function MinhaContaPage() {
  const [usuario, setUsuario] = useState<{ id: number; nome: string; email: string } | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  // Formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Pedidos do cliente
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregandoPedidos, setCarregandoPedidos] = useState(false);

  useEffect(() => {
    const sessaoSalva = localStorage.getItem("cliente_sessao");
    if (sessaoSalva) {
      const datos = JSON.parse(sessaoSalva);
      setUsuario(datos);
      carregarPedidos(datos.email);
    }
  }, []);

  const carregarPedidos = async (userEmail: string) => {
    setCarregandoPedidos(true);
    try {
      const res = await fetch(`/api/meus-pedidos?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.ok) {
        setPedidos(data.pedidos || []);
      }
    } catch (err) {
      console.error("Erro ao carregar compras:", err);
    } finally {
      setCarregandoPedidos(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/cadastro";
    const body = isLogin ? { email, senha } : { nome, email, senha };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErro(data.error || "Ocorreu um erro. Tente novamente.");
        return;
      }

      localStorage.setItem("cliente_sessao", JSON.stringify(data.usuario));
      setUsuario(data.usuario);
      carregarPedidos(data.usuario.email);
    } catch (err) {
      setErro("Falha na conexão com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cliente_sessao");
    setUsuario(null);
    setPedidos([]);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col justify-between font-sans">
      {/* CABEÇALHO SIAC STUDIO */}
      <header className="border-b border-blue-900/40 bg-zinc-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-black tracking-wider text-white flex items-center gap-2">
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-extrabold text-xs shadow-lg shadow-blue-500/30">SIAC</span>
            <span className="text-slate-200">STUDIO</span>
          </Link>

          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-blue-400 transition flex items-center gap-1">
            ← Voltar para a Loja
          </Link>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full">
        {usuario ? (
          /* DASHBOARD DO CLIENTE LOGADO */
          <div className="space-y-8">
            {/* Banner de Boas-Vindas */}
            <div className="bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-950 border border-blue-900/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl shadow-blue-950/20">
              <div>
                <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20 mb-2">
                  Área Exclusiva do Cliente
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Bem-vindo(a), {usuario.nome}!</h1>
                <p className="text-sm text-slate-400 mt-1">{usuario.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-slate-300 rounded-xl border border-zinc-700 transition"
              >
                Sair da Conta
              </button>
            </div>

            {/* Lista de Pedidos & Downloads */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Meus Arquivos Digitais (.RAR)
                </h2>
                <span className="text-xs text-slate-400">{pedidos.length} pedido(s) liberado(s)</span>
              </div>

              {carregandoPedidos ? (
                <div className="text-center py-12 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p className="text-sm text-slate-400">Buscando seus downloads no SIAC STUDIO...</p>
                </div>
              ) : pedidos.length === 0 ? (
                <div className="text-center py-12 bg-zinc-950 rounded-2xl border border-dashed border-zinc-800 p-8">
                  <div className="w-12 h-12 bg-blue-600/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                    📦
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">Nenhum pedido liberado no momento</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                    Assim que o seu pagamento via PIX for aprovado, seus arquivos .RAR estarão salvos aqui para download ilimitado.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-blue-600/20"
                  >
                    Explorar Projetos no Site
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pedidos.map((pedido) => (
                    <div
                      key={pedido.id}
                      className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-5 hover:border-blue-900/50 transition"
                    >
                      <div className="flex flex-wrap justify-between items-center pb-4 mb-4 border-b border-zinc-800 gap-2">
                        <div>
                          <span className="text-xs font-semibold text-slate-400">PEDIDO #{pedido.id}</span>
                          <p className="text-xs text-slate-500">Pagamento confirmado via Mercado Pago</p>
                        </div>
                        <span className="px-3 py-1 text-xs font-bold bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                          Aprovado
                        </span>
                      </div>

                      <div className="space-y-3">
                        {pedido.itens.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black/80 p-4 rounded-xl border border-zinc-800/80 gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600/10 text-blue-400 rounded-lg flex items-center justify-center font-bold text-xs border border-blue-500/20">
                                RAR
                              </div>
                              <div>
                                <h4 className="font-semibold text-white text-sm">{item.nome}</h4>
                                <p className="text-xs text-slate-400">Arquivo Digital SIAC STUDIO</p>
                              </div>
                            </div>
                            <a
                              href={`/api/download/${pedido.id}/${item.id}`}
                              download
                              className="w-full sm:w-auto text-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-600/20"
                            >
                              Baixar Arquivo (.RAR)
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* FORMULÁRIO DE LOGIN / CADASTRO */
          <div className="max-w-md mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-blue-950/20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600/10 rounded-xl text-blue-400 mb-3 border border-blue-500/20">
                🔐
              </div>
              <h1 className="text-2xl font-bold text-white">
                {isLogin ? "Área do Cliente SIAC STUDIO" : "Criar sua Conta"}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isLogin
                  ? "Acesse para recuperar seus downloads e arquivos .RAR"
                  : "Cadastre-se para acompanhar seu histórico de compras"}
              </p>
            </div>

            {erro && (
              <div className="mb-6 p-3.5 text-xs bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                {erro}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black border border-zinc-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
                    placeholder="Seu nome"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black border border-zinc-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Senha</label>
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black border border-zinc-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg shadow-blue-600/20 text-sm disabled:opacity-50 mt-2"
              >
                {carregando ? "Entrando..." : isLogin ? "Acessar Conta" : "Criar Minha Conta"}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-zinc-800 pt-5">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErro("");
                }}
                className="text-xs text-blue-400 hover:underline font-semibold"
              >
                {isLogin
                  ? "Ainda não tem conta no SIAC STUDIO? Cadastre-se"
                  : "Já possui conta? Fazer login"}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* RODAPÉ SIAC STUDIO */}
      <footer className="border-t border-zinc-900 bg-black py-6 text-center text-xs text-slate-500">
        <p>© 2026 SIAC STUDIO — Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}