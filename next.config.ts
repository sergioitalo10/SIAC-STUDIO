/** @type {import('next').NextConfig} */
const nextConfig = {
  // Libera a requisição cross-origin para qualquer túnel do Cloudflare no Next.js
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "dale-degrees-largely-spotlight.trycloudflare.com",
  ],
  // Desativa os indicadores de dev que tentam abrir conexões HMR pelo túnel
  devIndicators: {
    buildActivity: false,
  },
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