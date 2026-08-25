export type Product = {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  imagem: string;
  descricao: string;
};

export const products: Product[] = [
  {
    id: 1,
    nome: "Arte Modelo Premium",
    categoria: "Sublimação Total",
    preco: 14.90,
    imagem: "/produtos/produto-teste.png",
    descricao: "Arte digital profissional para sublimação total.",
  },

  {
    id: 2,
    nome: "Arte Pesca Premium",
    categoria: "Pesca",
    preco: 14.90,
    imagem: "/produtos/produto-teste.png",
    descricao: "Modelo de arte para camisas de pesca.",
  },

  {
    id: 3,
    nome: "Arte Futebol Premium",
    categoria: "Futebol",
    preco: 12.90,
    imagem: "/produtos/produto-teste.png",
    descricao: "Modelo de arte para camisas esportivas.",
  },

  {
    id: 4,
    nome: "Arte Motocross Premium",
    categoria: "Motocross",
    preco: 16.90,
    imagem: "/produtos/produto-teste.png",
    descricao: "Modelo de arte para camisas de motocross.",
  },
];