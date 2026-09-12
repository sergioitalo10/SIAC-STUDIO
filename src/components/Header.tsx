"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [usuario, setUsuario] = useState<{ nome: string; email: string } | null>(null);

  useEffect(() => {
    // Verifica se há sessão ativa salva no navegador
    const sessaoSalva = localStorage.getItem("cliente_sessao");
    if (sessaoSalva) {
      try {
        setUsuario(JSON.parse(sessaoSalva));
      } catch (e) {
        console.error("Erro ao ler sessão local:", e);
      }
    }
  }, []);

  return (
    <header className="border-b border-blue-900/40 bg-zinc-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* LOGO SIAC STUDIO */}
        <Link href="/" className="text-xl font-black tracking-wider text-white flex items-center gap-2">
          <span className="bg-blue-600 text-white px-2.5 py-1 rounded-lg font-extrabold text-xs shadow-lg shadow-blue-500/30">
            SIAC
          </span>
          <span className="text-slate-100 font-bold">STUDIO</span>
        </Link>

        {/* NAVEGAÇÃO & ÁREA DO CLIENTE */}
        <div className="flex items-center gap-4">
          <Link
            href="/#catalogo"
            className="hidden md:inline-block text-xs font-semibold text-slate-300 hover:text-blue-400 transition"
          >
            Catálogo de Artes
          </Link>

          {usuario ? (
            /* USUÁRIO LOGADO */
            <Link
              href="/minha-conta"
              className="flex items-center gap-2 px-4 py-2 bg-blue-950/60 border border-blue-800/60 hover:border-blue-500 rounded-xl transition text-xs text-blue-300 font-semibold"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>Olá, {usuario.nome.split(" ")[0]}</span>
            </Link>
          ) : (
            /* VISITANTE (NÃO LOGADO) */
            <div className="flex items-center gap-2">
              <Link
                href="/minha-conta"
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                Entrar
              </Link>
              <Link
                href="/minha-conta"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-blue-600/20"
              >
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}