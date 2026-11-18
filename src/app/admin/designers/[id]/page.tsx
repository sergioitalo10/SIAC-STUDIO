
"use client";

import { useCallback, useEffect, useState } from "react";
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
  arquivo_url?: string | null;
  tags: string[] | null;
  status: string;
  valor_personalizado: number | string | null;
  exclusiva: boolean;
  criado_em: string;
  atualizado_em: string;
  observacoes?: string | null;
};

type FormDesigner = {
  nome: string;
  whatsapp: string;
  documento: string;
  dados_pagamento: string;
  pix: string;
  percentual_comissao: string;
};

const painel: React.CSSProperties = {
  minHeight: "100vh",
  padding: 24,
  background: "#050505",
  color: "#f5f5f5",
};

const card: React.CSSProperties = {
  background: "#111",
  border: "1px solid #303030",
  borderRadius: 12,
  padding: 20,
  marginBottom: 20,
};

const input: React.CSSProperties = {
  display: "block",
  boxSizing: "border-box",
  width: "100%",
  marginTop: 6,
  padding: 10,
  borderRadius: 7,
  border: "1px solid #444",
  background: "#080808",
  color: "#fff",
};

const botao: React.CSSProperties = {
  padding: "10px 14px",
  border: "1px solid #444",
  borderRadius: 8,
  background: "#222",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const grade: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
  margin: "18px 0",
};

function statusLegivel(status: string) {
  const valores: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovada",
    rejected: "Reprovada",
    pendente: "Pendente",
    aprovado: "Aprovado",
    suspenso: "Suspenso",
  };

  return valores[status?.toLowerCase()] || status || "Não informado";
}

function dataLegivel(data?: string) {
  if (!data) return "Não informado";

  const valor = new Date(data);
  return Number.isNaN(valor.getTime())
    ? "Não informado"
    : valor.toLocaleString("pt-BR");
}

