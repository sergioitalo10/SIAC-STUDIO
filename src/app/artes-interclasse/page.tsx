import type { Metadata } from "next";
import SeoCategoryPage from "@/components/SeoCategoryPage";

export const metadata: Metadata = {
  title: "Artes para Interclasse | Camisas e Jogos Internos",
  description: "Artes para interclasse, camisas de jogos internos e competições escolares. Encontre mascotes e designs digitais prontos para sublimação.",
  alternates: { canonical: "/artes-interclasse" },
};

export default function ArtesInterclassePage() {
  return <SeoCategoryPage title="Artes para Interclasse" description="Artes digitais para camisas de interclasse, jogos internos e competições escolares, com mascotes e designs preparados para sublimação." intro="Escolha uma arte pronta para personalizar sua camisa de interclasse. O arquivo digital é liberado após a confirmação do pagamento." breadcrumb="Artes para Interclasse" productsFilter={(product) => Array.isArray(product.categoria) ? product.categoria.includes("Interclasses") : product.categoria === "Interclasses"} />;
}
