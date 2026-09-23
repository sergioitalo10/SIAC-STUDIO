"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GabaritoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/designer/gabarito");
      if (!res.ok) {
        setError("Erro ao gerar gabarito. Tente novamente.");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gabarito-siac-studio.rar";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Baixe o Gabarito de Arte</h1>
        <p style={styles.subtitle}>
          Baixe o arquivo modelo para criar suas artes seguindo o padrão da
          SIAC STUDIO.
        </p>

        <div style={styles.instructions}>
          <h3 style={styles.sectionTitle}>O que você vai receber:</h3>
          <ul style={styles.list}>
            <li>
              <strong>preview.png</strong> — imagem de pré-visualização (1500x1500px
              recomendado)
            </li>
            <li>
              <strong>arquivo.rar</strong> — arquivo compactado com os 3 arquivos
              obrigatórios:
            </li>
            <ul style={styles.listInner}>
              <li>Arquivo de fonte (.ttf, .otf, .woff)</li>
              <li>Arquivo .cdr (CorelDRAW)</li>
              <li>PDF/X1A vetorizado criado pelo Corel</li>
            </ul>
          </ul>
        </div>

        <div style={styles.instructions}>
          <h3 style={styles.sectionTitle}>Padrão obrigatório:</h3>
          <ul style={styles.list}>
            <li>
              O nome <strong>SIAC STUDIO</strong> deve aparecer nas costas da
              arte em CDR, PDF e preview.png
            </li>
            <li>
              Não é permitido fazer propaganda do nome do designer
            </li>
            <li>
              Todas as artes são comercializáveis — sem exclusividade
            </li>
            <li>
              O .rar deve ser nomeado com o nome do mascote (ex:
              <code>pantera-roxa.rar</code>)
            </li>
          </ul>
        </div>

        <div style={styles.instructions}>
          <h3 style={styles.sectionTitle}>Estrutura do .rar enviado:</h3>
          <pre style={styles.code}>
{gabariroEstrutura}</pre>
        </div>

        <button
          onClick={handleDownload}
          disabled={loading}
          style={styles.button}
        >
          {loading ? "Gerando gabarito..." : "Baixar Gabarito (.rar)"}
        </button>

        {error && <p style={styles.error}>{error}</p>}

        <p style={styles.note}>
          Após baixar, extraia o gabarito, edite conforme sua arte e compacte
          novamente no formato .rar seguindo o padrão.{" "}
          <a
            href="/area-designer/upload"
            style={styles.link}
            onClick={(e) => {
              e.preventDefault();
              router.push("/area-designer/upload");
            }}
          >
            Ir para upload →
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
    maxWidth: "640px",
    width: "100%",
    backdropFilter: "blur(10px)",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: 700,
    marginBottom: "0.75rem",
    color: "#ffffff",
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: "1rem",
    color: "#a0a0b0",
    marginBottom: "1.5rem",
    textAlign: "center" as const,
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginBottom: "0.75rem",
    color: "#cccccc",
  },
  list: {
    margin: 0,
    paddingLeft: "1.5rem",
    color: "#c0c0c8",
    fontSize: "0.95rem",
    lineHeight: 1.7,
  },
  listInner: {
    margin: "0.5rem 0 0.5rem 1rem",
    paddingLeft: "1rem",
    color: "#a0a0a8",
    fontSize: "0.9rem",
  },
  code: {
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    padding: "1rem",
    fontSize: "0.85rem",
    color: "#b0b0c0",
    overflowX: "auto" as const,
    margin: "0.5rem 0 1.5rem",
    fontFamily: "monospace",
  },
  button: {
    display: "block",
    width: "100%",
    padding: "0.9rem 1.5rem",
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#ffffff",
    background: "linear-gradient(135deg, #e94560 0%, #c23152 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 15px rgba(233,69,96,0.4)",
    marginBottom: "1rem",
  },
  error: {
    color: "#ff6b6b",
    fontSize: "0.9rem",
    textAlign: "center" as const,
    marginBottom: "1rem",
  },
  note: {
    fontSize: "0.9rem",
    color: "#8888a0",
    textAlign: "center" as const,
    marginTop: "0.5rem",
  },
  link: {
    color: "#e94560",
    textDecoration: "none",
    fontWeight: 600,
  },
};

const gabariroEstrutura = `
seu-mascote.rar
├── preview.png
└── arquivo.rar
    ├── fonte-original.ttf (ou .otf, .woff)
    ├── arte.cdr (CorelDRAW)
    └── arte.pdf (PDF/X1A vetorizado)
`;
