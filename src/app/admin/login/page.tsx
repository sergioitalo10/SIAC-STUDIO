"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setError(data.error || "Falha no login");
        return;
      }

      // Salva na localStorage para manter sessão
      localStorage.setItem("admin_logado", "true");
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: "#111",
        border: "1px solid #333",
        borderRadius: "12px",
        padding: "40px",
        width: "100%",
        maxWidth: "400px",
      }}>
        <h1 style={{
          color: "#60a5fa",
          marginBottom: "8px",
          fontSize: "24px",
          textAlign: "center",
        }}>
          SIAC STUDIO - Admin
        </h1>
        <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: "30px" }}>
          Faça login para acessar o painel
        </p>

        {error && (
          <div style={{
            background: "rgba(248, 113, 113, 0.1)",
            color: "#f87171",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "20px",
            fontSize: "14px",
            textAlign: "center",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#94a3b8",
              fontSize: "14px",
            }}>
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              style={{
                width: "100%",
                padding: "12px",
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              color: "#94a3b8",
              fontSize: "14px",
            }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin"
              required
              style={{
                width: "100%",
                padding: "12px",
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
