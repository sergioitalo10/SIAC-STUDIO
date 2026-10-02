import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://siac-studio.vercel.app";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/carrinho`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/minha-conta`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/area-designer`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/area-designer/cadastro`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/area-designer/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/area-designer/gabarito`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/area-designer/upload`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/area-designer/termos`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // Produtos — gera automaticamente uma entrada para cada produto estático
  const produtos = [
    "/produto/aracuaia",
    "/produto/arara-azul",
    "/produto/arara-vermelha",
    "/produto/cobra",
    "/produto/coringa-gangster",
    "/produto/coringa-gangster-light",
    "/produto/dragao-raio-roxo",
    "/produto/dragao-dourado-preto",
    "/produto/escopiao",
    "/produto/fenix-amarela",
    "/produto/fenix-verde-limao",
    "/produto/grifo-dourado",
    "/produto/kraken-azul",
    "/produto/kraken-pink-roxo",
    "/produto/leao-tribal-vermelho",
    "/produto/leao-tribal-citrico",
    "/produto/lince-gelo",
    "/produto/lince-vermelho",
    "/produto/onca-bege",
    "/produto/pantera-roxa",
    "/produto/pantera-laranja",
    "/produto/raposa-fogo",
    "/produto/raposa-gelo",
    "/produto/taz-mania",
    "/produto/tigre-amarelo-preto",
    "/produto/tigre-vermelho-preto-laranja",
    "/produto/venom-dark",
    "/produto/zeus",
  ];

  const productPages: MetadataRoute.Sitemap = produtos.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...productPages];
}
