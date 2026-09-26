"use client";

import { useState } from "react";

interface SidebarProps {
  categoriaSelecionada: string;
  mascoteSelecionado: string | null;
  onSelecionarCategoria: (cat: string) => void;
  onSelecionarMascote: (mascote: string) => void;
  mascotesInterclasses: string[];
}

function ItemCategoria({
  label,
  onClick,
  selecionado,
}: {
  label: string;
  onClick: () => void;
  selecionado: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${
        selecionado
          ? "border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-600/30"
          : "border-gray-900 bg-gray-950 text-gray-400 hover:border-blue-500 hover:text-white hover:bg-gray-900"
      }`}
    >
      <span className="flex-1 truncate">{label}</span>
    </button>
  );
}

function ItemSubcategoria({
  label,
  onClick,
  selecionado,
}: {
  label: string;
  onClick: () => void;
  selecionado: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
        selecionado
          ? "bg-blue-600/90 text-white border-l-2 border-blue-500 pl-3"
          : "text-gray-500 hover:bg-gray-900 hover:text-gray-300 border-l-2 border-transparent pl-3"
      }`}
    >
      <span className="flex-1 truncate">{label}</span>
    </button>
  );
}

export default function Sidebar({
  categoriaSelecionada,
  mascoteSelecionado,
  onSelecionarCategoria,
  onSelecionarMascote,
  mascotesInterclasses,
}: SidebarProps) {
  const [submenuAbierto, setSubmenuAbierto] = useState<string | null>(null);

  function toggleSubmenu(label: string) {
    setSubmenuAbierto(submenuAbierto === label ? null : label);
  }

  const categorias = [
    "Todas",
    "Interclasses",
    "Estudantil",
    "Futebol",
    "Treceirão",
    "Volei",
    "Basquete",
    "Os Crias",
    "Ciclismo",
    "Lançamentos",
    "Promoções",
  ];

  const isInterclasses = categoriaSelecionada === "Interclasses" && !mascoteSelecionado;

  return (
    <aside className="hidden lg:block sticky top-20 self-start h-[calc(100vh-6rem)] w-44 flex-shrink-0 overflow-y-auto border-r border-gray-950/90 bg-gray-950/80 backdrop-blur-sm">
      {/* HEADER */}
      <div className="mx-2 mb-3 flex items-center justify-center gap-1.5 rounded-lg border border-blue-500 bg-black px-2 py-1.5 shadow-lg shadow-blue-400/10">
        <span className="text-white font-extrabold text-[9px] tracking-tight leading-none">
          SIAC
        </span>
        <span className="text-blue-500 font-extrabold text-[9px] tracking-tight leading-none">
          STUDIO
        </span>
      </div>

      <nav className="mx-2 space-y-1">
        {categorias.map((cat) => {
          const selecionado = categoriaSelecionada === cat && !mascoteSelecionado;

          if (cat === "Interclasses") {
            return (
              <div key={cat}>
                <button
                  onClick={() => toggleSubmenu(cat)}
                  className={`w-full flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs font-bold transition ${
                    isInterclasses
                      ? "border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "border-gray-900 bg-gray-950 text-gray-400 hover:border-blue-500 hover:text-white hover:bg-gray-900"
                  }`}
                >
                  <span className="flex-1 truncate">{cat}</span>
                  <span className="text-[8px] text-gray-600">{submenuAbierto === cat ? "▲" : "▼"}</span>
                </button>

                {submenuAbierto === cat && (
                  <div className="mt-0.5 space-y-0.5 border-t border-gray-900 pt-0.5">
                    {mascotesInterclasses.length === 0 ? (
                      <p className="px-2 py-1 text-[8px] text-gray-600 italic">
                        Nenhum mascote cadastrado
                      </p>
                    ) : (
                      mascotesInterclasses.map((mascote) => {
                        const subSelecionado = mascoteSelecionado === mascote;
                        return (
                          <ItemSubcategoria
                            key={mascote}
                            label={mascote}
                            onClick={() => {
                              onSelecionarMascote(mascote);
                              setSubmenuAbierto(null);
                            }}
                            selecionado={subSelecionado}
                          />
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          }

          return (
            <ItemCategoria
              key={cat}
              label={cat}
              onClick={() => onSelecionarCategoria(cat)}
              selecionado={selecionado}
            />
          );
        })}
      </nav>

      {/* RODAPÉ */}
      <div className="mt-auto mx-2 pt-3 border-t border-gray-950/90">
        <button
          onClick={() => {
            const input = document.getElementById("busca") as HTMLInputElement;
            input?.focus();
          }}
          className="flex items-center gap-1.5 rounded-lg border border-gray-900 bg-gray-950 px-2 py-1.5 text-[10px] text-gray-500 hover:border-blue-500 hover:text-blue-400 w-full transition"
        >
          <span className="text-[10px]">🔍</span>
          Buscar
        </button>
      </div>
    </aside>
  );
}
