import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    viewTransition: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
    webpackBuildWorker: true,
  },
};

export default nextConfig;
