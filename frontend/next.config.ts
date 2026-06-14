import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this app (there are lockfiles above this dir).
  turbopack: {
    root: path.join(__dirname),
  },
  output: "standalone",
};

export default nextConfig;
