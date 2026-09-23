"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CadastroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [termos, setTermos] = useState(false);

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nome.trim()) return setError("Nome é obrigatório.");
    if (!email.trim()) return setError("E-mail é obrigatório.");
    if (!senha) return setError("Senha é obrigatória.");
    if (senha.length < 6) return setError("Senha deve ter pelo menos 6 caracteres.");
    if (senha !== confirma) return setError("As senhas não conferem.");
    if (!termos) return setError("Você deve aceitar os termos de uso.");

    setLoading(true);
    try {
      const res = await fetch("/api/designer/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), email: email.trim().toLowerCase(), senha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao cadastrar.");
        return;
      }
      setSuccess("Cadastro realizado com sucesso! Faça login para continuar.");
      setTimeout(() => router.push("/area-designer/login"), 2000);
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Cadastro de Designer</h1>
        <p style={styles.subtitle}>
          Crie sua conta para enviar suas artes e receber 40% de cada venda.
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleCadastro} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome ou nome artístico"
              style={styles.input}
              required
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirmar senha</label>
            <input
              type="password"
              value={confirma}
              onChange={(e) => setConfirma(e.target.value)}
              placeholder="Repita a senha"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.termos}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={termos}
                onChange={(e) => setTermos(e.target.checked)}
                style={styles.checkbox}
              />
              <span style={styles.checkboxText}>
                Eu li e aceito os{" "}
                <a href="/area-designer/termos" style={styles.link}>
                  Termos de Uso
                </a>{" "}
                da SIAC STUDIO
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p style={styles.backLink}>
          Já tem conta?{" "}
          <a
            href="/area-designer/login"
            style={styles.link}
            onClick={(e) => {
              e.preventDefault();
              router.push("/area-designer/login");
            }}
          >
            Fazer login
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
    maxWidth: "540px",
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
  termos: {
    marginTop: "0.5rem",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "flex-start" as const,
    gap: "0.5rem",
    fontSize: "0.9rem",
    color: "#a0a0b0",
    cursor: "pointer",
  },
  checkbox: {
    marginTop: "0.2rem",
    accentColor: "#e94560",
  },
  checkboxText: {
    lineHeight: 1.5,
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
    marginTop: "0.5rem",
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
  successBox: {
    background: "rgba(0,230,118,0.1)",
    border: "1px solid rgba(0,230,118,0.4)",
    borderRadius: "8px",
    padding: "0.7rem 1rem",
    color: "#00e676",
    fontSize: "0.9rem",
    marginBottom: "1rem",
    textAlign: "center" as const,
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
