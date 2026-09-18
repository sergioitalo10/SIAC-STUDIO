'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Produto {
  id: number;
  nome: string;
  preco: number;
  imagem?: string;
  arquivo?: string;
}

interface ModalProdutoProps {
  produto: Produto | null;
  onClose: () => void;
  onComprar: (produto: Produto) => void;
}

export default function ModalProduto({ produto, onClose, onComprar }: ModalProdutoProps) {
  const router = useRouter();

  if (!produto) return null;

  const handleAcaoCompra = () => {
    onComprar(produto);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      {/* Overlay para fechar ao clicar fora */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Card do Modal */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-zinc-950 p-6 text-zinc-100 shadow-2xl border border-zinc-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
          aria-label="Fechar"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Previsualização */}
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800/80">
            {produto.imagem ? (
              <Image
                src={produto.imagem}
                alt={produto.nome}
                fill
                className="object-contain p-2"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                Sem prévia disponível
              </div>
            )}
          </div>

          {/* Informações e Botão de Ação */}
          <div className="flex flex-col justify-between pt-2">
            <div>
              <span className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                Arte Digital • Sublimação
              </span>
              <h2 className="mt-2 text-2xl font-bold text-white tracking-tight">
                {produto.nome}
              </h2>
              
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">
                  R$ {produto.preco.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                Arquivo digital vetorial/alta resolução (.RAR) liberado para download imediato após a confirmação do pagamento.
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={handleAcaoCompra}
                className="w-full rounded-xl bg-emerald-600 py-3.5 px-4 font-bold text-white transition hover:bg-emerald-500 active:scale-[0.99] shadow-lg shadow-emerald-900/20"
              >
                Comprar Agora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}