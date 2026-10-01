"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CartButton from "@/components/CartButton";
import Sidebar from "@/components/Sidebar";
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
    categoriaAlvo: "Interclasses",
    corDestaque: "from-blue-600/80 to-transparent",
    imagemFundo: "/banner2.png",
  },
];

const categorias = [
  "Todas",
  "Interclasses",
  "Estudantil",
  "Futebol",
  "Treceirão",
  "Voley",
  "Basquete",
  "Os Crias",
  "Ciclismo",
  "Lançamentos",
  "Promoções",
];

const subcategoriasMap: Record<string, string[]> = {
  Futebol: ["Masculino", "Feminino", "Times", "Seleções"],
  Voley: ["Masculino", "Feminino", "Times"],
  Basquete: ["Masculino", "Feminino", "Times"],
  Treceirão: ["Formandos", "Terceirão", "Escolar"],
  Ciclismo: ["MTB", "Speed", "Ciclismo"],
  Lançamentos: ["Novidades"],
  Estudantil: ["Escolar", "Interclasse"],
  Promoções: ["Ofertas"],
  Interclasses: ["Mascotes", "Jogos Internos", "Escolar"],
};

export default function Home() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [produtoEmDestaque, setProdutoEmDestaque] = useState<Product | null>(null);
  const [bannerAtual, setBannerAtual] = useState(0);
  const [designerProducts, setDesignerProducts] = useState<DesignerProduct[]>([]);
  const [loadingDesignerProducts, setLoadingDesignerProducts] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setBannerAtual((current) => (current + 1) % BANNERS.length), 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadDesignerProducts() {
      try {
        const response = await fetch("/api/designer/approved");
        if (!response.ok) return;
        const data = await response.json();
        setDesignerProducts(Array.isArray(data) ? data : data.products ?? []);
      } catch {
        setDesignerProducts([]);
      } finally {
        setLoadingDesignerProducts(false);
      }
    }
    loadDesignerProducts();
  }, []);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return products.filter((product) => {
      const categoriasProduto = Array.isArray(product.categoria) ? product.categoria : [product.categoria];
      const textoProduto = `${product.nome} ${categoriasProduto.join(" ")} ${product.mascote ?? ""} ${(product.tags ?? []).join(" ")}`.toLowerCase();
      const categoriaOk = categoriaSelecionada === "Todas" || categoriasProduto.some((categoria) => categoria.toLowerCase() === categoriaSelecionada.toLowerCase()) || (categoriaSelecionada === "Interclasses" && textoProduto.includes("interclasse"));
      const subcategoriaOk = !subcategoriaSelecionada || textoProduto.includes(subcategoriaSelecionada.toLowerCase());
      return categoriaOk && subcategoriaOk && (!termo || textoProduto.includes(termo));
    });
  }, [categoriaSelecionada, subcategoriaSelecionada, busca]);

  const produtosPorPagina = 21;
  const totalPaginas = Math.max(1, Math.ceil(produtosFiltrados.length / produtosPorPagina));
  const produtosPagina = produtosFiltrados.slice((paginaAtual - 1) * produtosPorPagina, paginaAtual * produtosPorPagina);

  useEffect(() => {
    setPaginaAtual(1);
  }, [categoriaSelecionada, subcategoriaSelecionada, busca]);

  function handleCategoria(categoria: string) {
    setCategoriaSelecionada(categoria);
    setSubcategoriaSelecionada(null);
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = imgContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setZoomPos({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
  }

  function handleComprarAgora(product: Product) {
    addToCart(product);
    router.push("/carrinho");
  }

  const banner = BANNERS[bannerAtual];

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-black/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold">SIAC <span className="text-blue-500">STUDIO</span></Link>
          <div className="flex items-center gap-3">
            <Link href="/artes-interclasse" className="hidden rounded-lg px-3 py-2 text-sm text-gray-300 hover:text-blue-400 md:block">Artes para Interclasse</Link>
            <Link href="/mascotes-interclasse" className="hidden rounded-lg px-3 py-2 text-sm text-gray-300 hover:text-blue-400 lg:block">Mascotes</Link>
            <CartButton />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-gray-900">
        <img src={banner.imagemFundo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className={`absolute inset-0 bg-gradient-to-r ${banner.corDestaque}`} />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          {banner.titulo && <><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">{banner.tag}</p><h1 className="mt-4 max-w-3xl text-4xl font-black md:text-6xl">{banner.titulo}</h1><p className="mt-5 max-w-2xl text-lg text-gray-300">{banner.descricao}</p><button onClick={() => handleCategoria(banner.categoriaAlvo)} className="mt-7 rounded-xl bg-blue-600 px-6 py-3 font-bold hover:bg-blue-500">{banner.botaoTexto}</button></>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar arte, mascote ou categoria..." className="rounded-xl border border-gray-800 bg-gray-950 px-5 py-3 text-sm outline-none focus:border-blue-500" />
          <Link href="/artes-para-sublimacao" className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 text-center text-sm font-semibold text-blue-400 hover:border-blue-500">Artes para Sublimação</Link>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {categorias.map((categoria) => (
            <button key={categoria} onClick={() => handleCategoria(categoria)} className={`whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-semibold transition ${categoriaSelecionada === categoria ? "border-blue-500 bg-blue-600 text-white" : "border-gray-800 bg-gray-950 text-gray-400 hover:border-blue-500"}`}>
              {categoria}
            </button>
          ))}
        </div>

        {subcategoriasMap[categoriaSelecionada] && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {subcategoriasMap[categoriaSelecionada].map((subcategoria) => (
              <button key={subcategoria} onClick={() => setSubcategoriaSelecionada(subcategoriaSelecionada === subcategoria ? null : subcategoria)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs ${subcategoriaSelecionada === subcategoria ? "border-blue-500 text-blue-400" : "border-gray-800 text-gray-500 hover:border-gray-600"}`}>{subcategoria}</button>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Catálogo SIAC STUDIO</p><h2 className="mt-2 text-2xl font-bold">Artes para Camisa e Sublimação</h2><p className="mt-1 text-sm text-gray-500">Modelos digitais para camisas, interclasses e projetos escolares.</p></div>
          <Link href="/artes-para-camisa" className="hidden text-sm font-semibold text-blue-400 hover:text-blue-300 sm:block">Ver artes para camisa →</Link>
        </div>

        {produtosPagina.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {produtosPagina.map((product) => <ProductCard key={product.id} {...product} arquivo={product.downloadUrl} onClick={() => setProdutoEmDestaque(product)} />)}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-gray-800 bg-gray-950 px-6 py-12 text-center"><div className="text-3xl">🔎</div><h3 className="mt-3 text-lg font-bold">Nenhuma arte encontrada</h3><p className="mt-1 text-xs text-gray-400">Tente buscar por outro termo ou selecione outra categoria.</p></div>
        )}

        {totalPaginas > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual((page) => Math.max(1, page - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-300 disabled:cursor-not-allowed disabled:text-gray-600">‹</button>
            <span className="text-xs text-gray-500">Página {paginaAtual} de {totalPaginas}</span>
            <button disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual((page) => Math.min(totalPaginas, page + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-300 disabled:cursor-not-allowed disabled:text-gray-600">›</button>
          </div>
        )}
      </section>

      {produtoEmDestaque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" onClick={() => setProdutoEmDestaque(null)}>
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl md:flex-row" onClick={(event) => event.stopPropagation()}>
            <button onClick={() => setProdutoEmDestaque(null)} className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-gray-300 hover:bg-blue-600">✕</button>
            <div ref={imgContainerRef} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onMouseMove={handleMouseMove} className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/60 p-6 cursor-crosshair select-none">
              <img src={produtoEmDestaque.imagem} alt={produtoEmDestaque.nome} style={{ transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transform: isHovered ? "scale(1.6)" : "scale(1)" }} className="max-h-[65vh] w-auto object-contain transition-transform duration-150 ease-out" />
              {!isHovered && <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-gray-700 bg-black/60 px-3 py-1 text-[11px] text-gray-300">🔍 Passe o mouse na arte para dar zoom</div>}
            </div>
            <div className="flex w-full flex-col justify-between border-t border-gray-800 bg-gray-950 p-6 md:w-80 md:border-l md:border-t-0">
              <div><span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">{Array.isArray(produtoEmDestaque.categoria) ? produtoEmDestaque.categoria.join(" • ") : produtoEmDestaque.categoria}</span><h3 className="mt-3 text-xl font-extrabold">{produtoEmDestaque.nome}</h3><p className="mt-2 text-2xl font-black text-blue-500">R$ {produtoEmDestaque.preco.toFixed(2).replace(".", ",")}</p><div className="mt-4 space-y-2 border-t border-gray-800/80 pt-4 text-xs text-gray-400"><p>✓ Arquivo 100% Vetorizado</p><p>✓ Sublimação Total / CDR & PNG</p><p>✓ Liberação via `.RAR`</p></div></div>
              <div className="mt-6 space-y-2"><button onClick={() => handleComprarAgora(produtoEmDestaque)} className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold hover:bg-blue-500">Comprar Agora — R$ {produtoEmDestaque.preco.toFixed(2).replace(".", ",")}</button><button onClick={() => setProdutoEmDestaque(null)} className="w-full rounded-xl border border-gray-800 bg-gray-900 py-2.5 text-xs font-semibold text-gray-400 hover:text-white">Ver Outros Mascotes</button></div>
            </div>
          </div>
        </div>
      )}

      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="mb-6 flex items-center justify-between border-t border-gray-800 pt-8"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">SIAC STUDIO</p><h2 className="mt-2 text-2xl font-bold">Artes dos Colaboradores</h2><p className="mt-1 text-xs text-gray-400">Produtos criados por designers parceiros.</p></div><span className="text-xs text-gray-500">{loadingDesignerProducts ? "Carregando..." : designerProducts.length === 0 ? "Nenhuma arte publicada ainda" : `${designerProducts.length} artes disponíveis`}</span></div>
        {loadingDesignerProducts ? <div className="flex justify-center py-12 text-sm text-gray-500">Carregando artes dos colaboradores...</div> : designerProducts.length === 0 ? <div className="rounded-2xl border border-gray-800 bg-gray-950 p-10 text-center"><div className="mb-4 text-5xl">🎨</div><h3 className="text-xl font-bold">Ainda não há artes publicadas</h3><p className="mx-auto mt-2 max-w-md text-sm text-gray-400">Enquanto não houver designers cadastrados enviando e aprovando artes, esta seção permanecerá vazia.</p></div> : <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">{designerProducts.map((product) => <div key={`designer-${product.artwork_id}`} className="text-center"><ProductCard id={product.artwork_id} nome={product.titulo ?? ""} categoria={product.categoria ?? "Outros"} preco={Number(product.preco) || 0} imagem={product.thumbnail_url || product.imagem_url || ""} onClick={() => setProdutoEmDestaque(product as unknown as Product)} /><p className="mt-1 truncate text-center text-[10px] text-gray-500">por {product.designer_nome ?? ""}</p></div>)}</div>}
      </section>

      <section className="border-t border-gray-900 bg-gray-950/50"><div className="mx-auto max-w-7xl px-6 py-10"><div className="flex flex-wrap justify-center gap-3 text-sm"><Link href="/artes-interclasse" className="rounded-lg border border-gray-800 px-4 py-2 text-gray-300 hover:border-blue-500 hover:text-blue-400">Artes para Interclasse</Link><Link href="/artes-para-sublimacao" className="rounded-lg border border-gray-800 px-4 py-2 text-gray-300 hover:border-blue-500 hover:text-blue-400">Artes para Sublimação</Link><Link href="/artes-para-camisa" className="rounded-lg border border-gray-800 px-4 py-2 text-gray-300 hover:border-blue-500 hover:text-blue-400">Artes para Camisa</Link><Link href="/mascotes-interclasse" className="rounded-lg border border-gray-800 px-4 py-2 text-gray-300 hover:border-blue-500 hover:text-blue-400">Mascotes para Interclasse</Link></div><div className="mt-6 text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">SIAC STUDIO</p><p className="mt-1 text-xs text-gray-400">Novas artes adicionadas semanalmente • Arquivos em alta resolução</p></div></div></section>
    </main>
  );
}
