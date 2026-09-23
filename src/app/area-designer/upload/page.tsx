"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [session, setSession] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const sessao = localStorage.getItem("designer_sessao");
    if (sessao) {
      try {
        const parsed = JSON.parse(sessao);
        setSession(parsed);
      } catch {
        localStorage.removeItem("designer_sessao");
        router.push("/area-designer/login");
      }
    } else {
      router.push("/area-designer/login");
    }
  }, [router]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 30 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 30MB.");
      setFile(null);
      setFileName("");
      const input1 = e.target as HTMLInputElement;
      input1.value = "";
      return;
    }
    const ext = selected.name.split(".").pop()?.toLowerCase();
    if (ext !== "rar") {
      setError("Envie apenas arquivos .rar.");
      setFile(null);
      setFileName("");
      const _input2 = e.target as HTMLInputElement;
      _input2.value = "";
      return;
    }
    setFile(selected);
    setFileName(selected.name);
    setError("");
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError("Selecione um arquivo .rar para enviar.");
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mascote", fileName.replace(".rar", "").toLowerCase());

    try {
      const res = await fetch("/api/designer/artworks/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao enviar arquivo.");
        return;
      }
      setSuccess("Arquivo enviado com sucesso! Ele será analisado em breve.");
      setFile(null);
      setFileName("");
      const form = document.querySelector("form") as HTMLFormElement | null;
      if (form) form.reset();
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!session) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Enviar Nova Arte</h1>
          <div style={styles.sessaoInfo}>
            <span style={styles.sessaoLabel}>Designer:</span>
            <span style={styles.sessaoValue}>{session.nome}</span>
          </div>
        </div>

        <p style={styles.subtitle}>
          Selecione o arquivo <strong>.rar</strong> contendo{" "}
          <code>preview.png</code> e <code>arquivo.rar</code> (com fonte, .cdr e
          PDF/X1A). O nome do arquivo deve ser o nome do mascote.
        </p>

        <div style={styles.checklist}>
          <h3 style={styles.checkTitle}>Antes de enviar, verifique:</h3>
          <ul style={styles.checkList}>
            <li>
              ✅ O .rar está nomeado com o nome do mascote (ex:{" "}
              <code>pantera-roxa.rar</code>)
            </li>
            <li>
              ✅ O .rar contém <strong>preview.png</strong>
            </li>
            <li>
              ✅ O .rar contém <strong>arquivo.rar</strong> com os 3 arquivos:
              fonte, .cdr e PDF/X1A
            </li>
            <li>
              ✅ A arte possui o nome <strong>SIAC STUDIO</strong> nas costas
              (CDR, PDF e preview.png)
            </li>
            <li>
              ✅ Não há propaganda do nome do designer na arte
            </li>
            <li>
              ✅ O arquivo tem no máximo <strong>30MB</strong>
            </li>
          </ul>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleUpload} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Arquivo .rar (máx. 30MB)</label>
            <input
              type="file"
              accept=".rar"
              onChange={handleFileChange}
              style={styles.fileInput}
              required
            />
            {fileName && (
              <p style={styles.fileName}>📦 {fileName}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            style={{
              ...styles.button,
              opacity: loading || !file ? 0.6 : 1,
              cursor: loading || !file ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Enviando..." : "Enviar Arte"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerText}>ou</span>
        </div>

        <p style={styles.gabaritoLink}>
          Não tem o gabarito?{" "}
          <a
            href="/area-designer/gabarito"
            style={styles.link}
            onClick={(e) => {
              e.preventDefault();
              router.push("/area-designer/gabarito");
            }}
          >
            Baixe o modelo aqui →
          </a>
        </p>

        <p style={styles.backLink}>
          <a
            href="/area-designer/dashboard"
            style={styles.link}
            onClick={(e) => {
              e.preventDefault();
              router.push("/area-designer/dashboard");
            }}
          >
            ← Voltar ao dashboard
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
    fontFamily:
      'Segoe UI, "Helvetica Neue", Arial, sans-serif',
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "2.5rem",
    maxWidth: "560px",
    width: "100%",
    backdropFilter: "blur(10px)",
  },
  header: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center" as const,
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#ffffff",
    textAlign: "center" as const,
  },
  sessaoInfo: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    fontSize: "0.95rem",
  },
  sessaoLabel: {
    color: "#8888a0",
  },
  sessaoValue: {
    color: "#e94560",
    fontWeight: 600,
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#a0a0b0",
    marginBottom: "1.5rem",
    lineHeight: 1.6,
  },
  checklist: {
    background: "rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    padding: "1.2rem",
    marginBottom: "1.5rem",
  },
  checkTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#cccccc",
    marginBottom: "0.7rem",
  },
  checkList: {
    margin: 0,
    paddingLeft: "1.2rem",
    color: "#b0b0b8",
    fontSize: "0.9rem",
    lineHeight: 1.6,
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
  fileInput: {
    padding: "0.5rem",
    fontSize: "0.95rem",
    border: "1px dashed rgba(255,255,255,0.2)",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.03)",
    color: "#a0a0a8",
    cursor: "pointer",
  },
  fileName: {
    fontSize: "0.85rem",
    color: "#00e676",
    marginTop: "0.2rem",
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
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    margin: "1.5rem 0",
    color: "#555570",
  },
  dividerText: {
    fontWeight: 600,
    fontSize: "0.85rem",
  },
  gabaritoLink: {
    textAlign: "center" as const,
    fontSize: "0.95rem",
    color: "#8888a0",
    marginBottom: "1rem",
  },
  backLink: {
    textAlign: "center" as const,
    fontSize: "0.95rem",
    color: "#8888a0",
  },
  link: {
    color: "#e94560",
    textDecoration: "none",
    fontWeight: 600,
  },
};
