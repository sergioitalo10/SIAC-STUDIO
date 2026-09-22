import type { Product } from "@/data/products";

export interface DesignerProduct {
  // Campos da API (nomes reais do retorno do /api/designer/approved)
  artwork_id?: number;
  titulo?: string;
  descricao?: string;
  categoria?: string | string[];
  preco?: number;
  imagem_url?: string;
  arquivo_url?: string;
  thumbnail_url?: string;
  tags?: string[];
  status?: string;
  designer_id?: number;
  designer_nome?: string;

  // Campos extras para compatibilidade com Product (quando usado no carrinho)
  id?: number;
  nome?: string;
  imagem?: string;
  downloadUrl?: string;
  designerId?: number;
  designerNome?: string;
  designerArtworkId?: number;
}
