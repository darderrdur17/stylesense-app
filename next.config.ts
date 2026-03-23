import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Avoid picking ~/package-lock.json when multiple lockfiles exist on the machine
  turbopack: {
    root: appDir,
  },
};

export default nextConfig;
