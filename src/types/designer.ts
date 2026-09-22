export interface DesignerProduct {
  // Campos da API (nomes reais do retorno do /api/designer/approved)
  artwork_id: number;
  titulo: string;
  descricao: string | null;
  categoria: string | string[] | null;
  preco: number;
  imagem_url: string | null;
  arquivo_url: string | null;
  thumbnail_url: string | null;
  tags: string[] | null;
  status: string;
  designer_id: number;
  designer_nome: string | null;

  // Campos extras para compatibilidade com Product/carrinho
  id?: number;
  nome?: string;
  imagem?: string;
  downloadUrl?: string;
  designerId?: number;
  designerNome?: string;
  designerArtworkId?: number | null;
}
