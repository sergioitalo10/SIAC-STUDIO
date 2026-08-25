export type Product = {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  imagem: string;
  descricao: string;
  destaque?: boolean;
  tags?: string[];

  tipoProduto: "digital";
  formato: string;
  arquivo: string;
  tamanho: string;
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
    tipoProduto: "digital",
    formato: "ZIP",
    arquivo: "arte-modelo-premium.zip",
    tamanho: "250 MB",
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
    tipoProduto: "digital",
    formato: "ZIP",
    arquivo: "arte-pesca-premium.zip",
    tamanho: "280 MB",
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
    tipoProduto: "digital",
    formato: "ZIP",
    arquivo: "arte-futebol-premium.zip",
    tamanho: "220 MB",
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
    tipoProduto: "digital",
    formato: "ZIP",
    arquivo: "arte-motocross-premium.zip",
    tamanho: "310 MB",
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
    tipoProduto: "digital",
    formato: "ZIP",
    arquivo: "arte-ciclismo-premium.zip",
    tamanho: "240 MB",
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
    tipoProduto: "digital",
    formato: "ZIP",
    arquivo: "arte-fitness-premium.zip",
    tamanho: "210 MB",
  },
];