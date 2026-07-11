import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "onnxruntime-node"],
  // transformers.js / onnxruntime may pull optional node bindings; keep client WASM path clean
  turbopack: {},
};

export default nextConfig;
