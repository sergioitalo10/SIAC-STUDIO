"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/designer/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), senha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "E-mail ou senha incorretos.");
        return;
      }
      localStorage.setItem("designer_sessao", JSON.stringify(data.designer));
      router.push("/area-designer/dashboard");
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login Designer</h1>
        <p style={styles.subtitle}>
          Acesse sua conta para enviar novas artes e acompanhar suas comissões.
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p style={styles.backLink}>
          Não tem conta?{" "}
          <a
            href="/area-designer/cadastro"
            style={styles.link}
            onClick={(e) => {
              e.preventDefault();
              router.push("/area-designer/cadastro");
            }}
          >
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    color: "#eaeaea",
    fontFamily: 'Segoe UI, "Helvetica Neue", Arial, sans-serif',
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "2.5rem",
    maxWidth: "440px",
    width: "100%",
    backdropFilter: "blur(10px)",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
    color: "#ffffff",
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: "1rem",
    color: "#a0a0b0",
    marginBottom: "1.5rem",
    textAlign: "center" as const,
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.3rem",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "#c0c0c8",
  },
  input: {
    padding: "0.7rem 1rem",
    fontSize: "1rem",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.05)",
    color: "#ffffff",
    outline: "none",
  },
  button: {
    padding: "0.85rem",
    fontSize: "1.05rem",
    fontWeight: 600,
    color: "#ffffff",
    background: "linear-gradient(135deg, #e94560 0%, #c23152 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(233,69,96,0.4)",
  },
  errorBox: {
    background: "rgba(255,107,107,0.1)",
    border: "1px solid rgba(255,107,107,0.4)",
    borderRadius: "8px",
    padding: "0.7rem 1rem",
    color: "#ff6b6b",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },
  backLink: {
    textAlign: "center" as const,
    marginTop: "1.5rem",
    fontSize: "0.95rem",
    color: "#8888a0",
  },
  link: {
    color: "#e94560",
    textDecoration: "none",
    fontWeight: 600,
  },
};
