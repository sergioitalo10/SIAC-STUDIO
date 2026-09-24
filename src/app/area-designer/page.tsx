"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AreaDesignerPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "cadastro">("login");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Form login
  const [lEmail, setLEmail] = useState("");
  const [lSenha, setLSenha] = useState("");

  // Form cadastro
  const [cNome, setCNome] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cSenha, setCSenha] = useState("");
  const [cConfirma, setCConfirma] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch("/api/designer/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lEmail, senha: lSenha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Falha no login");
        return;
      }

      // Salva na localStorage
      localStorage.setItem("designer_sessao", JSON.stringify(data.designer));
      router.push("/area-designer/dashboard");
    } catch (err) {
      setErro("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (cSenha !== cConfirma) {
      setErro("As senhas não conferem");
      return;
    }

    if (cSenha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/designer/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: cNome, email: cEmail, senha: cSenha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Falha no cadastro");
        return;
      }

      // Salva na localStorage e redireciona
      localStorage.setItem("designer_sessao", JSON.stringify(data.designer));
      router.push("/area-designer/dashboard");
    } catch (err) {
      setErro("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="border-b border-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a
            href="/"
            className="text-2xl font-bold"
          >
            SIAC <span className="text-blue-500">STUDIO</span>
          </a>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
            Área do Designer
          </span>
        </div>
      </header>

      {/* TABS */}
      <div className="border-b border-gray-800 bg-gray-950/50 px-6 py-4">
        <nav className="flex gap-6 text-sm font-semibold">
          <button
            onClick={() => setTab("login")}
            className={`transition ${
              tab === "login"
                ? "text-blue-400 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setTab("cadastro")}
            className={`transition ${
              tab === "cadastro"
                ? "text-blue-400 border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Criar conta
          </button>
        </nav>
      </div>

      {/* FORM */}
      <section className="mx-auto max-w-md px-6 py-12">
        {erro && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm font-semibold text-red-400">{erro}</p>
          </div>
        )}

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
            <h2 className="text-xl font-bold">Entrar na área do designer</h2>
            <p className="mt-1 text-sm text-gray-400">
              Já tem conta? Faça login para enviar suas artes.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">E-mail</label>
                <input
                  type="email"
                  value={lEmail}
                  onChange={(e) => setLEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Senha</label>
                <input
                  type="password"
                  value={lSenha}
                  onChange={(e) => setLSenha(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <p className="mt-4 text-center text-xs text-gray-500">
              Não tem conta?{" "}
              <button
                onClick={() => setTab("cadastro")}
                className="text-blue-400 hover:text-blue-300"
              >
                Crie uma agora
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleCadastro} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
            <h2 className="text-xl font-bold">Criar conta de designer</h2>
            <p className="mt-1 text-sm text-gray-400">
              Sua arte publicada em segundos!
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">Nome completo</label>
                <input
                  type="text"
                  value={cNome}
                  onChange={(e) => setCNome(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">E-mail</label>
                <input
                  type="email"
                  value={cEmail}
                  onChange={(e) => setCEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Senha</label>
                <input
                  type="password"
                  value={cSenha}
                  onChange={(e) => setCSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Confirmar senha</label>
                <input
                  type="password"
                  value={cConfirma}
                  onChange={(e) => setCConfirma(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>

            <p className="mt-4 text-center text-xs text-gray-500">
              Já tem conta?{" "}
              <button
                onClick={() => setTab("login")}
                className="text-blue-400 hover:text-blue-300"
              >
                Faça login
              </button>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
