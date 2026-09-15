import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pedidoId = searchParams.get("pedidoId");

    if (!pedidoId) {
      return NextResponse.json({ error: "Parâmetro pedidoId ausente." }, { status: 400 });
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ error: "DATABASE_URL não configurada." }, { status: 500 });
    }

    const sql = neon(dbUrl);

    // 1. Busca o produto comprado no pedido
    const resultados: any = await sql`
      SELECT 
        ped.status,
        pi.nome AS nome_produto
      FROM pedidos ped
      JOIN pedido_itens pi ON pi.pedido_id = ped.id
      WHERE ped.id = ${Number(pedidoId)}
    `;

    if (!resultados || resultados.length === 0) {
      return NextResponse.json({ error: `Nenhum produto localizado no pedido #${pedidoId}.` }, { status: 404 });
    }

    const itemPedido = resultados[0];
    const statusAtual = String(itemPedido.status).toLowerCase().trim();

    // 2. Trava de segurança de pagamento aprovado
    const statusValidos = ["pagamento_aprovado", "approved", "aprovado", "concluido", "pago"];
    if (!statusValidos.includes(statusAtual)) {
      return NextResponse.json({ error: `Download bloqueado. Status do pedido: ${itemPedido.status}` }, { status: 403 });
    }

    // 3. Quebra o nome do banco em palavras-chave para busca flexível
    const nomeOriginal = String(itemPedido.nome_produto);
    const palavrasChave = nomeOriginal
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(/[\s-_\/]+/)
      .filter(palavra => palavra.length > 2 && palavra !== "por" && palavra !== "com");

    // 4. VARREDURA INTELIGENTE POR APROXIMAÇÃO
    const baseDir = "C:\\SIAC-STUDIO\\site\\arquivos\\interclasses";
    let finalPath = "";

    if (fs.existsSync(baseDir)) {
      const categorias = fs.readdirSync(baseDir);

      for (const cat of categorias) {
        const caminhoCategoria = path.join(baseDir, cat);

        if (fs.statSync(caminhoCategoria).isDirectory()) {
          const subPastas = fs.readdirSync(caminhoCategoria);
          
          for (const pastaFisica of subPastas) {
            const pastaFisicaMin = pastaFisica.toLowerCase();
            
            // Verifica se as palavras-chave principais existem no nome da pasta
            const bateComAArte = palavrasChave.every(palavra => pastaFisicaMin.includes(palavra));

            if (bateComAArte) {
              const caminhoTeste = path.join(caminhoCategoria, pastaFisica, "arquivo.rar");
              if (fs.existsSync(caminhoTeste)) {
                finalPath = caminhoTeste;
                break;
              }
            }
          }
        }
        if (finalPath) break;
      }
    }

    // LOG DE MONITORAMENTO NO SHELL
    console.log("\n=========================================");
    console.log(`📦 PRODUTO NO BANCO: "${nomeOriginal}"`);
    console.log(`🔗 CAMINHO REAL LOCALIZADO:\n👉 ${finalPath || "NENHUM LUGAR (404)"}`);
    console.log("=========================================\n");

    if (!finalPath) {
      return NextResponse.json(
        { 
          error: "O arquivo não foi encontrado usando a busca inteligente por aproximação.", 
          nomeNoBanco: nomeOriginal,
          caminhoBase: baseDir
        }, 
        { status: 404 }
      );
    }

    // 5. Entrega o arquivo forçando o nome padrão "arquivo.rar" no computador do cliente
    const fileBuffer = fs.readFileSync(finalPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        // Mudado aqui para travar o nome como "arquivo.rar" para o cliente
        "Content-Disposition": `attachment; filename="arquivo.rar"`,
        "Content-Type": "application/x-rar-compressed",
      },
    });

  } catch (error: any) {
    console.error("Erro na rota de download:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