export default function DesignerConfig() {
  const params = useParams<{ id: string }>();
  const id = String(params.id);
  const router = useRouter();

  const [designer, setDesigner] = useState<Designer | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [form, setForm] = useState<FormDesigner>({
    nome: "",
    whatsapp: "",
    documento: "",
    dados_pagamento: "",
    pix: "",
    percentual_comissao: "40",
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvandoArte, setSalvandoArte] = useState<number | null>(null);
  const [revisandoArte, setRevisandoArte] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await fetch(`/api/admin/designers/${id}`, {
        cache: "no-store",
      });

      const dados = await resposta.json().catch(() => ({}));

      if (resposta.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!resposta.ok) {
        throw new Error(dados.error || "Não foi possível carregar o designer.");
      }

      const d: Designer = dados.designer;

      if (!d) {
        throw new Error("O servidor não retornou os dados do designer.");
      }

      setDesigner(d);
      setArtworks(Array.isArray(dados.artworks) ? dados.artworks : []);

      setForm({
        nome: d.nome || "",
        whatsapp: d.whatsapp || "",
        documento: d.documento || "",
        dados_pagamento: d.dados_pagamento || "",
        pix: d.pix || "",
        percentual_comissao: String(d.percentual_comissao ?? 40),
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao carregar os dados.");
    } finally {
      setCarregando(false);
    }
  }, [id, router]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function salvarDesigner() {
    setMensagem("");
    setErro("");

    const percentual = Number(form.percentual_comissao);

    if (!form.nome.trim()) {
      setErro("Informe o nome do designer.");
      return;
    }

    if (
      form.percentual_comissao.trim() === "" ||
      !Number.isFinite(percentual) ||
      percentual < 0 ||
      percentual > 100
    ) {
      setErro("A comissão deve estar entre 0 e 100.");
      return;
    }

    setSalvando(true);

    try {
      const resposta = await fetch(`/api/admin/designers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          nome: form.nome.trim(),
          percentual_comissao: percentual,
        }),
      });

      const dados = await resposta.json().catch(() => ({}));

      if (resposta.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!resposta.ok) {
        throw new Error(dados.error || "Não foi possível salvar o designer.");
      }

      setDesigner((atual) =>
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

      setMensagem("Dados do designer salvos com sucesso.");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar o designer.");
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
    setMensagem("");
    setErro("");

    const precoTexto = String(arte.preco ?? "").trim();
    const preco = Number(precoTexto);

    const valorTexto =
      arte.valor_personalizado == null
        ? ""
        : String(arte.valor_personalizado).trim();

    const valorPersonalizado =
      valorTexto === "" ? null : Number(valorTexto);

    if (precoTexto === "" || !Number.isFinite(preco) || preco < 0) {
      setErro(`Informe um preço válido para "${arte.titulo}".`);
      return;
    }

    if (
      valorPersonalizado !== null &&
      (!Number.isFinite(valorPersonalizado) || valorPersonalizado < 0)
    ) {
      setErro(`O valor personalizado de "${arte.titulo}" é inválido.`);
      return;
    }

    setSalvandoArte(arte.id);

    try {
      const resposta = await fetch(
        `/api/admin/designers/${id}/artworks`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            artwork_id: arte.id,
            preco,
            valor_personalizado: valorPersonalizado,
            exclusiva: arte.exclusiva,
          }),
        }
      );

      const dados = await resposta.json().catch(() => ({}));

      if (resposta.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!resposta.ok) {
        throw new Error(dados.error || "Não foi possível salvar a arte.");
      }

      setArtworks((atuais) =>
        atuais.map((item) =>
          item.id === arte.id
            ? {
                ...item,
                preco: dados.artwork?.preco ?? preco,
                valor_personalizado:
                  dados.artwork?.valor_personalizado ?? valorPersonalizado,
                exclusiva: dados.artwork?.exclusiva ?? arte.exclusiva,
                atualizado_em:
                  dados.artwork?.atualizado_em ?? item.atualizado_em,
              }
            : item
        )
      );

      setMensagem(`Alterações da arte "${arte.titulo}" salvas.`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar a arte.");
    } finally {
      setSalvandoArte(null);
    }
  }

  async function revisarArte(arte: Artwork, acao: "aprovar" | "rejeitar") {
    setMensagem("");
    setErro("");

    if (acao === "aprovar") {
      const confirmou = window.confirm(
        `Deseja aprovar a arte "${arte.titulo}"?`
      );

      if (!confirmou) return;
    }

    let observacoes: string | null = null;

    if (acao === "rejeitar") {
      const motivo = window.prompt(
        `Informe o motivo da reprovação de "${arte.titulo}" (opcional):`
      );

      if (motivo === null) return;
      observacoes = motivo.trim() || null;
    }

    setRevisandoArte(arte.id);

    try {
      const resposta = await fetch(
        `/api/admin/designers/${id}/artworks`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            artwork_id: arte.id,
            acao,
            observacoes,
          }),
        }
      );

      const dados = await resposta.json().catch(() => ({}));

      if (resposta.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!resposta.ok) {
        throw new Error(
          dados.error ||
            "A ação de revisão não foi concluída. Verifique a rota administrativa."
        );
      }

      setArtworks((atuais) =>
        atuais.map((item) =>
          item.id === arte.id
            ? {
                ...item,
                status: dados.artwork?.status || (
                  acao === "aprovar" ? "approved" : "rejected"
                ),
                observacoes:
                  dados.artwork?.observacoes ?? observacoes,
              }
            : item
        )
      );

      setMensagem(
        acao === "aprovar"
          ? `A arte "${arte.titulo}" foi aprovada.`
          : `A arte "${arte.titulo}" foi reprovada.`
      );
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao revisar a arte.");
    } finally {
      setRevisandoArte(null);
    }
  }

  if (carregando) {
    return <main style={painel}>Carregando dados do designer...</main>;
  }

  if (!designer) {
    return (
      <main style={painel}>
        <p>{erro || "Designer não encontrado."}</p>
        <button style={botao} onClick={() => router.push("/admin")}>
          Voltar ao painel
        </button>
      </main>
    );
  }

  return (
    <main style={painel}>
      <div style={{ maxWidth: 1150, margin: "0 auto" }}>
        <button
          style={{ ...botao, marginBottom: 18 }}
          onClick={() => router.push("/admin")}
        >
          ← Voltar ao painel
        </button>

        <h1 style={{ color: "#60a5fa", marginBottom: 8 }}>
          Configurar designer
        </h1>

        <p style={{ color: "#aaa", marginBottom: 22 }}>
          ID: {designer.id} · {designer.email}
        </p>

        {mensagem && (
          <p role="status" style={{ color: "#4ade80" }}>
            {mensagem}
          </p>
        )}

        {erro && (
          <p role="alert" style={{ color: "#f87171" }}>
            {erro}
          </p>
        )}

        <section style={card}>
          <h2>Dados do parceiro</h2>
          <p style={{ color: "#aaa" }}>
            Status atual: <strong>{statusLegivel(designer.status)}</strong>
          </p>
          <p style={{ color: "#aaa" }}>
            Cadastro: {dataLegivel(designer.created_at)}
          </p>

          <div style={grade}>
            <label>
              Nome
              <input
                style={input}
                value={form.nome}
                onChange={(e) =>
                  setForm({ ...form, nome: e.target.value })
                }
              />
            </label>

            <label>
              WhatsApp
              <input
                style={input}
                value={form.whatsapp}
                onChange={(e) =>
                  setForm({ ...form, whatsapp: e.target.value })
                }
              />
            </label>

            <label>
              Documento
              <input
                style={input}
                value={form.documento}
                onChange={(e) =>
                  setForm({ ...form, documento: e.target.value })
                }
              />
            </label>

            <label>
              Comissão (%)
              <input
                style={input}
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
              />
            </label>

            <label>
              Chave PIX
              <input
                style={input}
                value={form.pix}
                onChange={(e) =>
                  setForm({ ...form, pix: e.target.value })
                }
              />
            </label>

            <label>
              Outros dados de pagamento
              <input
                style={input}
                value={form.dados_pagamento}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dados_pagamento: e.target.value,
                  })
                }
              />
            </label>
          </div>

          <button
            style={botao}
            disabled={salvando}
            onClick={salvarDesigner}
          >
            {salvando ? "Salvando..." : "Salvar dados do designer"}
          </button>
        </section>

        <section style={card}>
          <h2>Artes para revisão</h2>
          <p style={{ color: "#aaa" }}>
            Total de artes cadastradas: {artworks.length}
          </p>

          {artworks.length === 0 ? (
            <p style={{ color: "#aaa" }}>
              Nenhuma arte cadastrada para este designer.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 18 }}>
              {artworks.map((arte) => {
                const base =
                  `/api/admin/designers/${id}/artworks/${arte.id}/file`;

                const imagem1 = arte.imagem_url
                  ? `${base}?tipo=preview1`
                  : null;

                const imagem2 = arte.thumbnail_url
                  ? `${base}?tipo=preview2`
                  : null;

                return (
                  <article
                    key={arte.id}
                    style={{
                      background: "#080808",
                      border: "1px solid #333",
                      borderRadius: 10,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(190px, 1fr))",
                        gap: 16,
                      }}
                    >
                      <div>
                        <h3 style={{ marginTop: 0 }}>{arte.titulo}</h3>
                        <p style={{ color: "#aaa" }}>
                          Arte #{arte.id}
                          {arte.categoria ? ` · ${arte.categoria}` : ""}
                        </p>
                        <p>
                          Status: <strong>{statusLegivel(arte.status)}</strong>
                        </p>
                        <p style={{ color: "#aaa" }}>
                          Enviada: {dataLegivel(arte.criado_em)}
                        </p>
                        {arte.descricao && <p>{arte.descricao}</p>}
                        {arte.tags?.length ? (
                          <p style={{ color: "#aaa" }}>
                            Tags: {arte.tags.join(", ")}
                          </p>
                        ) : null}
                      </div>

                      {imagem1 ? (
                        <div>
                          <p>Prévia principal</p>
                          <a href={imagem1} target="_blank" rel="noreferrer">
                            <img
                              src={imagem1}
                              alt={`Prévia principal de ${arte.titulo}`}
                              style={{
                                width: "100%",
                                maxWidth: 300,
                                maxHeight: 300,
                                objectFit: "contain",
                                background: "#222",
                                borderRadius: 8,
                              }}
                            />
                          </a>
                        </div>
                      ) : (
                        <p style={{ color: "#aaa" }}>
                          Prévia principal não informada.
                        </p>
                      )}

                      {imagem2 ? (
                        <div>
                          <p>Segunda prévia</p>
                          <a href={imagem2} target="_blank" rel="noreferrer">
                            <img
                              src={imagem2}
                              alt={`Segunda prévia de ${arte.titulo}`}
                              style={{
                                width: "100%",
                                maxWidth: 300,
                                maxHeight: 300,
                                objectFit: "contain",
                                background: "#222",
                                borderRadius: 8,
                              }}
                            />
                          </a>
                        </div>
                      ) : null}
                    </div>

                    <div style={grade}>
                      <label>
                        Preço (R$)
                        <input
                          style={input}
                          type="number"
                          min="0"
                          step="0.01"
                          value={String(arte.preco ?? "")}
                          onChange={(e) =>
                            alterarArte(arte.id, "preco", e.target.value)
                          }
                        />
                      </label>

                      <label>
                        Valor personalizado (R$)
                        <input
                          style={input}
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
                        />
                      </label>
                    </div>

                    <label
                      style={{
                        display: "flex",
                        gap: 9,
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(arte.exclusiva)}
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

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <button
                        style={botao}
                        disabled={
                          salvandoArte !== null || revisandoArte !== null
                        }
                        onClick={() => salvarArte(arte)}
                      >
                        {salvandoArte === arte.id
                          ? "Salvando..."
                          : "Salvar preço e exclusividade"}
                      </button>

                      {arte.arquivo_url && (
                        <a
                          href={`${base}?tipo=original`}
                          style={{
                            ...botao,
                            display: "inline-block",
                            textDecoration: "none",
                          }}
                        >
                          Baixar arquivo original
                        </a>
                      )}

                      {arte.status !== "approved" &&
                        arte.status !== "aprovado" && (
                          <button
                            style={{
                              ...botao,
                              background: "#14532d",
                              borderColor: "#166534",
                            }}
                            disabled={
                              salvandoArte !== null ||
                              revisandoArte !== null
                            }
                            onClick={() => revisarArte(arte, "aprovar")}
                          >
                            {revisandoArte === arte.id
                              ? "Processando..."
                              : "Aprovar arte"}
                          </button>
                        )}

                      {arte.status !== "rejected" &&
                        arte.status !== "reprovado" &&
                        arte.status !== "rejeitado" && (
                          <button
                            style={{
                              ...botao,
                              background: "#7f1d1d",
                              borderColor: "#991b1b",
                            }}
                            disabled={
                              salvandoArte !== null ||
                              revisandoArte !== null
                            }
                            onClick={() => revisarArte(arte, "rejeitar")}
                          >
                            {revisandoArte === arte.id
                              ? "Processando..."
                              : "Reprovar arte"}
                          </button>
                        )}
                    </div>

                    {arte.observacoes && (
                      <p style={{ color: "#fca5a5", marginTop: 14 }}>
                        Observações: {arte.observacoes}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section style={card}>
          <h2>Senha do designer</h2>
          <p style={{ color: "#aaa" }}>
            A senha atual nunca é exibida nesta tela. A recuperação deve ser
            feita pelo fluxo de redefinição de senha.
          </p>
        </section>
      </div>
    </main>
  );
}
