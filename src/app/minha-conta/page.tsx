"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CartButton from "@/components/CartButton";

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
      try {
        const datos = JSON.parse(sessaoSalva);
        setUsuario(datos);
        carregarPedidos(datos.email);
      } catch (e) {
        console.error("Erro ao ler sessão local:", e);
      }
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
    <main className="min-h-screen bg-black text-white flex flex-col justify-between">
      {/* CABEÇALHO IDÊNTICO À HOME */}
      <header className="border-b border-gray-800 bg-black sticky top-0 z-50 backdrop-blur-md bg-black/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold">
            SIAC <span className="text-blue-500">STUDIO</span>
          </Link>

          <nav className="hidden gap-8 md:flex">
            <Link href="/" className="hover:text-blue-500 transition">
              Loja
            </Link>
            <Link href="/#categorias" className="hover:text-blue-500 transition">
              Categorias
            </Link>
            <Link href="/#produtos" className="hover:text-blue-500 transition">
              Produtos
            </Link>
            <Link href="/#destaques" className="hover:text-blue-500 transition">
              Promoções
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {usuario && (
              <button
                onClick={handleLogout}
                className="text-sm font-semibold text-gray-400 hover:text-white transition px-2 py-1"
              >
                Sair
              </button>
            )}
            <CartButton />
          </div>
        </div>
      </header>

      {/* BANNER PRINCIPAL DO PAINEL */}
      <section className="relative overflow-hidden bg-gray-950 border-b border-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
            SIAC STUDIO — ÁREA DO CLIENTE
          </p>

          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            {usuario ? `Olá, ${usuario.nome}!` : "Acesse sua Conta"}
          </h1>

          <p className="mt-3 max-w-2xl text-base text-gray-400">
            {usuario
              ? `Gerencie e resgate o download ilimitado dos seus pacotes .RAR associados ao e-mail ${usuario.email}.`
              : "Faça login ou cadastre-se para acessar suas artes e vetores adquiridos."}
          </p>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL (DASHBOARD OU LOGIN) */}
      <section className="mx-auto max-w-7xl px-6 py-12 flex-1 w-full">
        {usuario ? (
          /* DASHBOARD LOGADO */
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-500">
                  Meus Downloads
                </p>
                <h2 className="mt-1 text-2xl font-bold">Pacotes e Arquivos Liberados</h2>
              </div>
              <span className="text-sm text-gray-400">
                {pedidos.length} {pedidos.length === 1 ? "pedido encontrado" : "pedidos encontrados"}
              </span>
            </div>

            {carregandoPedidos ? (
              <div className="rounded-2xl border border-gray-800 bg-gray-950 px-6 py-16 text-center">
                <div className="text-4xl animate-bounce">📦</div>
                <h3 className="mt-4 text-xl font-bold">Carregando seus arquivos...</h3>
              </div>
            ) : pedidos.length === 0 ? (
              <div className="rounded-2xl border border-gray-800 bg-gray-950 px-6 py-16 text-center">
                <div className="text-4xl">🔎</div>
                <h3 className="mt-4 text-xl font-bold">Nenhum pedido liberado no momento</h3>
                <p className="mt-2 text-gray-400 max-w-md mx-auto">
                  Assim que o seu pagamento via PIX for aprovado, seus arquivos .RAR aparecerão aqui automaticamente.
                </p>
                <Link
                  href="/#produtos"
                  className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
                >
                  Explorar artes na loja
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pedidos.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="rounded-2xl border border-gray-800 bg-gray-950 p-6 transition hover:border-gray-700"
                  >
                    <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-gray-800 gap-2">
                      <div>
                        <span className="text-xs font-semibold tracking-wider text-blue-500 uppercase">
                          PEDIDO #{pedido.id}
                        </span>
                        <p className="text-xs text-gray-400">Pagamento aprovado via Mercado Pago</p>
                      </div>
                      <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                        Aprovado
                      </span>
                    </div>

                    <div className="space-y-3">
                      {pedido.itens.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black/80 p-4 rounded-xl border border-gray-800 gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600/10 text-blue-400 rounded-lg flex items-center justify-center font-bold text-xs border border-blue-500/20">
                              RAR
                            </div>
                            <div>
                              <h4 className="font-semibold text-white text-sm">{item.nome}</h4>
                              <p className="text-xs text-gray-400">Arquivo Digital SIAC STUDIO</p>
                            </div>
                          </div>
                          <a
                            href={`/api/download/${pedido.id}/${item.id}`}
                            download
                            className="w-full sm:w-auto text-center px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg transition shadow-md shadow-blue-600/20"
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
        ) : (
          /* FORMULÁRIO DE LOGIN / CADASTRO */
          <div className="max-w-md mx-auto rounded-2xl border border-gray-800 bg-gray-950 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500 mb-1">
                SIAC STUDIO
              </p>
              <h2 className="text-2xl font-bold text-white">
                {isLogin ? "Entrar na sua conta" : "Criar nova conta"}
              </h2>
              <p className="text-xs text-gray-400 mt-2">
                {isLogin
                  ? "Informe seus dados para acessar seus arquivos .RAR"
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
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-white text-sm outline-none transition placeholder:text-gray-500 focus:border-blue-500"
                    placeholder="Seu nome completo"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-white text-sm outline-none transition placeholder:text-gray-500 focus:border-blue-500"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Senha</label>
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-white text-sm outline-none transition placeholder:text-gray-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50 mt-2 shadow-md shadow-blue-600/20"
              >
                {carregando ? "Acessando..." : isLogin ? "Entrar" : "Criar conta"}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-gray-800 pt-5">
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
      </section>

      {/* RODAPÉ DESTAQUES / IGUAL À HOME */}
      <footer className="border-t border-gray-900 bg-gray-950 py-8 text-center text-xs text-gray-500">
        <p>© 2026 SIAC STUDIO — Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}