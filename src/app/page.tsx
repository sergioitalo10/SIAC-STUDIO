"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CartButton from "@/components/CartButton";
import { products } from "@/data/products";

export default function Home() {
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  const [usuario, setUsuario] = useState<{ id: number; nome: string; email: string } | null>(null);

  // Carrega a sessão do usuário caso esteja logado
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

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return products.filter((product) => {
      const correspondeCategoria =
        categoriaSelecionada === "Todas" ||
        product.categoria === categoriaSelecionada;

      const correspondeBusca =
        termo === "" ||
        product.nome.toLowerCase().includes(termo) ||
        product.categoria.toLowerCase().includes(termo) ||
        product.tags?.some((tag) =>
          tag.toLowerCase().includes(termo)
        );

      return correspondeCategoria && correspondeBusca;
    });
  }, [busca, categoriaSelecionada]);

  function limparFiltros() {
    setBusca("");
    setCategoriaSelecionada("Todas");
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* CABEÇALHO INTEGRADO */}
      <header className="border-b border-gray-800 bg-black sticky top-0 z-50 backdrop-blur-md bg-black/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link href="/" className="text-2xl font-bold">
            SIAC <span className="text-blue-500">STUDIO</span>
          </Link>

          <nav className="hidden gap-8 md:flex">
            <a href="#" className="hover:text-blue-500 transition">
              Loja
            </a>

            <a href="#categorias" className="hover:text-blue-500 transition">
              Categorias
            </a>

            <a href="#produtos" className="hover:text-blue-500 transition">
              Produtos
            </a>

            <a href="#destaques" className="hover:text-blue-500 transition">
              Promoções
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {/* ÁREA DE LOGIN / CLIENTE */}
            {usuario ? (
              <Link
                href="/minha-conta"
                className="flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-950/40 px-3.5 py-1.5 text-sm font-semibold text-blue-400 transition hover:border-blue-500 hover:bg-blue-900/50"
              >
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span>Olá, {usuario.nome.split(" ")[0]}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/minha-conta"
                  className="text-sm font-semibold text-gray-300 hover:text-white transition px-2 py-1"
                >
                  Entrar
                </Link>
                <Link
                  href="/minha-conta"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/20"
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
      <section className="relative overflow-hidden bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">

          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
            SIAC STUDIO
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Artes profissionais
            <br />
            para sublimação total
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Arquivos digitais profissionais para estampadores,
            designers e empresas de personalização.
          </p>

          <button
            onClick={() =>
              document
                .getElementById("produtos")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-10 rounded-lg bg-blue-600 px-8 py-4 font-semibold transition hover:bg-blue-500"
          >
            Explorar artes
          </button>

        </div>
      </section>

      {/* BUSCA */}
      <section className="mx-auto max-w-7xl px-6 pt-12">
        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">

          <label
            htmlFor="busca"
            className="mb-3 block text-sm font-semibold text-gray-300"
          >
            Encontre sua arte
          </label>

          <div className="relative">
            <input
              id="busca"
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Busque por nome, categoria ou estilo..."
              className="w-full rounded-xl border border-gray-700 bg-black px-5 py-4 pr-12 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500"
            />

            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xl">
              🔎
            </span>
          </div>

        </div>
      </section>

      {/* CATEGORIAS */}
      <section
        id="categorias"
        className="mx-auto max-w-7xl px-6 py-12"
      >

        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-500">
              Explore
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Categorias
            </h2>
          </div>

          {categoriaSelecionada !== "Todas" && (
            <button
              onClick={limparFiltros}
              className="text-sm font-semibold text-gray-400 transition hover:text-white"
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {categorias.map((categoria) => {
            const selecionada =
              categoriaSelecionada === categoria;

            return (
              <button
                key={categoria}
                onClick={() => setCategoriaSelecionada(categoria)}
                className={`whitespace-nowrap rounded-full border px-5 py-3 text-sm font-semibold transition ${
                  selecionada
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-gray-800 bg-gray-950 text-gray-300 hover:border-blue-500 hover:text-white"
                }`}
              >
                {categoria}
              </button>
            );
          })}
        </div>

      </section>

      {/* PRODUTOS */}
      <section
        id="produtos"
        className="mx-auto max-w-7xl px-6 py-12"
      >

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-500">
              Catálogo
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Nossas artes
            </h2>
          </div>

          <p className="text-sm text-gray-400">
            {produtosFiltrados.length}{" "}
            {produtosFiltrados.length === 1
              ? "produto encontrado"
              : "produtos encontrados"}
          </p>

        </div>

        {produtosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {produtosFiltrados.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                nome={product.nome}
                categoria={product.categoria}
                preco={product.preco}
                imagem={product.imagem}
              />
            ))}

          </div>
        ) : (
          <div className="rounded-2xl border border-gray-800 bg-gray-950 px-6 py-16 text-center">

            <div className="text-4xl">
              🔎
            </div>

            <h3 className="mt-4 text-xl font-bold">
              Nenhuma arte encontrada
            </h3>

            <p className="mt-2 text-gray-400">
              Tente buscar por outro termo ou escolha outra categoria.
            </p>

            <button
              onClick={limparFiltros}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
            >
              Limpar filtros
            </button>

          </div>
        )}

      </section>

      {/* DESTAQUES */}
      <section
        id="destaques"
        className="border-t border-gray-900 bg-gray-950"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
            SIAC STUDIO
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Novas artes em breve
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Estamos preparando novos modelos profissionais para
            pesca, futebol, ciclismo, motocross, fitness e muito mais.
          </p>

        </div>
      </section>

    </main>
  );
}