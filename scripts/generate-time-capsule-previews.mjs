import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import heicConvert from "heic-convert";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const sourceDir = path.join(rootDir, "src/pages/time-capsule/zone-photos");
const previewDir = path.join(rootDir, "src/pages/time-capsule/zone-photos-previews");

const supportedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".heic", ".heif"]);

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }

    if (entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files;
};

const main = async () => {
  await fs.rm(previewDir, { recursive: true, force: true });
  await fs.mkdir(previewDir, { recursive: true });

  const files = await walk(sourceDir);
  let generated = 0;
  let skipped = 0;

  for (const file of files) {
    const relativePath = path.relative(sourceDir, file);
    const targetPath = path.join(
      previewDir,
      relativePath.replace(/\.[^.]+$/, ".webp")
    );

    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    try {
      const extension = path.extname(file).toLowerCase();
      const inputBuffer = extension === ".heic" || extension === ".heif"
        ? await heicConvert({
          buffer: await fs.readFile(file),
          format: "JPEG",
          quality: 0.9,
        })
        : file;

      await sharp(inputBuffer)
        .resize({ width: 720, height: 720, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 48, effort: 4 })
        .toFile(targetPath);

      generated += 1;
      console.log(`preview: ${relativePath} -> ${path.relative(rootDir, targetPath)}`);
    } catch (error) {
      skipped += 1;
      console.warn(`skip: ${relativePath} (${error instanceof Error ? error.message : String(error)})`);
    }
  }

  console.log(`done: generated ${generated} previews, skipped ${skipped}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});