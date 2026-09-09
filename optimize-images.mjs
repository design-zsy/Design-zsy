// 将 public 下的 PNG 转成同目录同名 .webp,并把最长边限制在 MAX_EDGE 内。
// 用法: node optimize-images.mjs
// 原 PNG 保留;main.jsx 的引用已指向 .webp。改图后重跑本脚本即可增量更新。
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = path.resolve("public");
const MAX_EDGE = 1600; // 展示最长边上限(原图超过才缩放)
const QUALITY = 82;

async function* walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

async function main() {
  let saved = 0;
  let before = 0;
  let after = 0;
  let count = 0;
  for await (const png of walk(PUBLIC_DIR)) {
    if (!png.toLowerCase().endsWith(".png")) continue;
    const webp = png.replace(/\.png$/i, ".webp");
    const stat = await fs.stat(png);
    let need = true;
    try {
      const wStat = await fs.stat(webp);
      // 已存在且比源文件新 -> 跳过
      if (wStat.mtimeMs >= stat.mtimeMs) need = false;
    } catch {
      /* webp 不存在,需要生成 */
    }
    if (!need) continue;

    const out = await sharp(png, { failOn: "none" })
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 4 })
      .toFile(webp);
    const b = stat.size;
    const a = out.size;
    before += b;
    after += a;
    saved += b - a;
    count += 1;
    const rel = path.relative(PUBLIC_DIR, png);
    console.log(`  ${((1 - a / b) * 100).toFixed(0).padStart(3)}%  ${(b / 1e6).toFixed(2)}M -> ${(a / 1e6).toFixed(2)}M  ${rel}`);
  }
  console.log(`\n转换 ${count} 张`);
  if (count > 0) {
    console.log(`累计 ${(before / 1e6).toFixed(0)}M -> ${(after / 1e6).toFixed(0)}M,省 ${(saved / 1e6).toFixed(0)}M (${(saved / Math.max(before, 1) * 100).toFixed(0)}%)`);
  } else {
    console.log("无需转换(webp 均已是最新)");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
