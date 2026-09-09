// 将 NotoSansSC(中文全量字体)子集化为只含页面用字的字体,输出到
// font-packages/NotoSansSC-subset.ttf。
//
// 用法: cd web-pages && node subset-font.mjs
//
// 母体来源(自动选择):
//   1) font-packages/NotoSansSC-Regular.ttf(若存在,直接使用)
//   2) 否则从 ../字体文件/NotoSansSC.zip 解压出母体再子集(一条命令搞定)
// 改中文文案后重跑本脚本即可;全量母体不会污染 font-packages,用完即清理。
import { promises as fs } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const Fontmin = require("fontmin");

const HERE = import.meta.dirname; // web-pages 目录
const FONT_DIR = path.join(HERE, "font-packages");
const MASTER_IN_REPO = path.join(FONT_DIR, "NotoSansSC-Regular.ttf");
const ZIP_PATH = path.join(HERE, "..", "字体文件", "NotoSansSC.zip");
const ZIP_ENTRY = "NotoSansSC-Regular.ttf";
const OUT_FILE = path.join(FONT_DIR, "NotoSansSC-subset.ttf");

// 收集页面用字:扫描哪些文件
const TARGETS = [
  path.join(HERE, "index.html"),
  ...(await fs.readdir(path.join(HERE, "src")))
    .filter((f) => /\.(jsx?|css)$/.test(f))
    .map((f) => path.join(HERE, "src", f)),
];
// 额外保留的标点/符号(避免文案微调时缺字)
const EXTRAS = " \t\n。，、；：？！（）《》【】「」『』—…·•·×＋→←↑↓¥%&@#©°℃①②③④⑤⑥⑦⑧⑨⑩＊＊";

async function collectText() {
  let buf = "";
  for (const t of TARGETS) {
    try {
      buf += await fs.readFile(t, "utf8");
    } catch {
      console.warn(`跳过无法读取: ${t}`);
    }
  }
  const chars = new Set(EXTRAS);
  for (const ch of buf) {
    const cp = ch.codePointAt(0);
    if ((cp >= 0x20 && cp <= 0x7e) || cp >= 0x80) chars.add(ch);
  }
  return [...chars].join("");
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// 定位母体,返回 { ttf, tmpDir? }
async function locateMaster() {
  if (await fileExists(MASTER_IN_REPO)) {
    return { ttf: MASTER_IN_REPO, tmpDir: null };
  }
  if (await fileExists(ZIP_PATH)) {
    const tmpDir = path.join(FONT_DIR, ".master-tmp");
    await fs.mkdir(tmpDir, { recursive: true });
    execFileSync("unzip", ["-o", "-j", ZIP_PATH, ZIP_ENTRY, "-d", tmpDir]);
    return { ttf: path.join(tmpDir, ZIP_ENTRY), tmpDir };
  }
  throw new Error(
    `找不到母体。请二选一后重跑:\n` +
      `  1) 把 NotoSansSC-Regular.ttf 放回 ${MASTER_IN_REPO}\n` +
      `  2) 或保证 ${ZIP_PATH} 存在(会自动解压)`,
  );
}

const text = await collectText();
console.log(`收集到 ${text.length} 个字符(去重后)`);

const { ttf, tmpDir } = await locateMaster();
const workDir = path.join(FONT_DIR, ".subset-tmp");
await fs.mkdir(workDir, { recursive: true });

try {
  await new Promise((resolve, reject) => {
    new Fontmin()
      .src(ttf)
      .use(Fontmin.glyph({ text }))
      .dest(workDir)
      .run((err) => (err ? reject(err) : resolve()));
  });
  // fontmin 输出与原文件同名,移动到最终输出名
  const generated = path.join(workDir, path.basename(ttf));
  await fs.rename(generated, OUT_FILE);

  const [b, a] = await Promise.all([fs.stat(ttf), fs.stat(OUT_FILE)]);
  console.log(`NotoSansSC ${(b.size / 1e6).toFixed(2)}M -> ${(a.size / 1e6).toFixed(3)}M`);
  console.log(`输出: ${OUT_FILE}`);
} finally {
  await fs.rm(workDir, { recursive: true, force: true });
  if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true });
}
