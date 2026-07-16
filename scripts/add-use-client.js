import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const distDir = new URL("../dist", import.meta.url).pathname;

const clientFiles = ["index.js", "provider.js", ...readdirSync(distDir).filter((f) => f.startsWith("chunk-") && f.endsWith(".js"))];

for (const file of clientFiles) {
  const filePath = join(distDir, file);
  const content = readFileSync(filePath, "utf8");
  if (!content.startsWith('"use client"')) {
    writeFileSync(filePath, `"use client";\n${content}`);
  }
}
