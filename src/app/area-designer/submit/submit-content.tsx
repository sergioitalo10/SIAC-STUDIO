
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Designer = {
  id: number;
  nome?: string;
  email?: string;
  status?: string;
};

type Artwork = {
  id: number;
  titulo: string;
  descricao?: string | null;
  categoria?: string | null;
  preco: number | string;
  imagem_url?: string | null;
  thumbnail_url?: string | null;
  arquivo_url?: string | null;
  tags?: string[] | string | null;
};

type UploadTipo = "preview" | "rar";

export default function SubmitContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [designer, setDesigner] = useState<Designer | null>(null);
  const [loadingDados, setLoadingDados] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [preco, setPreco] = useState("20");

  const [preview1, setPreview1] = useState<File | null>(null);
  const [preview2, setPreview2] = useState<File | null>(null);
  const [rar, setRar] = useState<File | null>(null);

  const [imagemUrl, setImagemUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [arquivoUrl, setArquivoUrl] = useState("");

  const [preview1Local, setPreview1Local] = useState("");
  const [preview2Local, setPreview2Local] = useState("");

  useEffect(() => {
    if (!preview1) {
      setPreview1Local("");
      return;
    }

    const url = URL.createObjectURL(preview1);
    setPreview1Local(url);

    return () => URL.revokeObjectURL(url);
  }, [preview1]);

  useEffect(() => {
    if (!preview2) {
      setPreview2Local("");
      return;
    }

    const url = URL.createObjectURL(preview2);
    setPreview2Local(url);

    return () => URL.revokeObjectURL(url);
  }, [preview2]);

  useEffect(() => {
    let ativo = true;

    async function carregarDesigner() {
      try {
        const sessao = localStorage.getItem("designer_sessao");

        if (!sessao) {
          router.replace("/area-designer/login");
          return;
        }

        const dados = JSON.parse(sessao);
        const id = Number(dados.id ?? dados.designer?.id);

        if (!Number.isFinite(id) || id <= 0) {
          localStorage.removeItem("designer_sessao");
          router.replace("/area-designer/login");
          return;
        }

        if (ativo) {
          setDesigner({
            id,
            nome: dados.nome ?? dados.designer?.nome,
            email: dados.email ?? dados.designer?.email,
            status: dados.status ?? dados.designer?.status,
          });
        }
      } catch {
        if (ativo) {
          setErro("Não foi possível validar a sessão do designer.");
          setLoadingDados(false);
        }
      }
    }

    carregarDesigner();

    return () => {
      ativo = false;
    };
  }, [router]);

  useEffect(() => {
    if (!designer) return;

    let ativo = true;

    async function carregarArte() {
      if (!editId) {
        setLoadingDados(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/designer/artworks?artwork_id=${encodeURIComponent(editId)}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Não foi possível carregar a arte.");
        }

        const arte: Artwork | undefined = data.artwork;

        if (!arte) {
          throw new Error("A arte solicitada não foi encontrada.");
        }

        if (!ativo) return;

        setTitulo(arte.titulo ?? "");
        setDescricao(arte.descricao ?? "");
        setCategoria(arte.categoria ?? "");
        setPreco(String(arte.preco ?? "20"));
        setImagemUrl(arte.imagem_url ?? "");
        setThumbnailUrl(arte.thumbnail_url ?? "");
        setArquivoUrl(arte.arquivo_url ?? "");
      } catch (e) {
        if (ativo) {
          setErro(
            e instanceof Error
              ? e.message
              : "Erro ao carregar os dados da arte."
          );
        }
      } finally {
        if (ativo) setLoadingDados(false);
      }
    }

    carregarArte();

    return () => {
      ativo = false;
    };
  }, [designer, editId]);

  const enviarArquivo = useCallback(
    async (file: File, tipo: UploadTipo): Promise<string> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipo", tipo);

      const response = await fetch("/api/designer/artworks/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.key) {
        throw new Error(
          data.error ||
            `Falha ao enviar ${file.name}. Verifique o tipo e o tamanho do arquivo.`
        );
      }

      return data.key as string;
    },
    []
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");

    if (!designer) {
      setErro("Sua sessão de designer não foi identificada. Entre novamente.");
      return;
    }

    const valor = Number(preco.replace(",", "."));

    if (!titulo.trim()) {
      setErro("Informe o título da arte.");
      return;
    }

    if (!Number.isFinite(valor) || valor <= 0) {
      setErro("Informe um preço válido maior que zero.");
      return;
    }

    if (!editId && (!preview1 || !preview2 || !rar)) {
      setErro("Selecione os dois previews PNG e o arquivo original RAR.");
      return;
    }

    if (preview1 && !preview1.name.toLowerCase().endsWith(".png")) {
      setErro("O Preview 1 deve ser um arquivo PNG.");
      return;
    }

    if (preview2 && !preview2.name.toLowerCase().endsWith(".png")) {
      setErro("O Preview 2 deve ser um arquivo PNG.");
      return;
    }

    if (rar && !rar.name.toLowerCase().endsWith(".rar")) {
      setErro("O arquivo original deve estar no formato RAR.");
      return;
    }

    setSalvando(true);

    try {
      // Cada chamada envia somente um arquivo para a rota de upload.
      // Os dois previews usam tipo="preview"; o original usa tipo="rar".
      const novaImagemUrl = preview1
        ? await enviarArquivo(preview1, "preview")
        : imagemUrl;

      const novaThumbnailUrl = preview2
        ? await enviarArquivo(preview2, "preview")
        : thumbnailUrl;

      const novoArquivoUrl = rar
        ? await enviarArquivo(rar, "rar")
        : arquivoUrl;

      if (!novaImagemUrl || !novaThumbnailUrl || !novoArquivoUrl) {
        throw new Error(
          "A arte precisa ter Preview 1, Preview 2 e arquivo original. Selecione os arquivos que estiverem faltando."
        );
      }

      const body: Record<string, unknown> = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        categoria: categoria.trim(),
        preco: valor,
        imagem_url: novaImagemUrl,
        thumbnail_url: novaThumbnailUrl,
        arquivo_url: novoArquivoUrl,
      };

      const url = editId
        ? `/api/designer/artworks?artwork_id=${encodeURIComponent(editId)}`
        : "/api/designer/artworks";

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível salvar a arte.");
      }

      setSucesso(
        editId
          ? "Arte atualizada e enviada para nova análise administrativa."
          : "Arte cadastrada e enviada para análise administrativa."
      );

      setTimeout(() => {
        router.push("/area-designer/dashboard");
      }, 1200);
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : "Ocorreu um erro ao enviar a arte."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (loadingDados) {
    return <main style={styles.container}>Carregando dados...</main>;
  }

  return (
    <main style={styles.container}>
      <section style={styles.card}>
        <h1 style={styles.title}>
          {editId ? "Editar arte" : "Enviar nova arte"}
        </h1>

        <p style={styles.subtitle}>
          Envie dois previews PNG e o arquivo original RAR.
        </p>

        {erro && <div style={styles.error}>{erro}</div>}
        {sucesso && <div style={styles.success}>{sucesso}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label} htmlFor="titulo">
            Título da arte
          </label>
          <input
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={150}
            required
            style={styles.input}
            placeholder="Nome da arte"
          />

          <label style={styles.label} htmlFor="descricao">
            Descrição
          </label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={4}
            style={styles.input}
            placeholder="Descreva sua arte"
          />

          <label style={styles.label} htmlFor="categoria">
            Categoria
          </label>
          <input
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            style={styles.input}
            placeholder="Ex.: camisetas, sublimação..."
          />

          <label style={styles.label} htmlFor="preco">
            Preço (R$)
          </label>
          <input
            id="preco"
            type="number"
            min="0.01"
            step="0.01"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
            style={styles.input}
          />

          <div style={styles.uploadGroup}>
            <label style={styles.label} htmlFor="preview1">
              Preview 1 — preview.png
            </label>
            <input
              id="preview1"
              type="file"
              accept=".png,image/png"
              required={!editId || !imagemUrl}
              onChange={(e) => setPreview1(e.target.files?.[0] ?? null)}
              style={styles.fileInput}
            />
            {imagemUrl && !preview1 && (
              <p style={styles.hint}>Preview 1 atual mantido se não substituir.</p>
            )}
            {preview1Local && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview1Local} alt="Prévia do Preview 1" style={styles.preview} />
            )}
          </div>

          <div style={styles.uploadGroup}>
            <label style={styles.label} htmlFor="preview2">
              Preview 2 — preview2.png
            </label>
            <input
              id="preview2"
              type="file"
              accept=".png,image/png"
              required={!editId || !thumbnailUrl}
              onChange={(e) => setPreview2(e.target.files?.[0] ?? null)}
              style={styles.fileInput}
            />
            {thumbnailUrl && !preview2 && (
              <p style={styles.hint}>Preview 2 atual mantido se não substituir.</p>
            )}
            {preview2Local && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview2Local} alt="Prévia do Preview 2" style={styles.preview} />
            )}
          </div>

          <div style={styles.uploadGroup}>
            <label style={styles.label} htmlFor="rar">
              Arquivo original — .rar
            </label>
            <input
              id="rar"
              type="file"
              accept=".rar,application/vnd.rar,application/x-rar-compressed"
              required={!editId || !arquivoUrl}
              onChange={(e) => setRar(e.target.files?.[0] ?? null)}
              style={styles.fileInput}
            />
            {arquivoUrl && !rar && (
              <p style={styles.hint}>Arquivo original atual mantido se não substituir.</p>
            )}
          </div>

          <button type="submit" disabled={salvando} style={styles.button}>
            {salvando
              ? "Enviando..."
              : editId
                ? "Salvar alterações"
                : "Enviar arte para análise"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/area-designer/dashboard")}
            disabled={salvando}
            style={styles.secondaryButton}
          >
            Voltar ao dashboard
          </button>
        </form>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    padding: "32px 16px",
    background: "#f4f6f8",
    color: "#17202a",
  },
  card: {
    maxWidth: 720,
    margin: "0 auto",
    padding: 28,
    borderRadius: 14,
    background: "#fff",
    boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
  },
  title: {
    margin: "0 0 8px",
    fontSize: 28,
    fontWeight: 700,
  },
  subtitle: {
    margin: "0 0 24px",
    color: "#5d6873",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  label: {
    marginTop: 8,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #cbd2d9",
    borderRadius: 8,
    fontSize: 16,
    background: "#fff",
    color: "#17202a",
  },
  fileInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: 10,
    border: "1px solid #cbd2d9",
    borderRadius: 8,
    background: "#fff",
  },
  uploadGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
    padding: 14,
    border: "1px solid #e0e5e9",
    borderRadius: 10,
  },
  hint: {
    margin: 0,
    fontSize: 13,
    color: "#5d6873",
  },
  preview: {
    display: "block",
    maxWidth: "100%",
    maxHeight: 260,
    objectFit: "contain",
    alignSelf: "flex-start",
    borderRadius: 8,
    border: "1px solid #e0e5e9",
  },
  button: {
    marginTop: 18,
    padding: "13px 18px",
    border: 0,
    borderRadius: 8,
    background: "#17202a",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "12px 18px",
    border: "1px solid #cbd2d9",
    borderRadius: 8,
    background: "#fff",
    color: "#17202a",
    fontSize: 15,
    cursor: "pointer",
  },
  error: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    background: "#fdecec",
    color: "#a61b1b",
  },
  success: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    background: "#e8f7ec",
    color: "#176b35",
  },
};
