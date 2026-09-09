import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base = GitHub Pages 项目页路径，格式为 /<仓库名>/（首尾都要斜杠）。
// 本站部署于 https://design-zsy.github.io/Design-zsy/
const repoBase = "/Design-zsy/";

export default defineConfig({
  base: repoBase,
  plugins: [react()],
});
