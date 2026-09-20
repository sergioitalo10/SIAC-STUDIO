"use client";

import { useRouter } from "next/navigation";

interface ProductCardProps {
  id: number;
  nome: string;
  categoria: string | string[]; // Suporta 1 ou mais categorias
  preco: number;
  imagem: string;
  arquivo?: string;
}

export default function ProductCard({ id, nome, categoria, preco, imagem, arquivo }: ProductCardProps) {
  const router = useRouter();

  // Formata a categoria com espaçamento adequado se for um array
  const categoriaFormatada = Array.isArray(categoria)
    ? categoria.join(" • ")
    : categoria;

  const handleComprar = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita conflitos ao clicar diretamente no botão comprar

    localStorage.setItem(
      "carrinho_pendente",
      JSON.stringify({ id, nome, preco, imagem, categoria, arquivo })
    );

    router.push("/minha-conta");
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-950 overflow-hidden flex flex-col justify-between hover:border-blue-500/50 transition duration-300 group">
      <div>
        <div className="relative h-48 w-full overflow-hidden bg-gray-900">
          <img
            src={imagem}
            alt={nome}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 text-blue-400 text-[10px] font-semibold rounded-full border border-blue-500/20">
            {categoriaFormatada}
          </span>
        </div>

        <div className="p-5">
          <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition line-clamp-1">
            {nome}
          </h3>
          <p className="text-xs text-gray-400 mt-1">Pacote Digital (.RAR)</p>
        </div>
      </div>

      <div className="p-5 pt-0 border-t border-gray-900 flex items-center justify-between mt-auto">
        <div>
          <span className="text-[10px] uppercase font-semibold text-gray-500 block">Valor</span>
          <span className="text-lg font-bold text-white">
            R$ {preco.toFixed(2).replace(".", ",")}
          </span>
        </div>

        <button
          onClick={handleComprar}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 shadow-md shadow-blue-600/20 cursor-pointer"
        >
          Comprar Agora
        </button>
      </div>
    </div>
  );
}