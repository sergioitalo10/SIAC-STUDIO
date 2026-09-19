export interface Product {
  id: number;
  nome: string;
  categoria: string;
  mascote?: string;
  preco: number;
  imagem: string;
  downloadUrl?: string;
  tags?: string[];
}

export const products: Product[] = [
  // --- MASCARAS / OUTROS ---
  {
    id: 1,
    nome: "Arte Interclasses - Arara Azul",
    categoria: "Interclasses",
    mascote: "Arara",
    preco: 20.0,
    imagem: "/api/preview/interclasses/arara/001-arara-azul/preview.png",
    downloadUrl: "/api/download/interclasses/arara/001-arara-azul/arquivo.rar",
    tags: ["arara", "azul", "interclasses", "escolar"],
  },
  {
    id: 2,
    nome: "Arte Interclasses - Fênix Amarela",
    categoria: "Interclasses",
    mascote: "Fênix",
    preco: 20.0,
    imagem: "/api/preview/interclasses/fenix/001-fenix-amarela/preview.png",
    downloadUrl: "/api/download/interclasses/fenix/001-fenix-amarela/arquivo.rar",
    tags: ["fenix", "amarela", "fogo", "interclasses"],
  },

  // --- LEÕES (7 MODELOS) ---
  {
    id: 3,
    nome: "Arte Interclasses - Leão Tribal Vermelho",
    categoria: "Interclasses",
    mascote: "Leão",
    preco: 20.0,
    imagem: "/api/preview/interclasses/leao/001-leao-tribal-vermelho/preview.png",
    downloadUrl: "/api/download/interclasses/leao/001-leao-tribal-vermelho/arquivo.rar",
    tags: ["leao", "vermelho", "tribal", "interclasses"],
  },
  {
    id: 8,
    nome: "Arte Interclasses - Leão Tribal Cítrico",
    categoria: "Interclasses",
    mascote: "Leão",
    preco: 20.0,
    imagem: "/api/preview/interclasses/leao/002-leao-tribal-citrico/preview.png",
    downloadUrl: "/api/download/interclasses/leao/002-leao-tribal-citrico/arquivo.rar",
    tags: ["leao", "citrico", "verde", "interclasses"],
  },
  {
    id: 9,
    nome: "Arte Interclasses - Leão Tribal Roxo",
    categoria: "Interclasses",
    mascote: "Leão",
    preco: 20.0,
    imagem: "/api/preview/interclasses/leao/003-leao-tribal-roxo/preview.png",
    downloadUrl: "/api/download/interclasses/leao/003-leao-tribal-roxo/arquivo.rar",
    tags: ["leao", "roxo", "interclasses"],
  },
  {
    id: 10,
    nome: "Arte Interclasses - Leão Tribal Pink",
    categoria: "Interclasses",
    mascote: "Leão",
    preco: 20.0,
    imagem: "/api/preview/interclasses/leao/004-leao-tribal-pink/preview.png",
    downloadUrl: "/api/download/interclasses/leao/004-leao-tribal-pink/arquivo.rar",
    tags: ["leao", "pink", "rosa", "interclasses"],
  },
  {
    id: 11,
    nome: "Arte Interclasses - Leão Tribal Verde Água",
    categoria: "Interclasses",
    mascote: "Leão",
    preco: 20.0,
    imagem: "/api/preview/interclasses/leao/005-leao-tribal-verde-agua/preview.png",
    downloadUrl: "/api/download/interclasses/leao/005-leao-tribal-verde-agua/arquivo.rar",
    tags: ["leao", "verde agua", "interclasses"],
  },
  {
    id: 12,
    nome: "Arte Interclasses - Leão Tribal Gelo",
    categoria: "Interclasses",
    mascote: "Leão",
    preco: 20.0,
    imagem: "/api/preview/interclasses/leao/006-leao-tribal-gelo/preview.png",
    downloadUrl: "/api/download/interclasses/leao/006-leao-tribal-gelo/arquivo.rar",
    tags: ["leao", "gelo", "cinza", "interclasses"],
  },
  {
    id: 13,
    nome: "Arte Interclasses - Leão Tribal Laranja",
    categoria: "Interclasses",
    mascote: "Leão",
    preco: 20.0,
    imagem: "/api/preview/interclasses/leao/007-leao-tribal-laranja/preview.png",
    downloadUrl: "/api/download/interclasses/leao/007-leao-tribal-laranja/arquivo.rar",
    tags: ["leao", "laranja", "interclasses"],
  },

  // --- TIGRES (4 MODELOS) ---
  {
    id: 14,
    nome: "Arte Interclasses - Tigre Amarelo e Preto",
    categoria: "Interclasses",
    mascote: "Tigre",
    preco: 20.0,
    imagem: "/api/preview/interclasses/tigre/001-tigre-amarelo-preto/preview.png",
    downloadUrl: "/api/download/interclasses/tigre/001-tigre-amarelo-preto/arquivo.rar",
    tags: ["tigre", "amarelo", "preto", "interclasses"],
  },
  {
    id: 15,
    nome: "Arte Interclasses - Tigre Vermelho e Laranja",
    categoria: "Interclasses",
    mascote: "Tigre",
    preco: 20.0,
    imagem: "/api/preview/interclasses/tigre/002-tigre-vermelho-preto-laranja/preview.png",
    downloadUrl: "/api/download/interclasses/tigre/002-tigre-vermelho-preto-laranja/arquivo.rar",
    tags: ["tigre", "vermelho", "laranja", "interclasses"],
  },
  {
    id: 16,
    nome: "Arte Interclasses - Tigre Tons de Verde",
    categoria: "Interclasses",
    mascote: "Tigre",
    preco: 20.0,
    imagem: "/api/preview/interclasses/tigre/003-tigre-tons-de-verde/preview.png",
    downloadUrl: "/api/download/interclasses/tigre/003-tigre-tons-de-verde/arquivo.rar",
    tags: ["tigre", "verde", "interclasses"],
  },
  {
    id: 17,
    nome: "Arte Interclasses - Tigre Branco",
    categoria: "Interclasses",
    mascote: "Tigre",
    preco: 20.0,
    imagem: "/api/preview/interclasses/tigre/004-tigre-branco/preview.png",
    downloadUrl: "/api/download/interclasses/tigre/004-tigre-branco/arquivo.rar",
    tags: ["tigre", "branco", "gelo", "interclasses"],
  },

  // --- PANTERAS (NOVOS MODELOS) ---
  {
    id: 18,
    nome: "Arte Interclasses - Pantera Negra",
    categoria: "Interclasses",
    mascote: "Pantera",
    preco: 20.0,
    imagem: "/api/preview/interclasses/pantera/001-pantera-negra/preview.png",
    downloadUrl: "/api/download/interclasses/pantera/001-pantera-negra/arquivo.rar",
    tags: ["pantera", "negra", "preta", "interclasses"],
  },
  {
    id: 19,
    nome: "Arte Interclasses - Pantera Roxa",
    categoria: "Interclasses",
    mascote: "Pantera",
    preco: 20.0,
    imagem: "/api/preview/interclasses/pantera/002-pantera-roxa/preview.png",
    downloadUrl: "/api/download/interclasses/pantera/002-pantera-roxa/arquivo.rar",
    tags: ["pantera", "roxa", "interclasses"],
  },

  // --- OUTROS MASCOTES ---
  {
    id: 4,
    nome: "Arte Interclasses - Onça Bege",
    categoria: "Interclasses",
    mascote: "Onça",
    preco: 20.0,
    imagem: "/api/preview/interclasses/onca/001-onca-bege/preview.png",
    downloadUrl: "/api/download/interclasses/onca/001-onca-bege/arquivo.rar",
    tags: ["onca", "bege", "interclasses"],
  },
  {
    id: 5,
    nome: "Arte Interclasses - Dragão Raio Roxo",
    categoria: "Interclasses",
    mascote: "Dragão",
    preco: 20.0,
    imagem: "/api/preview/interclasses/dragao/001-dragao-raio-roxo/preview.png",
    downloadUrl: "/api/download/interclasses/dragao/001-dragao-raio-roxo/arquivo.rar",
    tags: ["dragao", "roxo", "raio", "interclasses"],
  },
  {
    id: 6,
    nome: "Arte Interclasses - Lince de Gelo",
    categoria: "Interclasses",
    mascote: "Lince",
    preco: 20.0,
    imagem: "/api/preview/interclasses/lince/001-lince-gelo/preview.png",
    downloadUrl: "/api/download/interclasses/lince/001-lince-gelo/arquivo.rar",
    tags: ["lince", "gelo", "azul", "interclasses"],
  },
];