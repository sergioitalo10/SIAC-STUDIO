"use client";

import { useEffect, useState } from "react";


interface NotificacaoProps {
  pedidoId: number;
}

export default function NotificacaoPedido({ pedidoId }: NotificacaoProps) {
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false); // Controla se o pop-up está aberto

  // Busca os alertas do banco Neon
  const carregarAlertas = async () => {
    try {
      const res = await fetch(`/api/mensagens?pedidoId=${pedidoId}`);
      const data = await res.json();
      if (data.ok) {
        setMensagens(data.mensagens || []);
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
    }
  };

  useEffect(() => {
    carregarAlertas();
  }, [pedidoId]);

  // Se não houver nenhuma mensagem enviada pelo admin, não exibe a cartinha
  if (mensagens.length === 0) return null;

  return (
    <div className="mt-2">
      {/* ✉️ O BOTÃO EM FORMATO DE CARTINHA */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-semibold transition cursor-pointer animate-pulse"
      >
        <span>✉️</span> Você tem ({mensagens.length}) nova(s) atualização(ões)
      </button>

      {/* 🪟 O POP-UP (MODAL) QUE ABRE AO CLICAR */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-6 shadow-2xl relative">
            
            {/* Cabeçalho do Pop-up */}
            <div className="flex items-center justify-between border-b border-gray-900 pb-3 mb-4">
              <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <span>🔔</span> Atualizações do Pedido #{pedidoId}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-white transition text-xs font-bold px-2 py-1 rounded bg-gray-900 cursor-pointer"
              >
                Fechar
              </button>
            </div>

            {/* Lista de Mensagens rolável */}
            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
              {mensagens.map((msg) => {
                const isSistema = msg.autor_tipo === 'sistema';
                return (
                  <div
                    key={msg.id}
                    className="rounded-xl bg-black/40 border border-gray-900 p-3.5 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] text-gray-500">
                      <span className="font-bold text-gray-400 uppercase tracking-wider">
                        {isSistema ? "Status Automático" : "Aviso do SIAC Studio"}
                      </span>
                      <span>
                        {new Date(msg.criado_em).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed font-medium">
                      {msg.mensagem}
                    </p>
                  </div>
                );
              })}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
