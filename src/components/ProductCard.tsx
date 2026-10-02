"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/product-seo";

interface ProductCardProps {
  id: number;
  nome: string;
  categoria: string | string[];
  preco: number;
  imagem: string;
  preview2?: string;
  arquivo?: string;
  formato?: string;
  onClick?: () => void;
}

export default function ProductCard({ id, nome, categoria, preco, imagem, preview2, arquivo, formato = "CDR, PDF, Fonte", onClick }: ProductCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imagemAtual, setImagemAtual] = useState(imagem);
  const formatosArray: string[] = [...new Set(formato.split(",").map((f) => {
    const upper = f.trim().toUpperCase();
    if (upper === "AI") return "FONTE";
    if (upper === "COR") return "";
    return upper;
  }).filter((f) => f !== ""))];
  const productUrl = `/produto/${slugify(nome)}`;
  const nomeExibicao = nome;

  const handleComprar = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem("carrinho_pendente", JSON.stringify({ id, nome, preco, imagem, categoria, arquivo }));
    router.push("/minha-conta");
  };

  const imagemParaExibir = isHovered && preview2 ? preview2 : imagemAtual;

  return (
    <div className="w-full rounded-2xl border border-gray-800 bg-gray-950 overflow-hidden flex flex-col items-center justify-center gap-0.5 hover:border-blue-500/50 transition duration-300 group p-1.5" onClick={onClick}>
      <div className="w-full">
        <Link href={productUrl} aria-label={`Ver ${nomeExibicao}`}>
          <div className="relative h-56 w-full overflow-hidden bg-gray-900" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <img src={imagemParaExibir} alt={`Arte ${nomeExibicao} para sublimação`} className="w-full h-full object-cover transition duration-300" onError={() => {
              if (preview2 && imagemAtual === imagem) setImagemAtual(preview2);
            }} />
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 bg-black/90 px-2 py-1">
              {formatosArray.map((item, index) => <span key={index} className="text-[9px] font-medium text-gray-300">{item}</span>)}
            </div>
            <span className="absolute top-3 right-3 p-1 rounded-full bg-black/60 text-gray-400" aria-hidden="true">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682c1.76-1.76 4.61-4.61 6.364-6.364 1.76-1.76 4.61-6.364 6.364-6.364 0z" /></svg>
            </span>
          </div>
          <h3 className="text-[11px] font-bold text-white group-hover:text-blue-400 transition text-center line-clamp-2 mt-1 leading-tight">{nomeExibicao}</h3>
        </Link>
        <p className="text-[9px] text-gray-400 text-center mt-0.5">Pacote Digital (.RAR)</p>
      </div>

      <div className="flex items-center gap-1.5 w-full mt-1">
        <div className="flex-1 text-left min-w-0">
          <span className="text-[8px] uppercase font-semibold text-gray-500 block">Valor</span>
          <span className="text-[13px] font-bold text-white truncate">R$ {preco.toFixed(2).replace(".", ",")}</span>
        </div>
        <button onClick={handleComprar} className="rounded-md bg-black px-2 py-1 text-[9px] font-semibold text-white transition hover:bg-gray-800 border border-gray-700 hover:border-blue-500 w-full sm:w-auto text-center">Comprar</button>
      </div>
    </div>
  );
}
