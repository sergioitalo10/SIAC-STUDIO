export type Product = {
  id: number;
  nome: string;
  categoria: string;
  mascote?: string;
  modelo?: string;
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
    nome: "Onça Bege",
    categoria: "Interclasses",
    mascote: "Onça",
    modelo: "001-ONCA-BEGE",
    preco: 19.90,
    imagem:
      "/produtos/INTERCLASSES/ONÇA/001-ONCA-BEGE/preview.png",
    descricao:
      "Arte digital profissional para sublimação total, pronta para personalização.",
    destaque: true,
    tags: ["onça", "interclasses", "esporte", "camisa"],
    tipoProduto: "digital",
    formato: "RAR",
    arquivo:
      "INTERCLASSES/ONÇA/001-ONCA-BEGE/arquivo.rar",
    tamanho: "20,3 MB",
  },

  {
    id: 2,
    nome: "Dragão Preto e Branco",
    categoria: "Interclasses",
    preco: 19.99,
    imagem: "/produtos/Dragão 1.png",
    descricao:
      "Arte digital profissional para sublimação total, pronta para personalização.",
    destaque: true,
    tags: ["dragão", "interclasses", "esporte", "camisa"],
    tipoProduto: "digital",
    formato: "RAR",
    arquivo: "arte-modelo-premium.zip",
    tamanho: "280 MB",
  },

  {
    id: 3,
    nome: "Leão Tribal Vermelho",
    categoria: "Interclasses",
    preco: 19.99,
    imagem: "/produtos/Leão Tribal Vermehlo.png",
    descricao:
      "Arte digital profissional para sublimação total, pronta para personalização.",
    destaque: true,
    tags: ["leão", "interclasses", "esporte", "camisa"],
    tipoProduto: "digital",
    formato: "RAR",
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