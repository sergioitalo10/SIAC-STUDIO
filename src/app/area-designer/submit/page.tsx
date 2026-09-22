"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Designer {
  id: number;
  nome: string;
  email: string;
}

export default function SubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [designer, setDesigner] = useState<Designer | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [erro, setErro] = useState("");

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [preco, setPreco] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [arquivoUrl, setArquivoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    const sessao = localStorage.getItem("designer_sessao");
    if (!sessao) {
      router.push("/area-designer");
      return;
    }
    setDesigner(JSON.parse(sessao));

    // Se estiver editando, carrega os dados
    if (editId && designer) {
      fetch(`/api/designer/artworks?designer_id=${designer.id}`)
        .then((r) => r.json())
        .then((data) => {
          const artwork = (data.artworks || []).find((a: any) => a.id === Number(editId));
          if (artwork) {
            setTitulo(artwork.titulo || "");
            setDescricao(artwork.descricao || "");
            setCategoria(artwork.categoria || "");
            setPreco(artwork.preco?.toString() || "");
            setImagemUrl(artwork.imagem_url || "");
            setArquivoUrl(artwork.arquivo_url || "");
            setThumbnailUrl(artwork.thumbnail_url || "");
          }
        })
        .catch(() => setErro("Erro ao carregar dados"));
    }
  }, [router, editId, designer]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!titulo.trim()) {
      setErro("Preencha o título");
      return;
    }

    if (!preco || isNaN(Number(preco)) || Number(preco) <= 0) {
      setErro("Preencha um preço válido");
      return;
    }

    if (!designer) {
      setErro("Sessão inválida");
      return;
    }

    setLoading(true);

    try {
      const body: any = {
        designer_id: designer.id,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        categoria: categoria.trim() || null,
        preco: Number(preco),
        imagem_url: imagemUrl.trim() || null,
        arquivo_url: arquivoUrl.trim() || null,
        thumbnail_url: thumbnailUrl.trim() || null,
      };

      const url = editId
        ? `/api/designer/artworks?artwork_id=${editId}`
        : "/api/designer/artworks";

      // O backend não tem PUT, então usamos POST mesmo para editar (cria nova)
      // Na prática, o designer pode re-enviar como nova versão
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao enviar");
        return;
      }

      setSubmitted(true);
    } catch {
      setErro("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  if (loading && !editId) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">Carregando...</p>
        </div>
      </main>
    );
  }

  if (erro && !loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-md px-6 py-12">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <p className="text-red-400 font-semibold">{erro}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Voltar
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold">Arte enviada!</h1>
            <p className="mt-2 text-gray-400">
              Agora aguarde a aprovação do administrador.
            </p>
            <div className="mt-6 rounded-xl bg-blue-950/40 p-5">
              <p className="text-sm font-semibold text-blue-400">O que acontece agora?</p>
              <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                1. O admin recebe um aviso e verifica sua arte no painel.<br />
                2. Se aprovada, sua arte aparece no catálogo do site.<br />
                3. Cada venda gera 40% de comissão para você.
              </p>
            </div>
            <button
              onClick={() => router.push("/area-designer/dashboard")}
              className="mt-8 rounded-lg bg-blue-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
            >
              Ir para o dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="border-b border-gray-800 sticky top-0 z-40 bg-black/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-2xl font-bold"
            >
              SIAC <span className="text-blue-500">STUDIO</span>
            </a>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
              Enviar Arte
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-950/40 px-4 py-1.5 text-xs text-blue-400">
              <span className="font-semibold">{designer?.nome}</span>
            </div>
            <button
              onClick={() => router.push("/area-designer/dashboard")}
              className="rounded-lg border border-gray-700 px-4 py-2 text-xs font-semibold text-gray-400 transition hover:bg-gray-800 hover:text-white"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* FORM */}
      <section className="mx-auto max-w-2xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {editId ? "Editar arte" : "Enviar nova arte"}
          </h1>
          <span className="text-xs text-gray-500">
            40% de cada venda é seu • A aprovação do admin é necessária
          </span>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
          {erro && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm font-semibold text-red-400">{erro}</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">Título da Arte *</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Pantera Roxa - Verão 2025"
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Descrição</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva sua arte, técnicas, inspirações..."
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none focus:border-blue-500"
                >
                  <option value="">Selecione...</option>
                  <option value="Interclasses">Interclasses</option>
                  <option value="Lançamentos">Lançamentos</option>
                  <option value="Estatísticas">Estatísticas</option>
                  <option value="Animais">Animais</option>
                  <option value="Fantasia">Fantasia</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Preço (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  placeholder="20.00"
                  className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">URL da imagem (prévia)</label>
              <input
                type="url"
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                placeholder="https://seuserver.com/imagem.jpg"
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Link para a imagem de prévia do produto</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">URL do arquivo (RAR/CDR/PNG)</label>
              <input
                type="url"
                value={arquivoUrl}
                onChange={(e) => setArquivoUrl(e.target.value)}
                placeholder="https://seuserver.com/arquivo.rar"
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Link para o arquivo de download do cliente</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">URL da thumbnail (pequena)</label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://seuserver.com/thumb.jpg"
                className="w-full rounded-lg border border-gray-700 bg-black px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Imagem menor para o grid de catálogo (opcional)</p>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Enviando..." : editId ? "Re-enviar como nova versão" : "Enviar arte"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/area-designer/dashboard")}
              className="rounded-lg border border-gray-700 px-6 py-3 text-sm font-semibold text-gray-400 transition hover:bg-gray-800 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
