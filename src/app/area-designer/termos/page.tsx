import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso — SIAC STUDIO",
  description:
    "Termos de uso para designers colaboradores da SIAC STUDIO.",
};

export default function TermosPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        color: "#eaeaea",
        fontFamily: 'Segoe UI, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "2.5rem",
          maxWidth: "720px",
          width: "100%",
          backdropFilter: "blur(10px)",
          maxHeight: "85vh",
          overflowY: "auto" as const,
        }}
      >
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: "0.5rem",
            textAlign: "center" as const,
          }}
        >
          Termos de Uso — Designer Colaborador
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "#a0a0b0",
            marginBottom: "2rem",
            textAlign: "center" as const,
          }}
        >
          Leia atentamente antes de continuar. Ao usar os serviços da SIAC
          STUDIO, você concorda com estes termos.
        </p>

        <div
          style={{
            borderLeft: "3px solid #e94560",
            paddingLeft: "1.2rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: "1rem",
            }}
          >
            1. Natureza da Relação
          </h2>
          <p
            style={{
              color: "#c0c0c8",
              lineHeight: 1.7,
              fontSize: "0.95rem",
            }}
          >
            A relação entre SIAC STUDIO e o Designer Colaborador é de natureza
            <strong>livre e consensual</strong>, não acarretando vínculo
            empregatício, contratual ou qualquer outro tipo de subordinação
            jurídica. O Designer atua de forma autônoma, em regime de{" "}
            <strong>parceria colaborativa</strong> (tipo "lab"), onde cada arte
            subida é avaliada individualmente.
          </p>
        </div>

        <div
          style={{
            borderLeft: "3px solid #e94560",
            paddingLeft: "1.2rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: "1rem",
            }}
          >
            2. Divisão de Receita
          </h2>
          <p
            style={{
              color: "#c0c0c8",
              lineHeight: 1.7,
              fontSize: "0.95rem",
            }}
          >
            Para cada arte enviada e aprovada que gerar venda:
          </p>
          <ul
            style={{
              color: "#c0c0c8",
              lineHeight: 1.7,
              fontSize: "0.95rem",
              paddingLeft: "1.5rem",
            }}
          >
            <li>
              <strong>60%</strong> da venda permanece com a SIAC STUDIO
            </li>
            <li>
              <strong>40%</strong> da venda é creditada ao Designer
              Colaborador
            </li>
          </ul>
          <p
            style={{
              color: "#a0a0a8",
              fontSize: "0.85rem",
              marginTop: "0.7rem",
              fontStyle: "italic" as const,
            }}
          >
            Valor inicial definido pelo designer por até 3 meses. Após esse
            período, o valor padroniza para R$ 20,00 por arte como valor base.
          </p>
        </div>

        <div
          style={{
            borderLeft: "3px solid #e94560",
            paddingLeft: "1.2rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: "1rem",
            }}
          >
            3. Padrão de Trabalho
          </h2>
          <p
            style={{
              color: "#c0c0c8",
              lineHeight: 1.7,
              fontSize: "0.95rem",
            }}
          >
            É <strong>obrigatório</strong> o uso do nome{" "}
            <strong>SIAC STUDIO</strong> nas costas de todas as artes entregues
            nos formatos CDR, PDF e preview.png. Não será permitido fazer
            propaganda do nome do designer nas artes.
          </p>
          <p
            style={{
              color: "#c0c0c8",
              lineHeight: 1.7,
              fontSize: "0.95rem",
            }}
          >
            O designer deve seguir o padrão de envio estabelecido pela SIAC
            STUDIO, incluindo o arquivo compactado .rar contendo{" "}
            <code>preview.png</code> e <code>arquivo.rar</code> (com fonte, .cdr
            e PDF/X1A).
          </p>
        </div>

        <div
          style={{
            borderLeft: "3px solid #e94560",
            paddingLeft: "1.2rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: "1rem",
            }}
          >
            4. Exclusividade e Comercialização
          </h2>
          <p
            style={{
              color: "#c0c0c8",
              lineHeight: 1.7,
              fontSize: "0.95rem",
            }}
          >
            Não há exigência de exclusividade. Todas as artes subidas e
            aprovadas são <strong>comercializáveis</strong> pela SIAC STUDIO.
            O designer pode continuar criando para outros projetos e clientes.
          </p>
        </div>

        <div
          style={{
            borderLeft: "3px solid #e94560",
            paddingLeft: "1.2rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: "1rem",
            }}
          >
            5. Análise e Aprovação
          </h2>
          <p
            style={{
              color: "#c0c0c8",
              lineHeight: 1.7,
              fontSize: "0.95rem",
            }}
          >
            Toda arte enviada passa por análise da SIAC STUDIO antes de ser
            publicada. A aprovação é discricionária e baseada na qualidade,
            adequação ao padrão e conformidade com estes termos.
          </p>
        </div>

        <div
          style={{
            borderLeft: "3px solid #e94560",
            paddingLeft: "1.2rem",
            marginBottom: "2rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              color: "#ffffff",
              marginBottom: "1rem",
            }}
          >
            6. Responsabilidade
          </h2>
          <p
            style={{
              color: "#c0c0c8",
              lineHeight: 1.7,
              fontSize: "0.95rem",
            }}
          >
            O Designer é responsável por garantir que as artes subidas não
            violam direitos autorais de terceiros, conteúdos ilegais ou
            Fortunately, não possui restrições de uso. A SIAC STUDIO não se
            responsabiliza por eventuais violações de direitos autorais por
            parte do Designer.
          </p>
        </div>

        <p
          style={{
            fontSize: "0.85rem",
            color: "#777790",
            textAlign: "center" as const,
            marginTop: "2rem",
          }}
        >
          Ao clicar em "Aceitar" no formulário de cadastro, você declara que
          leu, compreendeu e concorda plenamente com estes termos.
        </p>
      </div>
    </div>
  );
}
