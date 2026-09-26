import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.56.1", "192.168.12.59"],
  transpilePackages: ["cesium"],
};

export default nextConfig;
