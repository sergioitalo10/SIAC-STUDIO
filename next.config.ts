import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},

  allowedDevOrigins: [
    "*.trycloudflare.com",
    "dale-degrees-largely-spotlight.trycloudflare.com",
  ],

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