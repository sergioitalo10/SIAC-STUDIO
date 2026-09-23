import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

let transporter: any = null;

export function getTransporter() {
  if (transporter) return transporter;

  const email = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASSWORD?.trim();
  const host = process.env.EMAIL_HOST?.trim() || "smtp.gmail.com";
  const port = parseInt(process.env.EMAIL_PORT?.trim() || "587", 10);

  if (!email || !pass) {
    throw new Error(
      `Configuração de e-mail incompleta: EMAIL_USER e EMAIL_PASSWORD são obrigatórios.`
    );
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user: email, pass },
    tls: { rejectUnauthorized: false },
  });

  return transporter;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"SIAC STUDIO" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ E-mail enviado para: ${to} | Assunto: ${subject}`);
    return true;
  } catch (error: any) {
    console.error(`❌ ERRO ao enviar e-mail para ${to}:`, error.message);
    return false;
  }
}

export async function sendDesignerSaleNotification(
  designerEmail: string,
  designerNome: string,
  pedidoId: number,
  valorVenda: number,
  valorComissao: number
): Promise<boolean> {
  const assunto = `💰 Nova venda aprovada — SIAC STUDIO`;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Nova venda aprovada</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f9; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #e94560, #c23152); color: #fff; padding: 20px; border-radius: 12px 12px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 1.4rem; }
          .content { padding: 20px 0; color: #333; line-height: 1.6; }
          .detail { background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 10px 0; }
          .detail strong { color: #e94560; }
          .footer { text-align: center; color: #999; font-size: 0.85rem; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Nova Venda Aprovada</h1>
          </div>
          <div class="content">
            <p>Olá, <strong>${designerNome}</strong>!</p>
            <p>Uma de suas artes foi vendida com sucesso na <strong>SIAC STUDIO</strong>.</p>
            <div class="detail">
              <strong>Pedido #${pedidoId}</strong><br>
              Valor da venda: <strong>R$ ${valorVenda.toFixed(2)}</strong><br>
              Sua comissão (40%): <strong>R$ ${valorComissao.toFixed(2)}</strong>
            </div>
            <p>Parabéns pela venda! O valor da comissão já está disponível em seu relatório de ganhos.</p>
            <p>Atenciosamente,<br><strong>Equipe SIAC STUDIO</strong></p>
          </div>
          <div class="footer">
            SIAC STUDIO — Artes para Sublimação
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: designerEmail, subject: assunto, html });
}
