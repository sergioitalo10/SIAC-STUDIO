"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CartButton from "@/components/CartButton";
import { products, Product } from "@/data/products";
import type { DesignerProduct } from "@/types/designer";
import { useCart } from "@/context/CartContext";

// DADOS DOS BANNERS ROTATIVOS (CARROSSEL)
const BANNERS = [
  {
    id: 1,
    tag: "",
    titulo: "",
    descricao: "",
    botaoTexto: "",
    categoriaAlvo: "Interclasses",
    corDestaque: "from-transparent to-transparent",
    imagemFundo: "/banner1.png",
  },
  {
    id: 2,
    tag: "DOWNLOAD IMEDIATO • CDR & PNG",
    titulo: "Artes 100% Vetorizadas",
    descricao: "Arquivos organizados por camadas para facilitar a sua produção no CorelDRAW.",
    botaoTexto: "Explorar Catálogo",
    categoriaAlvo: "Todas",
    corDestaque: "from-purple-600/30 to-blue-900/40",
    imagemFundo: "",
  },
  {
    id: 3,
    tag: "LANÇAMENTOS EXCLUSIVOS",
    titulo: "Kits de Mascotes Premium",
    descricao: "Pantera, Coringa, Venom, Kraken, Leão e Tigre atualizados para sublimação.",
    botaoTexto: "Ver Lançamentos",
    categoriaAlvo: "Lançamentos",
    corDestaque: "from-cyan-600/30 to-blue-900/40",
    imagemFundo: "",
  },
];

