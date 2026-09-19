"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CartButton from "@/components/CartButton";
import { products, Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  const [mascoteSelecionado, setMascoteSelecionado] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuario, setUsuario] = useState<{ id: number; nome: string; email: string } | null>(null);
  
  // ESTADO DO QUADRO DE PREVIEW & COMPRA NO CENTRO DA TELA
  const [produtoEmDestaque, setProdutoEmDestaque] = useState<Product | null>(null);

  // ESTADOS E REF PARA O EFEITO DE ZOOM AO PASSAR O MOUSE
  const [isHovered, setIsHovered] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgContainerRef = useRef<HTMLDivElement>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    const sessaoSalva = localStorage.getItem("cliente_sessao");
    if (sessaoSalva) {
      try {
        setUsuario(JSON.parse(sessaoSalva));
      } catch (e) {
        console.error("Erro ao carregar sessão:", e);
      }
    }
  }, []);

  const categorias = useMemo(() => {
    return ["Todas", ...new Set(products.map((product) => product.categoria))];
  }, []);

  const mascotesInterclasses = useMemo(() => {
    const mascotes = products
      .filter((p) => p.categoria === "Interclasses" && p.mascote)
      .map((p) => p.mascote as string);
    return [...new Set(mascotes)];
  }, []);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return products.filter((product) => {
      const correspondeCategoria =
        categoriaSelecionada === "Todas" ||
        product.categoria === categoriaSelecionada;

      const correspondeMascote =
        !mascoteSelecionado || product.mascote === mascoteSelecionado;

      const correspondeBusca =
        termo === "" ||
        product.nome.toLowerCase().includes(termo) ||
        product.categoria.toLowerCase().includes(termo) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(termo));

      return correspondeCategoria && correspondeMascote && correspondeBusca;
    });
  }, [busca, categoriaSelecionada, mascoteSelecionado]);

  function selecionarCategoria(cat: string) {
    setCategoriaSelecionada(cat);
    setMascoteSelecionado(null);
  }

  function selecionarMascote(mascote: string) {
    setCategoriaSelecionada("Interclasses");
    setMascoteSelecionado(mascote);
  }

  function handleComprarAgora(product: Product) {
    addToCart(product);
    setProdutoEmDestaque(null);
  }

  // CÁLCULO DA POSIÇÃO DO MOUSE PARA O EFEITO LUPA DE ZOOM
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!imgContainerRef.current) return;

    const { left, top, width, height } = imgContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPos({
      x: Math.min(Math.max(x, 0), 100),
      y: Math.min(Math.max(y, 0), 100),
    });
  }

  return (
    <main className="min-h-screen bg-black text-white" suppressHydrationWarning>

      {/* CABEÇALHO INTEGRADO */}
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">

          <Link href="/" className="text-xl font-bold tracking-tight" suppressHydrationWarning>
            SIAC <span className="text-blue-500">STUDIO</span>
          </Link>

          <nav className="hidden gap-6 md:flex text-sm font-medium">
            <a href="#produtos" className="hover:text-blue-500 transition">
              Catálogo
            </a>
            <a href="#categorias" className="hover:text-blue-500 transition">
              Categorias
            </a>
            <a href="#destaques" className="hover:text-blue-500 transition">
              Lançamentos
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {usuario ? (
              <Link
                href="/minha-conta"
                className="flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-950/40 px-3 py-1.5 text-xs font-semibold text-blue-400 transition hover:border-blue-500 hover:bg-blue-900/50"
              >
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span>Olá, {usuario.nome.split(" ")[0]}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/minha-conta"
                  className="text-xs font-semibold text-gray-300 hover:text-white transition px-2 py-1"
                >
                  Entrar
                </Link>
                <Link
                  href="/minha-conta"
                  className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/20"
                >
                  Criar conta
                </Link>
              </div>
            )}

            <CartButton />
          </div>

        </div>
      </header>

      {/* BANNER PRINCIPAL */}
      <section className="border-b border-gray-900 bg-gray-950 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-500">
            SIAC STUDIO • SUBLIMAÇÃO TOTAL
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-4xl">
            Artes Profissionais Prontas para Produção
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-400">
            Clique na miniatura para expandir e passe o mouse na imagem para ver os detalhes em zoom.
          </p>
        </div>
      </section>

      {/* FILTROS E BUSCA */}
      <section id="categorias" className="mx-auto max-w-7xl px-6 pt-6 pb-2">
        <div className="flex flex-col-reverse gap-3 rounded-xl border border-gray-800/80 bg-gray-950/60 p-3 md:flex-row md:items-center md:justify-between">
          
          <div className="flex items-center gap-2 overflow-visible pb-1 md:pb-0">
            {categorias.map((categoria) => {
              const selecionada = categoriaSelecionada === categoria && !mascoteSelecionado;
              const isInterclasses = categoria === "Interclasses";

              if (isInterclasses) {
                return (
                  <div
                    key={categoria}
                    className="relative inline-block"
                    onMouseEnter={() => setMenuAberto(true)}
                    onMouseLeave={() => setMenuAberto(false)}
                  >
                    <button
                      onClick={() => selecionarCategoria("Interclasses")}
                      className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition ${
                        categoriaSelecionada === "Interclasses"
                          ? "border-blue-500 bg-blue-600 text-white"
                          : "border-gray-800 bg-gray-900 text-gray-300 hover:border-blue-500 hover:text-white"
                      }`}
                    >
                      <span>Interclasses</span>
                      <span className="text-[10px]">▼</span>
                    </button>

                    {menuAberto && (
                      <div className="absolute left-0 top-full z-40 pt-1.5">
                        <div className="w-44 rounded-xl border border-gray-800 bg-gray-950 p-1.5 shadow-2xl backdrop-blur-lg">
                          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            Mascotes
                          </p>
                          <button
                            onClick={() => selecionarCategoria("Interclasses")}
                            className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-gray-300 hover:bg-blue-600 hover:text-white"
                          >
                            Ver Todos
                          </button>
                          {mascotesInterclasses.map((mascote) => (
                            <button
                              key={mascote}
                              onClick={() => selecionarMascote(mascote)}
                              className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition ${
                                mascoteSelecionado === mascote
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
                              }`}
                            >
                              {mascote}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={categoria}
                  onClick={() => selecionarCategoria(categoria)}
                  className={`whitespace-nowrap rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition ${
                    selecionada
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-gray-800 bg-gray-900 text-gray-300 hover:border-blue-500 hover:text-white"
                  }`}
                >
                  {categoria}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64">
            <input
              id="busca"
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar arte..."
              className="w-full rounded-lg border border-gray-800 bg-black px-3.5 py-1.5 pr-8 text-xs text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              🔍
            </span>
          </div>

        </div>
      </section>

      {/* CATÁLOGO DE PRODUTOS */}
      <section id="produtos" className="mx-auto max-w-7xl px-6 py-6">

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">
            {mascoteSelecionado
              ? `Interclasses — ${mascoteSelecionado}`
              : categoriaSelecionada === "Todas"
              ? "Nossas Artes"
              : categoriaSelecionada}
          </h2>

          <p className="text-xs font-medium text-gray-400">
            {produtosFiltrados.length}{" "}
            {produtosFiltrados.length === 1 ? "modelo" : "modelos"}
          </p>
        </div>

        {produtosFiltrados.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {produtosFiltrados.map((product) => (
              <div 
                key={product.id} 
                onClick={() => setProdutoEmDestaque(product)}
                className="cursor-pointer transition transform hover:scale-[1.02]"
              >
                <ProductCard
                  id={product.id}
                  nome={product.nome}
                  categoria={product.categoria}
                  preco={product.preco}
                  imagem={product.imagem}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-800 bg-gray-950 px-6 py-12 text-center">
            <div className="text-3xl">🔎</div>
            <h3 className="mt-3 text-lg font-bold">Nenhuma arte encontrada</h3>
            <p className="mt-1 text-xs text-gray-400">
              Tente buscar por outro termo ou selecione outra categoria.
            </p>
          </div>
        )}

      </section>

      {/* QUADRO AMPLIADO NO CENTRO COM EFEITO DE LUPA DE ZOOM */}
      {produtoEmDestaque && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md transition-all duration-300"
          onClick={() => setProdutoEmDestaque(null)}
        >
          <div 
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* BOTÃO FECHAR */}
            <button
              onClick={() => setProdutoEmDestaque(null)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-gray-300 backdrop-blur-md transition hover:bg-blue-600 hover:text-white"
            >
              ✕
            </button>

            {/* IMAGEM COM EFEITO DE LUPA E ZOOM MAGNÉTICO NO MOUSE */}
            <div 
              ref={imgContainerRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onMouseMove={handleMouseMove}
              className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/60 p-6 cursor-crosshair select-none"
            >
              <img
                src={produtoEmDestaque.imagem}
                alt={produtoEmDestaque.nome}
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isHovered ? "scale(2.5)" : "scale(1)",
                }}
                className="max-h-[65vh] w-auto object-contain transition-transform duration-150 ease-out"
              />

              {/* AVISO INDICADOR DE ZOOM QUANDO O CURSOR NÃO ESTÁ SOBRE A IMAGEM */}
              {!isHovered && (
                <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-gray-700 bg-black/60 px-3 py-1 text-[11px] font-medium text-gray-300 backdrop-blur-md">
                  🔍 Passe o mouse na arte para dar zoom
                </div>
              )}
            </div>

            {/* PAINEL LATERAL DE COMPRA */}
            <div className="flex w-full flex-col justify-between border-t border-gray-800 bg-gray-950 p-6 md:w-80 md:border-l md:border-t-0">
              <div>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 border border-blue-500/20">
                  {produtoEmDestaque.categoria}
                </span>

                <h3 className="mt-3 text-xl font-extrabold text-white">
                  {produtoEmDestaque.nome}
                </h3>

                <p className="mt-2 text-2xl font-black text-blue-500">
                  R$ {produtoEmDestaque.preco.toFixed(2).replace(".", ",")}
                </p>

                <div className="mt-4 space-y-2 text-xs text-gray-400 border-t border-gray-800/80 pt-4">
                  <p className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Arquivo 100% Vetorizado
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Sublimação Total / CDR & PNG
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Liberação Imediata via `.RAR`
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => handleComprarAgora(produtoEmDestaque)}
                  className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-600/30"
                >
                  Comprar Agora — R$ {produtoEmDestaque.preco.toFixed(2).replace(".", ",")}
                </button>
                <button
                  onClick={() => setProdutoEmDestaque(null)}
                  className="w-full rounded-xl border border-gray-800 bg-gray-900 py-2.5 text-xs font-semibold text-gray-400 transition hover:bg-gray-800 hover:text-white"
                >
                  Ver Outros Mascotes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RODAPÉ */}
      <section id="destaques" className="border-t border-gray-900 bg-gray-950/50">
        <div className="mx-auto max-w-7xl px-6 py-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
            SIAC STUDIO
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Novas artes adicionadas semanalmente • Arquivos 100% vetorizados e em alta resolução
          </p>
        </div>
      </section>

    </main>
  );
}