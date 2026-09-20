import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},

  allowedDevOrigins: [
    "*.trycloudflare.com",
    "dale-degrees-largely-spotlight.trycloudflare.com",
  ],

  // Inclui somente os previews PNG no output da Vercel.
  // Os arquivos .rar não entram no bundle da aplicação.
  outputFileTracingIncludes: {
    "/api/preview/**/*": [
      "./arquivos/interclasses/**/*.png",
    ],
  },

  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    return config;
  },
};

export default nextConfig;