export default function Home() {
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  const [mascoteSelecionado, setMascoteSelecionado] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [usuario, setUsuario] = useState<{ id: number; nome: string; email: string } | null>(null);

  // ESTADO DOS BANNERS ROTATIVOS
  const [bannerAtual, setBannerAtual] = useState(0);
  const [pausarRotacao, setPausarRotacao] = useState(false);

  // ESTADO DO QUADRO DE PREVIEW & COMPRA NO CENTRO DA TELA
  // Carrega produtos de designers aprovados
  const [designerProducts, setDesignerProducts] = useState<DesignerProduct[]>([]);
  const [loadingDesignerProducts, setLoadingDesignerProducts] = useState(true);

  useEffect(() => {
    fetch("/api/designer/approved")
      .then((res) => res.json())
      .then((data) => {
        setDesignerProducts(data.artworks || []);
      })
      .catch((err) => console.error("Erro ao carregar designer products:", err))
      .finally(() => setLoadingDesignerProducts(false));
  }, []);

  // ESTADOS E REF PARA O EFEITO DE ZOOM
  const [isHovered, setIsHovered] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgContainerRef = useRef<HTMLDivElement>(null);

  const { addToCart } = useCart();

  // ROTAÇÃO AUTOMÁTICA DOS BANNERS (5 SEGUNDOS)
  useEffect(() => {
    if (pausarRotacao) return;

    const timer = setInterval(() => {
      setBannerAtual((prev) => (prev + 1) % BANNERS.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [pausarRotacao]);

  // Carrega a sessão do usuário
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

  // Gera a lista de categorias sem duplicados (suportando arrays de categorias)
  const categorias = useMemo(() => {
    const listaCategorias = products.flatMap((product) =>
      Array.isArray(product.categoria) ? product.categoria : [product.categoria]
    );
    return ["Todas", ...new Set(listaCategorias)];
  }, []);

  const mascotesInterclasses = useMemo(() => {
    const mascotes = products
      .filter((p) => {
        const cats = Array.isArray(p.categoria) ? p.categoria : [p.categoria];
        return cats.includes("Interclasses") && p.mascote;
      })
      .map((p) => p.mascote as string);
    return [...new Set(mascotes)];
  }, []);

  // Filtra os produtos com base na categoria, mascote e busca
  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return products.filter((product) => {
      const categoriasDoProduto = Array.isArray(product.categoria)
        ? product.categoria
        : [product.categoria];

      const correspondeCategoria =
        categoriaSelecionada === "Todas" ||
        categoriasDoProduto.includes(categoriaSelecionada);

      const correspondeMascote =
        !mascoteSelecionado || product.mascote === mascoteSelecionado;

      const correspondeBusca =
        termo === "" ||
        product.nome.toLowerCase().includes(termo) ||
        categoriasDoProduto.some((cat) => cat.toLowerCase().includes(termo)) ||
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

  function filtrarPorMenu(categoria: string) {
    setCategoriaSelecionada(categoria);
    setMascoteSelecionado(null);

    const elementoProdutos = document.getElementById("produtos");
    if (elementoProdutos) {
      elementoProdutos.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleComprarAgora(product: Product | DesignerProduct) {
    addToCart(product);
    setProdutoEmDestaque(null);
  }

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
    <main className="relative min-h-screen bg-black text-white" suppressHydrationWarning>

      {/* CABEÇALHO EXPANDIDO */}
      <header className="sticky top-0 z-40 min-h-[96px] border-b border-gray-800 bg-black/90 backdrop-blur-md flex items-center">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">

          <Link href="/" className="flex items-center gap-3 transition hover:opacity-90" suppressHydrationWarning>
            <img src="/logo.png" alt="SIAC Studio" className="h-14 w-auto object-contain" />
            <span className="text-2xl font-bold tracking-tight">
              SIAC <span className="text-blue-500">STUDIO</span>
            </span>
          </Link>

          {/* NAVEGAÇÃO COM FILTRO AUTOMÁTICO DO CABEÇALHO */}
          <nav className="hidden gap-8 md:flex text-sm font-semibold tracking-wide">
            <button
              onClick={() => filtrarPorMenu("Todas")}
              className="hover:text-blue-500 transition text-left"
            >
              Catálogo
            </button>
            <button
              onClick={() => filtrarPorMenu("Interclasses")}
              className="hover:text-blue-500 transition text-left"
            >
              Categorias
            </button>
            <button
              onClick={() => filtrarPorMenu("Lançamentos")}
              className="hover:text-blue-500 transition text-left"
            >
              Lançamentos
            </button>
          </nav>

          <div className="flex items-center gap-4">
            {usuario ? (
              <Link
                href="/minha-conta"
                className="flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-950/40 px-4 py-2 text-xs font-semibold text-blue-400 transition hover:border-blue-500 hover:bg-blue-900/50"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400 animate-pulse"></span>
                <span>Olá, {usuario.nome.split(" ")[0]}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/minha-conta"
                  className="text-xs font-semibold text-gray-300 hover:text-white transition px-3 py-1.5"
                >
                  Entrar
                </Link>
                <Link
                  href="/minha-conta"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/20"
                >
                  Criar conta
                </Link>
              </div>
            )}

            <CartButton />
          </div>

        </div>
      </header>

      {/* BANNERS ROTATIVOS (1280x300) */}
      <section 
        className="relative overflow-hidden border-b border-gray-900 bg-gray-950 py-3 md:py-4"
        onMouseEnter={() => setPausarRotacao(true)}
        onMouseLeave={() => setPausarRotacao(false)}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div 
            onClick={() => {
              if (BANNERS[bannerAtual].categoriaAlvo) {
                selecionarCategoria(BANNERS[bannerAtual].categoriaAlvo);
              }
            }}
            className={`relative w-full aspect-[1280/300] max-h-[280px] overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-r shadow-xl transition-all duration-700 ease-in-out flex items-center justify-center ${
              BANNERS[bannerAtual].imagemFundo ? "cursor-pointer" : ""
            }`}
          >
            {/* IMAGEM DE FUNDO DO BANNER */}
            {BANNERS[bannerAtual].imagemFundo && (
              <img
                src={BANNERS[bannerAtual].imagemFundo}
                alt={BANNERS[bannerAtual].titulo || "Banner promocional"}
                className="absolute inset-0 h-full w-full object-contain md:object-cover z-0"
              />
            )}

            {/* GRADIENTE DE SOBREPOSIÇÃO (QUANDO HOUVER TEXTO) */}
            {BANNERS[bannerAtual].titulo && (
              <div className={`bg-gradient-to-r ${BANNERS[bannerAtual].corDestaque} absolute inset-0 opacity-60 backdrop-blur-[1px] z-0`} />
            )}

            {/* CONTEÚDO TEXTUAL */}
            {(BANNERS[bannerAtual].titulo || BANNERS[bannerAtual].tag) && (
              <div className="relative z-10 flex flex-col items-center text-center p-4">
                {BANNERS[bannerAtual].tag && (
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-blue-400 border border-blue-500/20 uppercase backdrop-blur-md">
                    {BANNERS[bannerAtual].tag}
                  </span>
                )}

                {BANNERS[bannerAtual].titulo && (
                  <h1 className="mt-2 text-xl font-black tracking-tight text-white md:text-2xl drop-shadow-md">
                    {BANNERS[bannerAtual].titulo}
                  </h1>
                )}

                {BANNERS[bannerAtual].descricao && (
                  <p className="mt-1 max-w-lg text-xs text-gray-200 drop-shadow">
                    {BANNERS[bannerAtual].descricao}
                  </p>
                )}

                {BANNERS[bannerAtual].botaoTexto && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      selecionarCategoria(BANNERS[bannerAtual].categoriaAlvo);
                    }}
                    className="mt-3.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/30"
                  >
                    {BANNERS[bannerAtual].botaoTexto}
                  </button>
                )}
              </div>
            )}

            {/* BOTÃO ANTERIOR */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBannerAtual((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));
              }}
              className="absolute left-2.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-800 bg-black/60 text-xs text-gray-300 backdrop-blur-md transition hover:bg-blue-600 hover:text-white"
            >
              ‹
            </button>

            {/* BOTÃO PRÓXIMO */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setBannerAtual((prev) => (prev + 1) % BANNERS.length);
              }}
              className="absolute right-2.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-800 bg-black/60 text-xs text-gray-300 backdrop-blur-md transition hover:bg-blue-600 hover:text-white"
            >
              ›
            </button>

            {/* INDICADORES (BOLINHAS) */}
            <div className="absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
              {BANNERS.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setBannerAtual(index);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    bannerAtual === index ? "w-5 bg-blue-500" : "w-1.5 bg-gray-600 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* FILTROS E BUSCA */}
      <section id="categorias" className="mx-auto max-w-7xl px-6 pt-2 pb-1">
        <div className="flex flex-col-reverse gap-3 rounded-xl border border-gray-800/80 bg-gray-950/60 p-2.5 md:flex-row md:items-center md:justify-between">
          
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
      <section id="produtos" className="mx-auto max-w-7xl px-6 pt-2 pb-6">

        <div className="mb-3 flex items-center justify-between">
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

      {/* QUADRO AMPLIADO COM LUPA E COMPRA DIRETA */}
      {produtoEmDestaque && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md transition-all duration-300"
          onClick={() => setProdutoEmDestaque(null)}
        >
          <div 
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setProdutoEmDestaque(null)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-gray-300 backdrop-blur-md transition hover:bg-blue-600 hover:text-white"
            >
              ✕
            </button>

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
                  transform: isHovered ? "scale(1.6)" : "scale(1)",
                }}
                className="max-h-[65vh] w-auto object-contain transition-transform duration-150 ease-out"
              />

              {!isHovered && (
                <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-gray-700 bg-black/60 px-3 py-1 text-[11px] font-medium text-gray-300 backdrop-blur-md">
                  🔍 Passe o mouse na arte para dar zoom
                </div>
              )}
            </div>

            <div className="flex w-full flex-col justify-between border-t border-gray-800 bg-gray-950 p-6 md:w-80 md:border-l md:border-t-0">
              <div>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 border border-blue-500/20">
                  {Array.isArray(produtoEmDestaque.categoria)
                    ? produtoEmDestaque.categoria.join(" • ")
                    : produtoEmDestaque.categoria}
                </span>

                <h3 className="mt-3 text-xl font-extrabold text-white">
                  {produtoEmDestaque.nome}
                </h3>

                <p className="mt-2 text-2xl font-black text-blue-500">
                  R$ {produtoEmDestaque.preco.toFixed(2).replace(".", ",")}
                </p>

                <div className="mt-4 space-y-2 text-xs text-gray-400 border-t border-gray-800/80 pt-4">
                  {produtoEmDestaque.designerNome && (
                    <>
                      <p className="flex items-center gap-2">
                        <span className="text-blue-400">✍</span>
                        Artista: <span className="text-white font-normal">{produtoEmDestaque.designerNome}</span>
                      </p>
                      <p className="flex items-center gap-2 text-blue-400">
                        40% para o designer • 60% para o SIAC STUDIO
                      </p>
                    </>
                  )}
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

      {/* SEÇÃO: ARTES DOS COLABORADORES */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="mb-6 flex items-center justify-between border-t border-gray-800 pt-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
              SIAC STUDIO
            </p>
            <h2 className="mt-2 text-2xl font-bold">Artes dos Colaboradores</h2>
            <p className="mt-1 text-xs text-gray-400">
              Produtos criados por designers parceiros — 40% da venda vai para o designer.
            </p>
          </div>
          <span className="text-xs text-gray-500">
            {loadingDesignerProducts
              ? "Carregando..."
              : designerProducts.length === 0
              ? "Nenhuma arte publicada ainda"
              : `${designerProducts.length} artes disponíveis`}
          </span>
        </div>

        {loadingDesignerProducts ? (
          <div className="flex justify-center py-12 text-gray-500 text-sm">
            Carregando artes dos colaboradores...
          </div>
        ) : designerProducts.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-950 p-10 text-center">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-white">Ainda não há artes publicadas</h3>
            <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
              Enquanto não houver designers cadastrados enviando e aprovando artes,
              esta seção permanecerá vazia. Os primeiros colaboradores estarão disponíveis em breve.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {designerProducts.map((product) => (
              <div
                key={`designer-${product.artwork_id}`}
                onClick={() => setProdutoEmDestaque(product as any)}
                className="cursor-pointer transition transform hover:scale-[1.02]"
              >
                <ProductCard
                  id={product.artwork_id}
                  nome={product.titulo}
                  categoria={product.categoria}
                  preco={Number(product.preco)}
                  imagem={product.thumbnail_url || product.imagem_url || ""}
                />
                <p className="mt-1 text-[10px] text-gray-500 text-center truncate">
                  por {product.designer_nome}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

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