import type { Metadata } from "next";
import SeoCategoryPage from "@/components/SeoCategoryPage";

export const metadata: Metadata = {
  title: "Artes para Camisa | Estampas Digitais para Sublimação",
  description: "Artes para camisa e estampas digitais para sublimação. Encontre modelos de mascotes e designs para camisas de jogos e eventos.",
  alternates: { canonical: "/artes-para-camisa" },
};

export default function ArtesParaCamisaPage() {
  return <SeoCategoryPage title="Artes para Camisa" description="Modelos de arte para camisa, estampas digitais e designs preparados para sublimação." intro="Encontre uma arte para criar sua camisa personalizada. O SIAC STUDIO oferece arquivos digitais com mascotes e designs voltados para produção." breadcrumb="Artes para Camisa" productsFilter={() => true} />;
}
