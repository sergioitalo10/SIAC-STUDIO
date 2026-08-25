import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  imagem: string;
};

export default function ProductCard({
  id,
  nome,
  categoria,
  preco,
  imagem,
}: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 transition duration-300 hover:-translate-y-1 hover:border-blue-500">
      
      <div className="relative aspect-square bg-gray-900">
        <Image
          src={imagem}
          alt={nome}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-5">
        
        <p className="text-sm text-gray-400">
          {categoria}
        </p>

        <h3 className="mt-1 text-lg font-semibold text-white">
          {nome}
        </h3>

        <div className="mt-4 flex items-center justify-between">
          
          <span className="text-xl font-bold text-blue-500">
            R$ {preco.toFixed(2).replace(".", ",")}
          </span>

         <Link
        href={`/produto/${id}`}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-500"
        >
          Comprar
        </Link>

        </div>

      </div>

    </article>
  );
}