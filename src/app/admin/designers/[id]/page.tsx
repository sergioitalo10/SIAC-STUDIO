"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Designer = {
  id: number;
  nome: string;
  email: string;
  whatsapp: string | null;
  documento: string | null;
  status: string;
  percentual_comissao: number | string;
  dados_pagamento: string | null;
  pix: string | null;
  created_at: string;
};

export default function DesignerConfig() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [d, setD] = useState<Designer | null>(null);
  const [form, setForm] = useState({
    nome: "",
    whatsapp: "",
    documento: "",
    dados_pagamento: "",
    pix: "",
    percentual_comissao: "40",
  });
  const [msg, setMsg] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const response = await fetch(`/api/admin/designers/${id}`);
        const data = await response.json();

        if (response.status === 401) {
          router.push("/admin/login");
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || "Não foi possível carregar o designer.");
        }

        if (!ativo) return;

        const designer: Designer = data.designer;
        setD(designer);
        setForm({
          nome: designer.nome || "",
          whatsapp: designer.whatsapp || "",
          documento: designer.documento || "",
          dados_pagamento: designer.dados_pagamento || "",
          pix: designer.pix || "",
          percentual_comissao: String(designer.percentual_comissao ?? 40),
        });
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Erro ao carregar o designer."
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [id, router]);

  async function salvar() {
    setMsg("");
    setErro("");
    setSalvando(true);

    try {
      const response = await fetch(`/api/admin/designers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          percentual_comissao: Number(form.percentual_comissao),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível salvar.");
      }

      setD((atual) =>
        atual
          ? {
              ...atual,
              ...form,
              percentual_comissao: Number(form.percentual_comissao),
            }
          : atual
      );

      setMsg("Dados do designer salvos com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Erro ao salvar os dados."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main style={estilos.pagina}>
        Carregando dados do designer...
      </main>
    );
  }

  if (!d) {
    return (
      <main style={estilos.pagina}>
        <p>{erro || "Designer não encontrado."}</p>
        <button onClick={() => router.push("/admin")} style={estilos.botao}>
          Voltar ao painel
        </button>
      </main>
    );
  }

  return (
    <main style={estilos.pagina}>
      <div style={estilos.conteudo}>
        <button
          onClick={() => router.push("/admin")}
          style={estilos.voltar}
        >
          ← Voltar ao painel
        </button>

        <h1 style={{ color: "#60a5fa" }}>Configurar designer</h1>

        <section style={estilos.card}>
          <h2>{d.nome}</h2>
          <p style={{ color: "#94a3b8" }}>{d.email}</p>
          <p>
            Status atual: <strong>{d.status}</strong>
          </p>
          <p style={{ color: "#94a3b8" }}>
            Cadastrado em:{" "}
            {d.created_at
              ? new Date(d.created_at).toLocaleDateString("pt-BR")
              : "Não informado"}
          </p>

          <div style={estilos.grade}>
            <label>
              Nome
              <input
                value={form.nome}
                onChange={(e) =>
                  setForm({ ...form, nome: e.target.value })
                }
                style={estilos.input}
              />
            </label>

            <label>
              WhatsApp
              <input
                value={form.whatsapp}
                onChange={(e) =>
                  setForm({ ...form, whatsapp: e.target.value })
                }
                style={estilos.input}
              />
            </label>

            <label>
              Documento
              <input
                value={form.documento}
                onChange={(e) =>
                  setForm({ ...form, documento: e.target.value })
                }
                style={estilos.input}
              />
            </label>

            <label>
              Comissão (%)
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.percentual_comissao}
                onChange={(e) =>
                  setForm({
                    ...form,
                    percentual_comissao: e.target.value,
                  })
                }
                style={estilos.input}
              />
            </label>

            <label>
              Chave PIX
              <input
                value={form.pix}
                onChange={(e) =>
                  setForm({ ...form, pix: e.target.value })
                }
                style={estilos.input}
              />
            </label>

            <label>
              Outros dados de pagamento
              <input
                value={form.dados_pagamento}
                onChange={(e) =>
                  setForm({ ...form, dados_pagamento: e.target.value })
                }
                style={estilos.input}
              />
            </label>
          </div>

          <button
            onClick={salvar}
            disabled={salvando}
            style={estilos.botao}
          >
            {salvando ? "Salvando..." : "Salvar dados do designer"}
          </button>

          {msg && <p style={{ color: "#4ade80" }}>{msg}</p>}
          {erro && <p style={{ color: "#f87171" }}>{erro}</p>}
        </section>

        <section style={estilos.card}>
          <h2>Artes e comissões</h2>
          <p style={{ color: "#94a3b8" }}>
            Essa parte ficará disponível quando confirmarmos as tabelas
            relacionadas no banco de dados.
          </p>
        </section>

        <section style={estilos.card}>
          <h2>Senha do designer</h2>
          <p style={{ color: "#94a3b8" }}>
            A senha atual nunca é exibida. Para redefini-la, o designer deve
            utilizar o fluxo de recuperação de senha.
          </p>
        </section>
      </div>
    </main>
  );
}

const estilos: Record<string, React.CSSProperties> = {
  pagina: {
    minHeight: "100vh",
    background: "#000",
    color: "#fff",
    padding: 24,
  },
  conteudo: {
    maxWidth: 1100,
    margin: "0 auto",
  },
  card: {
    background: "#111",
    border: "1px solid #333",
    borderRadius: 12,
    padding: 22,
    marginBottom: 20,
  },
  grade: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginBottom: 16,
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: 6,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #333",
    background: "#050505",
    color: "#fff",
  },
  botao: {
    padding: "10px 16px",
    border: 0,
    borderRadius: 8,
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  voltar: {
    background: "transparent",
    border: 0,
    color: "#60a5fa",
    cursor: "pointer",
    padding: "8px 0",
  },
};