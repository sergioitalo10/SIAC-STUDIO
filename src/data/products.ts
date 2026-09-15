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
  arquivo: string; // <-- Obrigatório
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
    imagem: "/produtos/interclasses/onca/001-onca-bege/preview.png",
    descricao: "Arte digital profissional para sublimação total, pronta para personalização.",
    destaque: true,
    tags: ["onça", "interclasses", "esporte", "camisa"],
    tipoProduto: "digital",
    formato: "RAR",
    arquivo: "/produtos/interclasses/onca/001-onca-bege/onca-bege.rar",
    tamanho: "20,3 MB",
  },
  {
    id: 2,
    nome: "Dragão Raio Roxo",
    categoria: "Interclasses",
    mascote: "Dragão",
    modelo: "001-DRAGAO-RAIO-ROXO",
    preco: 19.99,
    imagem: "/produtos/interclasses/dragao/001-dragao-raio-roxo/preview.png",
    descricao: "Arte digital profissional para sublimação total, pronta para personalização.",
    destaque: true,
    tags: ["dragão", "interclasses", "esporte", "camisa"],
    tipoProduto: "digital",
    formato: "RAR",
    arquivo: "dragao-raio-roxo.rar",
    tamanho: "280 MB",
  },
  {
    id: 3,
    nome: "Leão Tribal Vermelho",
    categoria: "Interclasses",
    mascote: "Leão",
    modelo: "001-LEAO-TRIBAL-VERMELHO",
    preco: 19.99,
    imagem: "/produtos/interclasses/leao/001-leao-tribal-vermelho/preview.png",
    descricao: "Arte digital profissional para sublimação total, pronta para personalização.",
    destaque: true,
    tags: ["leão", "interclasses", "esporte", "camisa"],
    tipoProduto: "digital",
    formato: "RAR",
    arquivo: "leao-tribal-vermelho.rar",
    tamanho: "220 MB",
  },
  {
  id: 4,
  nome: "Lince de Gelo",
  categoria: "Interclasses",
  mascote: "Lince",
  modelo: "001-LINCE-GELO",
  preco: 19.99,
  imagem: "/produtos/interclasses/lince/001-lince-gelo/preview.png",
  descricao: "Arte digital profissional para sublimação total...",
  tipoProduto: "digital",
  formato: "RAR",
  arquivo: "/produtos/interclasses/lince/001-lince-gelo/lince-gelo.rar", // <--- O arquivo .rar correto do lince
  tamanho: "250 MB",
  },
  {
    id: 5,
    nome: "Arte Motocross Premium",
    categoria: "Motocross",
    modelo: "001-MOTOCROSS-PREMIUM",
    preco: 16.90,
    imagem: "/produtos/motocross/001-motocross-premium/preview.png",
    descricao: "Modelo de arte profissional para camisas de motocross e esportes radicais.",
    destaque: true,
    tags: ["motocross", "moto", "esporte"],
    tipoProduto: "digital",
    formato: "RAR",
    arquivo: "motocross-premium.rar",
    tamanho: "310 MB",
  },
  {
    id: 6,
    nome: "Arte Ciclismo Premium",
    categoria: "Ciclismo",
    modelo: "001-CICLISMO-PREMIUM",
    preco: 15.90,
    imagem: "/produtos/ciclismo/001-ciclismo-premium/preview.png",
    descricao: "Arte digital para camisas de ciclismo e equipes esportivas.",
    destaque: false,
    tags: ["ciclismo", "bike", "esporte"],
    tipoProduto: "digital",
    formato: "RAR",
    arquivo: "ciclismo-premium.rar",
    tamanho: "240 MB",
  },
  {
    id: 7,
    nome: "Arte Fitness Premium",
    categoria: "Fitness",
    modelo: "001-FITNESS-PREMIUM",
    preco: 13.90,
    imagem: "/produtos/fitness/001-fitness-premium/preview.png",
    descricao: "Arte moderna para camisetas fitness, academias e equipes esportivas.",
    destaque: false,
    tags: ["fitness", "academia", "esporte"],
    tipoProduto: "digital",
    formato: "RAR",
    arquivo: "fitness-premium.rar",
    tamanho: "210 MB",
  },
];