export interface Product {
  id: number;
  nome: string;
  categoria: string | string[];
  mascote?: string;
  preco: number;
  imagem: string;
  downloadUrl?: string;
  tags?: string[];

  descricao?: string;
  formato?: string;
  tamanho?: string;

  // Campos para produtos de designers colaboradores
  designerId?: number;
  designerNome?: string;
  designerArtworkId?: number;
}

export const products: Product[] = [
  // 42 - Raposa Laranja
  {
    id: 42,
    nome: "Raposa Laranja",
    categoria: "Interclasses",
    mascote: "Raposa",
    preco: 20.0,
    imagem: "/interclasses/raposa/003-raposa-laranja/preview.png",
    downloadUrl: "/api/download/interclasses/raposa/003-raposa-laranja/arquivo.rar",
    tags: ["raposa", "laranja", "interclasses"],
  },
  // 41 - Raposa Azul
  {
    id: 41,
    nome: "Raposa Azul",
    categoria: "Interclasses",
    mascote: "Raposa",
    preco: 20.0,
    imagem: "/interclasses/raposa/002-raposa-azul/preview.png",
    downloadUrl: "/api/download/interclasses/raposa/002-raposa-azul/arquivo.rar",
    tags: ["raposa", "azul", "interclasses"],
  },
  // 40 - Raposa Laranja Branco
  {
    id: 40,
    nome: "Raposa Laranja Branco",
    categoria: "Interclasses",
    mascote: "Raposa",
    preco: 20.0,
    imagem: "/interclasses/raposa/001-raposa-laranja-branco/preview.png",
    downloadUrl: "/api/download/interclasses/raposa/001-raposa-laranja-branco/arquivo.rar",
    tags: ["raposa", "laranja", "branco", "interclasses"],
  },
  // 39 - Pantera Azul Preto
  {
    id: 39,
    nome: "Pantera Azul Preto",
    categoria: "Interclasses",
    mascote: "Pantera",
    preco: 20.0,
    imagem: "/interclasses/pantera/004-pantera-azul-preto/preview.png",
    downloadUrl: "/api/download/interclasses/pantera/004-pantera-azul-preto/arquivo.rar",
    tags: ["pantera", "azul", "preto", "interclasses"],
  },
  // 38 - Dragão Verde Limão
  {
    id: 38,
    nome: "Dragão Verde Limão",
    categoria: "Interclasses",
    mascote: "Dragão",
    preco: 20.0,
    imagem: "/interclasses/dragao/004-dragao-verde-limao/preview.png",
    downloadUrl: "/api/download/interclasses/dragao/004-dragao-verde-limao/arquivo.rar",
    tags: ["dragao", "verde", "limao", "interclasses"],
  },
  // 37 - Javali
  {
    id: 37,
    nome: "Javali",
    categoria: "Interclasses",
    mascote: "Javali",
    preco: 20.0,
    imagem: "/interclasses/javali/preview.png",
    downloadUrl: "/api/download/interclasses/javali/arquivo.rar",
    tags: ["javali", "interclasses"],
  },
  // 36 - Dragão Preto e Branco
  {
    id: 36,
    nome: "Dragão Preto e Branco",
    categoria: "Interclasses",
    mascote: "Dragão",
    preco: 20.0,
    imagem: "/interclasses/dragao/005-dragao-preto-branco/preview.png",
    downloadUrl: "/api/download/interclasses/dragao/005-dragao-preto-branco/arquivo.rar",
    tags: ["dragao", "preto", "branco", "interclasses"],
  },
  // 35 - Cobra Flor Rosa
  {
    id: 35,
    nome: "Cobra Flor Rosa",
    categoria: "Interclasses",
    mascote: "Cobra",
    preco: 20.0,
    imagem: "/interclasses/cobra/002-cobra-flor-rosa/preview.png",
    downloadUrl: "/api/download/interclasses/cobra/002-cobra-flor-rosa/arquivo.rar",
    tags: ["cobra", "flor", "rosa", "interclasses"],
  },
  // 34 - Cobra Flor Vermelha
  {
    id: 34,
    nome: "Cobra Flor Vermelha",
    categoria: "Interclasses",
    mascote: "Cobra",
    preco: 20.0,
    imagem: "/interclasses/cobra/001-cobra-flor-vermelha/preview.png",
    downloadUrl: "/api/download/interclasses/cobra/001-cobra-flor-vermelha/arquivo.rar",
    tags: ["cobra", "flor", "vermelha", "interclasses"],
  },
  // 33 - Kraken Pink Roxo
  {
    id: 33,
    nome: "Kraken Pink Roxo",
    categoria: ["Interclasses", "Lançamentos"],
    mascote: "Kraken",
    preco: 20.0,
    imagem: "/interclasses/kraken/002-kraken-pink-roxo/preview.png",
    downloadUrl: "/api/download/interclasses/kraken/002-kraken-pink-roxo/arquivo.rar",
    tags: ["kraken", "sublimação total", "interclasses", "pink", "roxo", "jogos internos"],
  },
  // 32 - Kraken Azul
  {
    id: 32,
    nome: "Kraken Azul",
    categoria: ["Interclasses", "Lançamentos"],
    mascote: "Kraken",
    preco: 20.0,
    imagem: "/interclasses/kraken/001-kraken-azul/preview.png",
    downloadUrl: "/api/download/interclasses/kraken/001-kraken/arquivo.rar",
    tags: ["kraken", "sublimação total", "interclasses", "azul", "camisa jogos"],
  },
  // 31 - Dragão Dourado Branco
  {
    id: 31,
    nome: "Dragão Dourado Branco",
    categoria: "Interclasses",
    mascote: "Dragão",
    preco: 20.0,
    imagem: "/interclasses/dragao/003-dragao-dourado-branco/preview.png",
    downloadUrl: "/api/download/interclasses/dragao/002-dragao-douradorq/arquivo.rar",
    tags: ["dourados", "sublimação total", "interclasses", "dragão", "camisa jogos"],
  },
  // 30 - Dragão Dourado
  {
    id: 30,
    nome: "Dragão Dourado",
    categoria: "Interclasses",
    mascote: "Dragão",
    preco: 20.0,
    imagem: "/interclasses/dragao/002-dragao-dourado-preto/preview.png",
    downloadUrl: "/api/download/interclasses/dragao/002-dragao-dourado-preto/arquivo.rar",
    tags: ["dourados", "sublimação total", "interclasses", "dragão", "camisa jogos"],
  },
  // 29 - Lince Verde Água
  {
    id: 29,
    nome: "Lince Verde Água",
    categoria: "Interclasses",
    mascote: "Lince",
    preco: 20.0,
    imagem: "/interclasses/lince/003-lince-verde-agua/preview.png",
    downloadUrl: "/api/download/interclasses/lince/003-lince-verde-agua/arquivo.rar",
    tags: ["lince", "verde agua", "camisa jogos", "sublimação total", "interclasses"],
  },
  // 28 - Lince Vermelho
  {
    id: 28,
    nome: "Lince Vermelho",
    categoria: "Interclasses",
    mascote: "Lince",
    preco: 20.0,
    imagem: "/interclasses/lince/002-lince-vermelho/preview.png",
    downloadUrl: "/api/download/interclasses/lince/002-lince-vermelho/arquivo.rar",
    tags: ["lince", "vermelho", "camisa jogos", "interclasses", "sublimação total"],
  },
  // 27 - Fênix Pink Chumbo
  {
    id: 27,
    nome: "Fênix Pink Chumbo",
    categoria: "Interclasses",
    mascote: "Fênix",
    preco: 20.0,
    imagem: "/interclasses/fenix/003-fenix-pink-chumbo/preview.png",
    downloadUrl: "/api/download/interclasses/fenix/003-fenix-pink-chumbo/arquivo.rar",
    tags: ["fenix", "pink chumbo", "interclasses", "camisa de jogos", "jogos internos"],
  },
  // 26 - Fênix Verde Limão
  {
    id: 26,
    nome: "Fênix Verde Limão",
    categoria: "Interclasses",
    mascote: "Fênix",
    preco: 20.0,
    imagem: "/interclasses/fenix/002-fenix-verde-limao/preview.png",
    downloadUrl: "/api/download/interclasses/fenix/002-fenix-verde-limao/arquivo.rar",
    tags: ["fenix", "verde limao", "interclasses", "camisa de jogos", "jogos internos"],
  },
  // 25 - Fênix Amarela
  {
    id: 25,
    nome: "Fênix Amarela",
    categoria: "Interclasses",
    mascote: "Fênix",
    preco: 20.0,
    imagem: "/interclasses/fenix/001-fenix-amarela/preview.png",
    downloadUrl: "/api/download/interclasses/fenix/001-fenix-amarela/arquivo.rar",
    tags: ["fenix", "amarelo", "interclasses", "camisa jogos"],
  },
  // 24 - Venom Dark
  {
    id: 24,
    nome: "Venom Dark",
    categoria: "Interclasses",
    mascote: "Venom",
    preco: 20.0,
    imagem: "/interclasses/venom/001-venom-dark/preview.png",
    downloadUrl: "/api/download/interclasses/venom/001-venom-dark/arquivo.rar",
    tags: ["venom", "dark", "interclasses"],
  },
  // 23 - Grifo Dourado
  {
    id: 23,
    nome: "Grifo Dourado",
    categoria: "Interclasses",
    mascote: "Grifo",
    preco: 20.0,
    imagem: "/interclasses/grifo/001-grifo-dourado/preview.png",
    downloadUrl: "/api/download/interclasses/grifo/001-grifo-dourado/arquivo.rar",
    tags: ["grifo", "dourado", "interclasses"],
  },
  // 22 - Coringa Gangster Light
  {
    id: 22,
    nome: "Coringa Gangster Light",
    categoria: "Interclasses",
    mascote: "Coringa",
    preco: 20.0,
    imagem: "/interclasses/coringa/002-coringa-gangster-light/preview.png",
    downloadUrl: "/api/download/interclasses/coringa/002-coringa-gangster-light/arquivo.rar",
    tags: ["coringa", "branco", "camisas jogos", "interclasses"],
  },
  // 21 - Coringa Gangster
  {
    id: 21,
    nome: "Coringa Gangster",
    categoria: "Interclasses",
    mascote: "Coringa",
    preco: 20.0,
    imagem: "/interclasses/coringa/001-coringa-gangster/preview.png",
    downloadUrl: "/api/download/interclasses/coringa/001-coringa-gangster/arquivo.rar",
    tags: ["coringa", "gelo", "azul", "interclasses"],
  },
  // 20 - Pantera Rainbow
  {
    id: 20,
    nome: "Pantera Rainbow",
    categoria: "Interclasses",
    mascote: "Pantera",
    preco: 20.0,
    imagem: "/interclasses/pantera/003-pantera-rainbow/preview.png",
    downloadUrl: "/api/download/interclasses/pantera/003-pantera-rainbow/arquivo.rar",
    tags: ["pantera", "rainbow", "interclasses"],
  },
  // 19 - Pantera Laranja
  {
    id: 19,
    nome: "Pantera Laranja",
    categoria: "Interclasses",
    mascote: "Pantera",
    preco: 20.0,
    imagem: "/interclasses/pantera/002-pantera-laranja/preview.png",
    downloadUrl: "/api/download/interclasses/pantera/002-pantera-laranja/arquivo.rar",
    tags: ["pantera", "laranja", "roxa", "interclasses"],
  },
  // 18 - Pantera Roxa
  {
    id: 18,
    nome: "Pantera roxa",
    categoria: "Interclasses",
    mascote: "Pantera",
    preco: 20.0,
    imagem: "/interclasses/pantera/001-pantera-roxa/preview.png",
    downloadUrl: "/api/download/interclasses/pantera/001-pantera-roxa/arquivo.rar",
    tags: ["pantera", "roxa", "interclasses"],
  },
  // 17 - Tigre Branco
  {
    id: 17,
    nome: "Tigre Branco",
    categoria: "Interclasses",
    mascote: "Tigre",
    preco: 20.0,
    imagem: "/interclasses/tigre/004-tigre-branco/preview.png",
    downloadUrl: "/api/download/interclasses/tigre/004-tigre-branco/arquivo.rar",
    tags: ["tigre", "branco", "gelo", "interclasses"],
  },
  // 16 - Tigre Tons de Verde
  {
    id: 16,
    nome: "Tigre Tons de Verde",
    categoria: "Interclasses",
    mascote: "Tigre",
    preco: 20.0,
    imagem: "/interclasses/tigre/003-tigre-tons-de-verde/preview.png",
    downloadUrl: "/api/download/interclasses/tigre/003-tigre-tons-de-verde/arquivo.rar",
    tags: ["tigre", "verde", "interclasses"],
  },
  // 15 - Tigre Vermelho e Laranja
  {
    id: 15,
    nome: "Tigre Vermelho e Laranja",
    categoria: "Interclasses",
    mascote: "Tigre",
    preco: 20.0,
    imagem: "/interclasses/tigre/002-tigre-vermelho-preto-laranja/preview.png",
    downloadUrl: "/api/download/interclasses/tigre/002-tigre-vermelho-preto-laranja/arquivo.rar",
    tags: ["tigre", "vermelho", "laranja", "interclasses"],
  },
  // 14 - Tigre Amarelo e Preto
  {
    id: 14,
    nome: "Tigre Amarelo e Preto",
    categoria: "Interclasses",
    mascote: "Tigre",
    preco: 20.0,
    imagem: "/interclasses/tigre/001-tigre-amarelo-preto/preview.png",
    downloadUrl: "/api/download/interclasses/tigre/001-tigre-amarelo-preto/arquivo.rar",
    tags: ["tigre", "amarelo", "preto", "interclasses"],
  },
  // 13 - Leão Tribal Laranja
  {
    id: 13,
    nome: "Leão Tribal Laranja",
    categoria: "Interclasses",
    mascote: "Leão",
    preco: 20.0,
    imagem: "/interclasses/leao/007-leao-tribal-laranja/preview.png",
    downloadUrl: "/api/download/interclasses/leao/007-leao-tribal-laranja/arquivo.rar",
    tags: ["leao", "laranja", "interclasses"],
  },
  // 12 - Leão Tribal Gelo
  {
    id: 12,
    nome: "Leão Tribal Gelo",
    categoria: "Interclasses",
    mascote: "Leão",
    preco: 20.0,
    imagem: "/interclasses/leao/006-leao-tribal-gelo/preview.png",
    downloadUrl: "/api/download/interclasses/leao/006-leao-tribal-gelo/arquivo.rar",
    tags: ["leao", "gelo", "cinza", "interclasses"],
  },
  // 11 - Leão Tribal Verde Água
  {
    id: 11,
    nome: "Leão Tribal Verde Água",
    categoria: "Interclasses",
    mascote: "Leão",
    preco: 20.0,
    imagem: "/interclasses/leao/005-leao-tribal-verde-agua/preview.png",
    downloadUrl: "/api/download/interclasses/leao/005-leao-tribal-verde-agua/arquivo.rar",
    tags: ["leao", "verde agua", "interclasses"],
  },
  // 10 - Leão Tribal Pink
  {
    id: 10,
    nome: "Leão Tribal Pink",
    categoria: "Interclasses",
    mascote: "Leão",
    preco: 20.0,
    imagem: "/interclasses/leao/004-leao-tribal-pink/preview.png",
    downloadUrl: "/api/download/interclasses/leao/004-leao-tribal-pink/arquivo.rar",
    tags: ["leao", "pink", "rosa", "interclasses"],
  },
  // 9 - Leão Tribal Roxo
  {
    id: 9,
    nome: "Leão Tribal Roxo",
    categoria: "Interclasses",
    mascote: "Leão",
    preco: 20.0,
    imagem: "/interclasses/leao/003-leao-tribal-roxo/preview.png",
    downloadUrl: "/api/download/interclasses/leao/003-leao-tribal-roxo/arquivo.rar",
    tags: ["leao", "roxo", "interclasses"],
  },
  // 8 - Leão Tribal Cítrico
  {
    id: 8,
    nome: "Leão Tribal Cítrico",
    categoria: "Interclasses",
    mascote: "Leão",
    preco: 20.0,
    imagem: "/interclasses/leao/002-leao-tribal-citrico/preview.png",
    downloadUrl: "/api/download/interclasses/leao/002-leao-tribal-citrico/arquivo.rar",
    tags: ["leao", "citrico", "verde", "interclasses"],
  },
  // 6 - Lince de Gelo
  {
    id: 6,
    nome: "Lince de Gelo",
    categoria: "Interclasses",
    mascote: "Lince",
    preco: 20.0,
    imagem: "/interclasses/lince/001-lince-gelo/preview.png",
    downloadUrl: "/api/download/interclasses/lince/001-lince-gelo/arquivo.rar",
    tags: ["lince", "gelo", "azul", "interclasses"],
  },
  // 5 - Dragão Raio Roxo
  {
    id: 5,
    nome: "Dragão Raio Roxo",
    categoria: "Interclasses",
    mascote: "Dragão",
    preco: 20.0,
    imagem: "/interclasses/dragao/001-dragao-raio-roxo/preview.png",
    downloadUrl: "/api/download/interclasses/dragao/001-dragao-raio-roxo/arquivo.rar",
    tags: ["dragao", "roxo", "raio", "interclasses"],
  },
  // 4 - Onça Bege
  {
    id: 4,
    nome: "Onça Bege",
    categoria: "Interclasses",
    mascote: "Onça",
    preco: 20.0,
    imagem: "/interclasses/onca/001-onca-bege/preview.png",
    downloadUrl: "/api/download/interclasses/onca/001-onca-bege/arquivo.rar",
    tags: ["onca", "bege", "interclasses"],
  },
  // 3 - Leão Tribal Vermelho
  {
    id: 3,
    nome: "Leão Tribal Vermelho",
    categoria: "Interclasses",
    mascote: "Leão",
    preco: 20.0,
    imagem: "/interclasses/leao/001-leao-tribal-vermelho/preview.png",
    downloadUrl: "/api/download/interclasses/leao/001-leao-tribal-vermelho/arquivo.rar",
    tags: ["leao", "vermelho", "tribal", "interclasses"],
  },
  // 2 - Arara Vermelha
  {
    id: 2,
    nome: "Arara Vermelha",
    categoria: ["Interclasses", "Lançamentos"],
    mascote: "Fênix",
    preco: 20.0,
    imagem: "/interclasses/arara/002-arara-vermelha/preview.png",
    downloadUrl: "/api/download/interclasses/arara/002-arara-vermelha/arquivo.rar",
    tags: ["fenix", "amarela", "fogo", "interclasses"],
  },
  // 1 - Arara Azul
  {
    id: 1,
    nome: "Arara Azul",
    categoria: "Interclasses",
    mascote: "Arara",
    preco: 20.0,
    imagem: "/interclasses/arara/001-arara-azul/preview.png",
    downloadUrl: "/api/download/interclasses/arara/001-arara-azul/arquivo.rar",
    tags: ["arara", "azul", "interclasses", "escolar"],
  },
];
