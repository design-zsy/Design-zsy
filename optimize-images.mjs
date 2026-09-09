// 将「素材原图PNG」中的原始 PNG 转成同路径同名的 .webp 输出到 public。
// 为保作品集清晰度,保留原始分辨率(不降采样),质量 88。
// 用法: cd web-pages && node optimize-images.mjs [--force]
// 原 PNG 不删除;图片更新后重跑即可增量刷新。
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const HERE = import.meta.dirname; // web-pages 目录
const SRC_DIR = path.join(HERE, "..", "素材原图PNG"); // 原图(仓库外,本地备份)
const OUT_DIR = path.join(HERE, "public"); // 输出到站点目录
const QUALITY = 88; // 高质量,保留设计细节
const FORCE = process.argv.includes("--force");

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

async function main() {
  let before = 0;
  let after = 0;
  let count = 0;
  for await (const png of walk(SRC_DIR)) {
    if (!png.toLowerCase().endsWith(".png")) continue;
    const rel = path.relative(SRC_DIR, png);
    const webp = path.join(OUT_DIR, rel.replace(/\.png$/i, ".webp"));
    const srcStat = await fs.stat(png);
    let need = FORCE;
    if (!need) {
      try {
        const outStat = await fs.stat(webp);
        need = outStat.mtimeMs < srcStat.mtimeMs;
      } catch {
        need = true;
      }
    }
    if (!need) continue;

    await fs.mkdir(path.dirname(webp), { recursive: true });
    const info = await sharp(png, { failOn: "none" })
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(webp);
    before += srcStat.size;
    after += info.size;
    count += 1;
    console.log(
      `  ${((1 - info.size / srcStat.size) * 100).toFixed(0).padStart(3)}%  ` +
        `${(srcStat.size / 1e6).toFixed(2)}M -> ${(info.size / 1e6).toFixed(2)}M  ` +
        `${rel.replace(/\.png$/i, ".webp")}`,
    );
  }
  console.log(count ? `\n转换 ${count} 张` : "无需转换");
  if (count > 0)
    console.log(`累计 ${(before / 1e6).toFixed(0)}M -> ${(after / 1e6).toFixed(1)}M`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
