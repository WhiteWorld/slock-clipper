import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const extensionDir = join(root, "extension");
const distDir = join(extensionDir, "dist");

mkdirSync(distDir, { recursive: true });

for (const file of ["manifest.json", "popup.html", "options.html", "styles.css"]) {
  copyFileSync(join(extensionDir, file), join(distDir, file));
}

const iconsSrc = join(extensionDir, "icons");
const iconsDest = join(distDir, "icons");
mkdirSync(iconsDest, { recursive: true });
for (const file of readdirSync(iconsSrc)) {
  copyFileSync(join(iconsSrc, file), join(iconsDest, file));
}
