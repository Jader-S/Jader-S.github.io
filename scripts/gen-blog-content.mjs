/**
 * 把 content/blog/*.mdx 的正文（去掉 frontmatter）固化成客户端可直接 import 的 JSON。
 *
 * 为什么需要这一步：5 个主题页都是 `"use client"` + `ssr: false` 动态导入，
 * 运行时拿不到 node:fs；而项目走 `output: "export"` 静态导出，也没有服务端
 * 可以按需读文件。正文必须在 dev / build 之前生成成静态模块。
 *
 * 用法：npm run gen:blog-content（predev / prebuild 会自动执行）
 */
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(root, "content", "blog");
const outputFile = path.join(root, "data", "blog-content.generated.json");

/** 匹配文件顶部的 --- ... --- frontmatter 块（含 CRLF 兼容）。 */
const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

const files = (await fs.readdir(sourceDir))
  .filter((name) => name.endsWith(".mdx"))
  .sort();

/** @type {Record<string, string>} */
const content = {};
for (const name of files) {
  const raw = await fs.readFile(path.join(sourceDir, name), "utf8");
  const slug = name.slice(0, -".mdx".length);
  content[slug] = raw.replace(FRONTMATTER, "").trimStart();
}

await fs.writeFile(outputFile, `${JSON.stringify(content, null, 2)}\n`, "utf8");
console.log(
  `[gen:blog-content] ${files.length} posts -> data/blog-content.generated.json`
);
