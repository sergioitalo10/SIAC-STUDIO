"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function RedefinirSenha() {
  return (
    <Suspense
      fallback={
        <main style={wrap}>
          <p style={muted}>Carregando...</p>
        </main>
      }
    >
      <FormularioRedefinirSenha />
    </Suspense>
  );
}

function FormularioRedefinirSenha() {
  const params = useSearchParams();
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setMsg("");

    if (senha !== confirm) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      const r = await fetch("/api/designer/auth/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.get("token"), senha }),
      });

      const d = await r.json();

      if (!r.ok) {
        setErro(d.error || "Link inválido ou expirado.");
        return;
      }

      setMsg("Senha alterada com sucesso. Você já pode entrar com a nova senha.");
      setTimeout(() => router.push("/area-designer"), 1200);
    } catch {
      setErro("Não foi possível conectar. Tente novamente.");
    }
  }

  return (
    <main style={wrap}>
      <form onSubmit={salvar} style={card}>
        <h1>Nova senha</h1>
        <p style={muted}>Crie uma nova senha com pelo menos 8 caracteres.</p>

        <label>
          Nova senha
          <input
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={input}
          />
        </label>

        <label>
          Confirmar senha
          <input
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={input}
          />
        </label>

        <button type="submit" style={button}>Redefinir senha</button>

        {msg && <p style={{ color: "#4ade80" }}>{msg}</p>}
        {erro && <p style={{ color: "#f87171" }}>{erro}</p>}
      </form>
    </main>
  );
}

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "#000",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 480,
  background: "#111",
  border: "1px solid #333",
  borderRadius: 14,
  padding: 26,
  display: "grid",
  gap: 16,
};

const input: React.CSSProperties = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  marginTop: 6,
  padding: 12,
  borderRadius: 8,
  border: "1px solid #333",
  background: "#050505",
  color: "#fff",
};

const button: React.CSSProperties = {
  padding: 12,
  border: 0,
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const muted: React.CSSProperties = { color: "#94a3b8" };
