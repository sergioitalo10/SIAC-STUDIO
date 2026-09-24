"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha ao fazer login.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* LOGO */}
        <div className="mb-8 text-center">
          <a href="/" className="text-3xl font-bold">
            SIAC{" "}
            <span className="text-blue-500">STUDIO</span>
          </a>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
            Painel Admin — Acesso Restrito
          </p>
        </div>

        {/* FORM */}
        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-8">
          <h2 className="mb-2 text-xl font-bold">Entrar no admin</h2>
          <p className="mb-6 text-xs text-gray-400">
            Primeiro acesso: login <span className="text-blue-400 font-semibold">admin</span> / senha{" "}
            <span className="text-blue-400 font-semibold">admin</span>
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2.5 text-white outline-none focus:border-blue-500"
                placeholder="seu_usuario_admin"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-2.5 text-white outline-none focus:border-blue-500"
                placeholder="********"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Acesso restrito a administradores
        </p>
      </div>
    </main>
  );
}
