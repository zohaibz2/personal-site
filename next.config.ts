import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't mis-infer it from a
  // stray lockfile in a parent folder (e.g. C:\Users\hp).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
