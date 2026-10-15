"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
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

type Artwork = {
  id: number;
  designer_id: number;
  titulo: string;
  descricao: string | null;
  categoria: string | null;
  preco: number | string;
  imagem_url: string | null;
  thumbnail_url: string | null;
  tags: string[] | null;
  status: string;
  valor_personalizado: number | string | null;
  exclusiva: boolean;
  criado_em: string;
  atualizado_em: string;
};

export default function DesignerConfig() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [d, setD] = useState<Designer | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);

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

  const [salvandoArte, setSalvandoArte] = useState<number | null>(null);
  const [mensagemArte, setMensagemArte] = useState("");
  const [erroArte, setErroArte] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const response = await fetch(`/api/admin/designers/${id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (response.status === 401) {
          router.push("/admin/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error || "Não foi possível carregar o designer."
          );
        }

        if (!ativo) return;

        const designer: Designer = data.designer;

        setD(designer);
        setArtworks(Array.isArray(data.artworks) ? data.artworks : []);

        setForm({
          nome: designer.nome || "",
          whatsapp: designer.whatsapp || "",
          documento: designer.documento || "",
          dados_pagamento: designer.dados_pagamento || "",
          pix: designer.pix || "",
          percentual_comissao: String(
            designer.percentual_comissao ?? 40
          ),
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

    const percentual = Number(form.percentual_comissao);

    if (
      form.percentual_comissao.trim() === "" ||
      !Number.isFinite(percentual) ||
      percentual < 0 ||
      percentual > 100
    ) {
      setErro("A comissão deve estar entre 0 e 100.");
      return;
    }

    if (!form.nome.trim()) {
      setErro("O nome do designer não pode ficar vazio.");
      return;
    }

    setSalvando(true);

    try {
      const response = await fetch(`/api/admin/designers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          percentual_comissao: percentual,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível salvar.");
      }

      setD((atual) =>
        atual
          ? {
              ...atual,
              nome: form.nome.trim(),
              whatsapp: form.whatsapp,
              documento: form.documento,
              dados_pagamento: form.dados_pagamento,
              pix: form.pix,
              percentual_comissao: percentual,
            }
          : atual
      );

      setMsg("Dados do designer salvos com sucesso.");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao salvar os dados."
      );
    } finally {
      setSalvando(false);
    }
  }

  function alterarArte(
    artworkId: number,
    campo: "preco" | "valor_personalizado" | "exclusiva",
    valor: string | boolean
  ) {
    setArtworks((atuais) =>
      atuais.map((arte) => {
        if (arte.id !== artworkId) return arte;

        if (campo === "exclusiva") {
          return { ...arte, exclusiva: Boolean(valor) };
        }

        if (campo === "preco") {
          return { ...arte, preco: valor as string };
        }

        return { ...arte, valor_personalizado: valor as string };
      })
    );
  }

  async function salvarArte(arte: Artwork) {
    setMensagemArte("");
    setErroArte("");

    const preco =
      typeof arte.preco === "string" ? arte.preco.trim() : arte.preco;

    const valorOriginal = arte.valor_personalizado;
    const valorTexto =
      valorOriginal == null ? "" : String(valorOriginal).trim();

    const precoNumero = Number(preco);
    const valorNumero = valorTexto === "" ? null : Number(valorTexto);

    if (
      preco === "" ||
      !Number.isFinite(precoNumero) ||
      precoNumero < 0
    ) {
      setErroArte(`Informe um preço válido para "${arte.titulo}".`);
      return;
    }

    if (
      valorNumero !== null &&
      (!Number.isFinite(valorNumero) || valorNumero < 0)
    ) {
      setErroArte(
        `O valor personalizado de "${arte.titulo}" é inválido.`
      );
      return;
    }

    setSalvandoArte(arte.id);

    try {
      const response = await fetch(
        `/api/admin/designers/${id}/artworks`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            artwork_id: arte.id,
            preco: precoNumero,
            valor_personalizado: valorNumero,
            exclusiva: arte.exclusiva,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.error || `Não foi possível salvar "${arte.titulo}".`
        );
      }

      if (data.artwork) {
        setArtworks((atuais) =>
          atuais.map((item) =>
            item.id === arte.id
              ? {
                  ...item,
                  preco: data.artwork.preco,
                  valor_personalizado:
                    data.artwork.valor_personalizado,
                  exclusiva: data.artwork.exclusiva,
                  atualizado_em: data.artwork.atualizado_em,
                }
              : item
          )
        );
      }

      setMensagemArte(`Arte "${arte.titulo}" salva com sucesso.`);
    } catch (error) {
      setErroArte(
        error instanceof Error
          ? error.message
          : "Erro ao salvar a arte."
      );
    } finally {
      setSalvandoArte(null);
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
        <button
          onClick={() => router.push("/admin")}
          style={estilos.botao}
        >
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

        <h1 style={estilos.titulo}>Configurar designer</h1>

        <section style={estilos.card}>
          <h2>{d.nome}</h2>
          <p style={estilos.secundario}>{d.email}</p>

          <p>
            Status atual: <strong>{d.status}</strong>
          </p>

          <p style={estilos.secundario}>
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
                  setForm({
                    ...form,
                    dados_pagamento: e.target.value,
                  })
                }
                style={estilos.input}
              />
            </label>
          </div>

          <button
            onClick={salvar}
            disabled={salvando}
            style={{
              ...estilos.botao,
              ...(salvando ? estilos.botaoDesabilitado : {}),
            }}
          >
            {salvando ? "Salvando..." : "Salvar dados do designer"}
          </button>

          {msg && <p style={estilos.sucesso}>{msg}</p>}
          {erro && <p style={estilos.erro}>{erro}</p>}
        </section>

        <section style={estilos.card}>
          <h2>Artes e comissões</h2>

          <p style={estilos.secundario}>
            Artes cadastradas: {artworks.length}
          </p>

          {mensagemArte && (
            <p style={estilos.sucesso}>{mensagemArte}</p>
          )}

          {erroArte && <p style={estilos.erro}>{erroArte}</p>}

          {artworks.length === 0 ? (
            <p style={estilos.secundario}>
              Nenhuma arte cadastrada para este designer.
            </p>
          ) : (
            <div style={estilos.listaArtes}>
              {artworks.map((arte) => (
                <article key={arte.id} style={estilos.cardArte}>
                  <div style={estilos.cabecalhoArte}>
                    {arte.thumbnail_url || arte.imagem_url ? (
                      <img
                        src={
                          arte.thumbnail_url ||
                          arte.imagem_url ||
                          undefined
                        }
                        alt={arte.titulo}
                        style={estilos.imagemArte}
                      />
                    ) : (
                      <div style={estilos.semImagem}>
                        Sem imagem
                      </div>
                    )}

                    <div style={estilos.dadosArte}>
                      <h3>{arte.titulo}</h3>
                      <p style={estilos.secundario}>
                        ID: {arte.id}
                        {arte.categoria
                          ? ` · ${arte.categoria}`
                          : ""}
                      </p>
                      <p>
                        Status: <strong>{arte.status}</strong>
                      </p>
                    </div>
                  </div>

                  <div style={estilos.grade}>
                    <label>
                      Preço (R$)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={String(arte.preco ?? "")}
                        onChange={(e) =>
                          alterarArte(
                            arte.id,
                            "preco",
                            e.target.value
                          )
                        }
                        style={estilos.input}
                      />
                    </label>

                    <label>
                      Valor personalizado (R$)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Deixe vazio para não definir"
                        value={
                          arte.valor_personalizado == null
                            ? ""
                            : String(arte.valor_personalizado)
                        }
                        onChange={(e) =>
                          alterarArte(
                            arte.id,
                            "valor_personalizado",
                            e.target.value
                          )
                        }
                        style={estilos.input}
                      />
                    </label>
                  </div>

                  <label style={estilos.checkbox}>
                    <input
                      type="checkbox"
                      checked={arte.exclusiva}
                      onChange={(e) =>
                        alterarArte(
                          arte.id,
                          "exclusiva",
                          e.target.checked
                        )
                      }
                    />
                    Arte exclusiva
                  </label>

                  <button
                    onClick={() => salvarArte(arte)}
                    disabled={salvandoArte !== null}
                    style={{
                      ...estilos.botao,
                      ...(salvandoArte !== null
                        ? estilos.botaoDesabilitado
                        : {}),
                    }}
                  >
                    {salvandoArte === arte.id
                      ? "Salvando arte..."
                      : "Salvar alterações da arte"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section style={estilos.card}>
          <h2>Senha do designer</h2>
          <p style={estilos.secundario}>
            A senha atual nunca é exibida. Para redefini-la, o designer
            deve utilizar o fluxo de recuperação de senha.
          </p>
        </section>
      </div>
    </main>
  );
}

const estilos: Record<string, CSSProperties> = {
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
  titulo: {
    color: "#60a5fa",
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
  botaoDesabilitado: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  voltar: {
    background: "transparent",
    border: 0,
    color: "#60a5fa",
    cursor: "pointer",
    padding: "8px 0",
  },
  secundario: {
    color: "#94a3b8",
  },
  sucesso: {
    color: "#4ade80",
  },
  erro: {
    color: "#f87171",
  },
  listaArtes: {
    display: "grid",
    gap: 16,
  },
  cardArte: {
    background: "#080808",
    border: "1px solid #333",
    borderRadius: 10,
    padding: 16,
  },
  cabecalhoArte: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  imagemArte: {
    width: 100,
    height: 100,
    objectFit: "cover",
    borderRadius: 8,
    background: "#222",
  },
  semImagem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    background: "#222",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
  },
  dadosArte: {
    flex: 1,
    minWidth: 180,
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
};