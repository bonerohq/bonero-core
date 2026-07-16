import { defineConfig } from "tsup";

const shared = {
  format: ["esm"] as const,
  dts: true,
  sourcemap: true,
  external: ["react", "react-dom", "@tanstack/react-query", "nuqs", "next", "next/script", "server-only"],
  treeshake: true,
};

export default defineConfig([
  {
    ...shared,
    entry: ["src/server.ts"],
    clean: true,
  },
  {
    ...shared,
    entry: ["src/index.ts", "src/provider.ts"],
    clean: false,
    banner: { js: '"use client"' },
  },
]);
