import type { Metadata } from "next";
import SeoCategoryPage from "@/components/SeoCategoryPage";

export const metadata: Metadata = {
  title: "Mascotes para Interclasse | Artes para Camisas",
  description: "Mascotes para interclasse e artes de animais para camisas escolares. Encontre raposa, pantera, dragão, tigre, leão e outros designs para sublimação.",
  alternates: { canonical: "/mascotes-interclasse" },
};

export default function MascotesInterclassePage() {
  return <SeoCategoryPage title="Mascotes para Interclasse" description="Escolha mascotes e artes para representar sua equipe em camisas de interclasse e jogos internos." intro="Raposa, pantera, dragão, tigre, leão, lince, fênix, cobra, kraken e outros personagens fazem parte do catálogo do SIAC STUDIO. Todas as artes desta coleção são produtos digitais." breadcrumb="Mascotes para Interclasse" productsFilter={(product) => Array.isArray(product.categoria) ? product.categoria.includes("Interclasses") : product.categoria === "Interclasses"} />;
}
