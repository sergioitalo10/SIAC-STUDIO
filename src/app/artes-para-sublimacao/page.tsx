import type { Metadata } from "next";
import SeoCategoryPage from "@/components/SeoCategoryPage";

export const metadata: Metadata = {
  title: "Artes para Sublimação | Arquivos Digitais Prontos",
  description: "Artes para sublimação e arquivos digitais para criação de camisas. Designs vetorizados e mascotes prontos para produção.",
  alternates: { canonical: "/artes-para-sublimacao" },
};

export default function ArtesParaSublimacaoPage() {
  return <SeoCategoryPage title="Artes para Sublimação" description="Encontre artes digitais para sublimação, camisas personalizadas e estampas prontas para produção." intro="O catálogo do SIAC STUDIO reúne designs digitais com foco em camisas, mascotes e sublimação. Compre o arquivo e tenha acesso ao download após a aprovação do pagamento." breadcrumb="Artes para Sublimação" productsFilter={() => true} />;
}
