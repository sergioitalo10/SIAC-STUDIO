"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Pedido {
  id: number;
  email: string;
  total: number;
  status: string;
  criado_em: string;
}

interface Cliente {
  id: number;
  nome: string;
  email: string;
}

interface Designer {
  id: number;
  nome: string;
  email: string;
  especialidade?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [tipoMsg, setTipoMsg] = useState<"ok" | "erro" | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("admin_logado")) {
      router.push("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resPedidos, resClientes, resDesigners] = await Promise.all([
          fetch("/api/admin/pedidos"),
          fetch("/api/admin/clientes"),
          fetch("/api/admin/designers"),
        ]);

        if (resPedidos.ok) {
          const data = await resPedidos.json();
          setPedidos(data.pedidos || []);
        }

        if (resClientes.ok) {
          const data = await resClientes.json();
          setClientes(data.clientes || []);
        }

        if (resDesigners.ok) {
          const data = await resDesigners.json();
          setDesigners(data.designers || []);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  function formatData(data: string) {
    return data.slice(0, 10);
  }

  function formatBrl(valor: number) {
    return "R$ " + valor.toFixed(2).replace(".", ",");
  }

  const [showClientes, setShowClientes] = useState(false);
  const [showVendas, setShowVendas] = useState(false);
  const [showArtes, setShowArtes] = useState(false);
  const [showDesigners, setShowDesigners] = useState(false);

  function gerarRelatorio() {
    const container = document.getElementById("relatorios-print");
    if (!container) return;

    let html = "";

    if (showClientes) {
      html += `
        <div class="relatorio">
          <h2>Clientes Cadastrados</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${clientes.length === 0 
                ? "<tr><td colspan='3'>Nenhum cliente cadastrado</td></tr>"
                : clientes.map(c => `
                  <tr>
                    <td>${c.id}</td>
                    <td>${c.nome}</td>
                    <td>${c.email}</td>
                  </tr>
                `).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    if (showVendas) {
      html += `
        <div class="relatorio">
          <h2>Pedidos Pagos</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              ${pedidos.length === 0 
                ? "<tr><td colspan='4'>Nenhum pedido</td></tr>"
                : pedidos.map(p => `
                  <tr>
                    <td>${p.id}</td>
                    <td>${p.email}</td>
                    <td>${formatBrl(p.total)}</td>
                    <td>${formatData(p.criado_em)}</td>
                  </tr>
                `).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    if (showArtes) {
      const totalArtes = 0; 
      html += `
        <div class="relatorio">
          <h2>Artes no Catálogo</h2>
          <div class="total-artes">${totalArtes}</div>
          <p class="observacao">Total de artes disponíveis para venda</p>
        </div>
      `;
    }

    if (showDesigners) {
      html += `
        <div class="relatorio">
          <h2>Designers Parceiros Cadastrados</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${designers.length === 0 
                ? "<tr><td colspan='3'>Nenhum designer cadastrado</td></tr>"
                : designers.map(d => `
                  <tr>
                    <td>${d.id}</td>
                    <td>${d.nome}</td>
                    <td>${d.email}</td>
                  </tr>
                `).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    if (!html) {
      setMensagem("Selecione pelo menos um relatório para gerar.");
      return;
    }

    container.innerHTML = html;
    setTimeout(() => {
      window.print();
    }, 300);
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      color: "#fff",
      padding: "20px",
      position: "relative",
      zIndex: 9999,
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        canvas, 
        .light-rays, 
        .animated-gradient,
        [class*="light-rays"],
        [class*="animated-gradient"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          height: 0 !important;
          width: 0 !important;
        }
        body {
          background: #000000 !important;
          background-image: none !important;
        }
      `}} />

      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 0",
        borderBottom: "1px solid #333",
        marginBottom: "20px",
      }}>
        <div>
          <h1 style={{ margin: 0, color: "#60a5fa" }}>SIAC STUDIO</h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>Painel Admin</p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("admin_logado");
            router.push("/admin/login");
          }}
          style={{
            padding: "8px 16px",
            background: "transparent",
            color: "#f87171",
            border: "1px solid #f87171",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </header>

      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        <span style={{ color: "#94a3b8", marginRight: "5px", fontSize: "14px" }}>Relatórios:</span>

        <button
          onClick={() => setShowClientes(!showClientes)}
          style={{
            padding: "8px 16px",
            background: showClientes ? "#2563eb" : "#1a1a1a",
            color: showClientes ? "#fff" : "#94a3b8",
            border: "1px solid " + (showClientes ? "#3b82f6" : "#333"),
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          {showClientes ? "✓ Clientes" : "Clientes"}
        </button>

        <button
          onClick={() => setShowVendas(!showVendas)}
          style={{
            padding: "8px 16px",
            background: showVendas ? "#2563eb" : "#1a1a1a",
            color: showVendas ? "#fff" : "#94a3b8",
            border: "1px solid " + (showVendas ? "#3b82f6" : "#333"),
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          {showVendas ? "✓ Vendas" : "Vendas"}
        </button>

        <button
          onClick={() => setShowArtes(!showArtes)}
          style={{
            padding: "8px 16px",
            background: showArtes ? "#2563eb" : "#1a1a1a",
            color: showArtes ? "#fff" : "#94a3b8",
            border: "1px solid " + (showArtes ? "#3b82f6" : "#333"),
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          {showArtes ? "✓ Artes" : "Artes"}
        </button>

        <button
          onClick={() => setShowDesigners(!showDesigners)}
          style={{
            padding: "8px 16px",
            background: showDesigners ? "#2563eb" : "#1a1a1a",
            color: showDesigners ? "#fff" : "#94a3b8",
            border: "1px solid " + (showDesigners ? "#3b82f6" : "#333"),
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          {showDesigners ? "✓ Designers" : "Designers"}
        </button>

        <button
          onClick={gerarRelatorio}
          disabled={!showClientes && !showVendas && !showArtes && !showDesigners}
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            opacity: (!showClientes && !showVendas && !showArtes && !showDesigners) ? 0.5 : 1,
          }}
        >
          Imprimir Relatórios
        </button>
      </div>

      {/* Mensagem */}
      {mensagem && (
        <div style={{
          background: tipoMsg === "erro" ? "rgba(248, 113, 113, 0.1)" : "rgba(74, 222, 128, 0.1)",
          color: tipoMsg === "erro" ? "#f87171" : "#4ade80",
          padding: "10px",
          borderRadius: "6px",
          marginBottom: "20px",
        }}>
          {mensagem}
        </div>
      )}

      {/* Relatórios selecionados */}
      {showClientes && (
        <div style={{
          background: "#111",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
        }}>
          <h2 style={{ color: "#94a3b8", marginBottom: "15px" }}>Clientes Cadastrados</h2>
          {clientes.length === 0 ? (
            <p style={{ color: "#666" }}>Nenhum cliente cadastrado</p>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {clientes.map(c => (
                <div key={c.id} style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #222",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span><strong>{c.nome}</strong></span>
                    <span style={{ color: "#666", fontSize: "14px" }}>ID: {c.id}</span>
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "14px", marginTop: "3px" }}>{c.email}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showVendas && (
        <div style={{
          background: "#111",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
        }}>
          <h2 style={{ color: "#4ade80", marginBottom: "15px" }}>Vendas (Pedidos Pagos)</h2>
          {pedidos.length === 0 ? (
            <p style={{ color: "#666" }}>Nenhuma venda registrada</p>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {pedidos.map(p => (
                <div key={p.id} style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #222",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <strong style={{ color: "#fff" }}>#{p.id}</strong>
                    <span style={{ color: "#666", fontSize: "14px", marginLeft: "8px" }}>{p.email}</span>
                  </div>
                  <div>
                    <span style={{ color: "#4ade80", fontWeight: "bold" }}>{formatBrl(p.total)}</span>
                    <span style={{ color: "#666", fontSize: "14px", marginLeft: "8px" }}>
                      {formatData(p.criado_em)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showArtes && (
        <div style={{
          background: "#111",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
        }}>
          <h2 style={{ color: "#a78bfa", marginBottom: "15px" }}>Artes no Catálogo</h2>
          <p style={{ color: "#94a3b8", margin: 0 }}>Total de artes disponíveis para venda: <strong>0</strong></p>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "8px" }}>
            (Esta seção mostra o total de artes atualmente no catálogo para venda)
          </p>
        </div>
      )}

      {showDesigners && (
        <div style={{
          background: "#111",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "20px",
        }}>
          <h2 style={{ color: "#a78bfa", marginBottom: "15px" }}>Designers Parceiros</h2>
          {designers.length === 0 ? (
            <p style={{ color: "#666" }}>Nenhum designer cadastrado</p>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {designers.map(d => (
                <div key={d.id} style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #222",
                  display: "flex",
                  justifyContent: "space-between",
                }}>
                  <div>
                    <strong style={{ color: "#fff" }}>{d.nome}</strong>
                    <span style={{ color: "#666", fontSize: "14px", marginLeft: "8px" }}>ID: {d.id}</span>
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "14px" }}>{d.email}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Restante do conteúdo */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "20px",
      }}>
        {/* Pedidos Recentes */}
        <div style={{
          background: "#111",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "20px",
        }}>
          <h2 style={{ color: "#94a3b8", marginBottom: "15px" }}>Pedidos Recentes</h2>
          {pedidos.length === 0 ? (
            <p style={{ color: "#666" }}>Nenhum pedido encontrado</p>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {pedidos.map(pedido => (
                <div key={pedido.id} style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #222",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span><strong>Pedido #{pedido.id}</strong></span>
                    <span>{formatBrl(pedido.total)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#666", fontSize: "14px", marginTop: "5px" }}>
                    <span>{pedido.email}</span>
                    <span style={{ color: pedido.status === "pago" ? "#4ade80" : "#fbbf24" }}>
                      {pedido.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Designers na Rede */}
        <div style={{
          background: "#111",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "20px",
        }}>
          <h2 style={{ color: "#a78bfa", marginBottom: "15px" }}>Designers na Rede</h2>
          {designers.length === 0 ? (
            <p style={{ color: "#666" }}>Nenhum designer conectado</p>
          ) : (
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {designers.map(d => (
                <div key={d.id} style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #222",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px"
                }}>
                  <span><strong>{d.nome}</strong></span>
                  <span style={{ color: "#666" }}>{d.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Container invisível para impressão de relatórios */}
      <div id="relatorios-print" style={{ display: "none" }}></div>
    </div>
  );
}
