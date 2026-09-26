"use client";

import { useRouter } from "next/navigation";

interface ProductCardProps {
  id: number;
  nome: string;
  categoria: string | string[]; // Suporta 1 ou mais categorias
  preco: number;
  imagem: string;
  arquivo?: string;
  formato?: string; // Formatos de arquivo (CDR, AI, PDF, Fonte)
}

export default function ProductCard({ id, nome, categoria, preco, imagem, arquivo, formato = "CDR, PDF, Fonte" }: ProductCardProps) {
  const router = useRouter();

  // Formata a categoria com espaçamento adequado se for um array
  const categoriaFormatada = Array.isArray(categoria)
    ? categoria.join(" • ")
    : categoria;

  // Converte os formatos em array para exibição na faixa
  // Mapeia AI → FONTE e remove COR, mantendo apenas CDR, PDF e FONTE (sem duplicatas)
  const formatosArray: string[] = [
    ...new Set(
      formato.split(",").map((f) => {
        const upper = f.trim().toUpperCase();
        if (upper === "AI") return "FONTE";
        if (upper === "COR") return "";
        return upper;
      }).filter((f) => f !== "")
    )
  ];

  const handleComprar = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita conflitos ao clicar diretamente no botão comprar

    localStorage.setItem(
      "carrinho_pendente",
      JSON.stringify({ id, nome, preco, imagem, categoria, arquivo })
    );

    router.push("/minha-conta");
  };

  // Prefixo de Arte + Categoria para o nome como no marcusdesigner
  // Aplica o prefixo em todos os produtos, independente da categoria
  const nomeComPrefixo = `Arte Camisa Interclasses ${nome}`;

  return (
   <div className="rounded-2xl border border-gray-800 bg-gray-950 overflow-hidden flex flex-col items-center justify-center gap-0.5 hover:border-blue-500/50 transition duration-300 group p-1.5 w-[calc(100%/1.33)]">
     <div>
       <div className="relative h-64 w-full overflow-hidden bg-gray-900">
          <img
            src={imagem}
            alt={nomeComPrefixo}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          {/* Faixa de formatos no canto inferior da imagem (igual ao marcusdesigner) */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-black/90 px-2 py-1">
            {formatosArray.map((formato, index) => (
              <span
                key={index}
                className="text-[9px] font-medium text-gray-300 hover:text-white transition cursor-pointer"
              >
                {formato.trim()}
              </span>
            ))}
          </div>
          {/* Badge de favorito no canto superior direito */}
          <button
            className="absolute top-3 right-3 p-1 rounded-full bg-black/60 text-gray-400 hover:text-red-400 transition"
            aria-label="Adicionar aos favoritos"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <h3 className="text-[11px] font-bold text-white group-hover:text-blue-400 transition text-center line-clamp-2 mt-1 leading-tight">
          {nomeComPrefixo}
        </h3>
        <p className="text-[9px] text-gray-400 text-center mt-0.5">Pacote Digital (.RAR)</p>
      </div>

      <div className="flex items-center gap-1.5 w-full mt-1">
        <div className="flex-1 text-left min-w-0">
          <span className="text-[8px] uppercase font-semibold text-gray-500 block">Valor</span>
          <span className="text-[13px] font-bold text-white truncate">
            R$ {preco.toFixed(2).replace(".", ",")}
          </span>
        </div>

        <button
          onClick={handleComprar}
          className="rounded-md bg-black px-2 py-1 text-[9px] font-semibold text-white transition hover:bg-gray-800 border border-gray-700 hover:border-blue-500 w-full sm:w-auto text-center"
        >
          Comprar
        </button>
      </div>
    </div>
  );
}