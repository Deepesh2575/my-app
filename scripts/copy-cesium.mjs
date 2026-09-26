import { cpSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "cesium", "Build", "Cesium");
const dest = join(root, "public", "cesium");

if (!existsSync(src)) {
  console.warn("[copy-cesium] Cesium build assets not found, skip.");
  process.exit(0);
}

mkdirSync(join(root, "public"), { recursive: true });
cpSync(src, dest, { recursive: true });
console.log("[copy-cesium] Copied Cesium assets to public/cesium");
