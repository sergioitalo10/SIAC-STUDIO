/** @type {import('next').NextConfig} */
const nextConfig = {
  // Adicionado para resolver o conflito com o Turbopack na Vercel
  turbopack: {},

  // Libera a requisição cross-origin para qualquer túnel do Cloudflare no Next.js
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "dale-degrees-largely-spotlight.trycloudflare.com",
  ],

  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Impede o cliente de tentar reconectar o WebSocket pelo túnel da Cloudflare
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;