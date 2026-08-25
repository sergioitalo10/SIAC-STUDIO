export type Product = {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  imagem: string;
  descricao: string;
  destaque?: boolean;
  tags?: string[];
};

export const products: Product[] = [
  {
    id: 1,
    nome: "Arte Modelo Premium",
    categoria: "Sublimação Total",
    preco: 14.90,
    imagem: "/produtos/produto-teste.png",
    descricao:
      "Arte digital profissional para sublimação total, pronta para personalização.",
    destaque: true,
    tags: ["premium", "sublimação", "camisa"],
  },

  {
    id: 2,
    nome: "Arte Pesca Premium",
    categoria: "Pesca",
    preco: 14.90,
    imagem: "/produtos/produto-teste.png",
    descricao:
      "Modelo de arte profissional para camisas de pesca e personalização esportiva.",
    destaque: true,
    tags: ["pesca", "esporte", "camisa"],
  },

  {
    id: 3,
    nome: "Arte Futebol Premium",
    categoria: "Futebol",
    preco: 12.90,
    imagem: "/produtos/produto-teste.png",
    descricao:
      "Modelo de arte esportiva para camisas de futebol e personalização.",
    destaque: true,
    tags: ["futebol", "esporte", "camisa"],
  },

  {
    id: 4,
    nome: "Arte Motocross Premium",
    categoria: "Motocross",
    preco: 16.90,
    imagem: "/produtos/produto-teste.png",
    descricao:
      "Modelo de arte profissional para camisas de motocross e esportes radicais.",
    destaque: true,
    tags: ["motocross", "moto", "esporte"],
  },

  {
    id: 5,
    nome: "Arte Ciclismo Premium",
    categoria: "Ciclismo",
    preco: 15.90,
    imagem: "/produtos/produto-teste.png",
    descricao:
      "Arte digital para camisas de ciclismo e equipes esportivas.",
    destaque: false,
    tags: ["ciclismo", "bike", "esporte"],
  },

  {
    id: 6,
    nome: "Arte Fitness Premium",
    categoria: "Fitness",
    preco: 13.90,
    imagem: "/produtos/produto-teste.png",
    descricao:
      "Arte moderna para camisetas fitness, academias e equipes esportivas.",
    destaque: false,
    tags: ["fitness", "academia", "esporte"],
  },
];
