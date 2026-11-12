#!/usr/bin/env node

import { existsSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// 本仓库的 data/blogs.ts 已改为 ASTRA 日志（内容源 site-content.yaml）。
// 这个脚本仍按模板作者的 CSDN 账号抓取，误跑会覆盖真实内容，因此默认禁用。
// 确实要恢复 CSDN 抓取时，显式设置 ALLOW_CSDN_FETCH=1。
if (process.env.ALLOW_CSDN_FETCH !== "1") {
  console.error(
    "[fetch-csdn-blogs] 已禁用：博客内容由 site-content.yaml 维护，运行本脚本会覆盖 data/blogs.ts",
  );
  process.exit(1);
}

const CSDN_USERNAME = "paopao_pop";
const CSDN_PROFILE = `https://blog.csdn.net/${CSDN_USERNAME}`;
const CSDN_API = "https://blog.csdn.net/community/home-api/v1/get-business-list";
const TOP_N = 6;
const PAGE_SIZE = 100;
const MAX_ATTEMPTS = 3;
const RETRY_BASE_MS = 1500;

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "application/json, text/html, */*",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  Referer: CSDN_PROFILE,
  Origin: "https://blog.csdn.net",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtml(text = "") {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'");
}

function formatDate(value) {
  if (!value) return "";
  if (typeof value === "number") {
    return new Date(value).toISOString().slice(0, 10);
  }
  const match = String(value).match(/^(\d{4})[.-](\d{2})[.-](\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function normalizeArticles(list) {
  return [...list]
    .filter((item) => item?.title && (item.url || item.articleId || item.id))
    .sort((a, b) => (b.diggCount ?? 0) - (a.diggCount ?? 0))
    .slice(0, TOP_N)
    .map((item) => ({
      title: item.title,
      description: decodeHtml(item.description || "").slice(0, 160),
      url: item.url || `${CSDN_PROFILE}/article/details/${item.articleId || item.id}`,
      likes: item.diggCount ?? 0,
      views: item.viewCount ?? 0,
      date: formatDate(
        item.postTime || item.createTime || item.formatTime || item.PDATE
      ),
    }));
}

/** Parse JSON object starting at `start`, respecting string literals. */
function extractJsonObject(source, start) {
  if (source[start] !== "{") return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < source.length; i++) {
    const ch = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return source.slice(start, i + 1);
      }
    }
  }

  return null;
}

function isRetryableError(error) {
  const message = String(error?.message || error);
  return /\b(408|425|429|500|502|503|504|521|522|523|524)\b/.test(message);
}

async function withRetries(label, fn) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryableError(error) || attempt === MAX_ATTEMPTS) break;
      const waitMs = RETRY_BASE_MS * attempt;
      console.warn(
        `${label} 失败（第 ${attempt}/${MAX_ATTEMPTS} 次）: ${error.message}；${waitMs}ms 后重试…`
      );
      await sleep(waitMs);
    }
  }
  throw lastError;
}

async function fetchViaApi() {
  const url = new URL(CSDN_API);
  url.searchParams.set("page", "1");
  url.searchParams.set("size", String(PAGE_SIZE));
  url.searchParams.set("businessType", "blog");
  url.searchParams.set("username", CSDN_USERNAME);

  const res = await fetch(url, { headers: FETCH_HEADERS });
  if (!res.ok) {
    throw new Error(`CSDN API 请求失败: ${res.status} ${res.statusText}`);
  }

  const payload = await res.json();
  if (payload?.code !== 200) {
    throw new Error(`CSDN API 返回异常: ${payload?.message || "unknown"}`);
  }

  const list = payload?.data?.list;
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("CSDN API 文章列表为空");
  }

  return normalizeArticles(list);
}

async function fetchViaHtml() {
  const res = await fetch(CSDN_PROFILE, { headers: FETCH_HEADERS });
  if (!res.ok) {
    throw new Error(`CSDN 页面请求失败: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const marker = "window.__INITIAL_STATE__";
  const start = html.indexOf(marker);
  if (start === -1) {
    const preview = html.replace(/\s+/g, " ").slice(0, 180);
    throw new Error(`未找到 CSDN 页面数据，可能触发了反爬。响应片段: ${preview}`);
  }

  const jsonStart = html.indexOf("{", start);
  const jsonText = extractJsonObject(html, jsonStart);
  if (!jsonText) {
    throw new Error("无法解析 CSDN __INITIAL_STATE__ JSON");
  }

  const state = JSON.parse(jsonText);
  const list = state?.pageData?.data?.baseInfo?.latelyList;
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error("CSDN 页面文章列表为空");
  }

  return normalizeArticles(list);
}

async function fetchCsdnArticles() {
  try {
    const articles = await withRetries("API", fetchViaApi);
    console.log("数据来源: CSDN home-api");
    return articles;
  } catch (apiError) {
    console.warn(`API 抓取失败，回退到页面解析: ${apiError.message}`);
    const articles = await withRetries("HTML", fetchViaHtml);
    console.log("数据来源: CSDN HTML __INITIAL_STATE__");
    return articles;
  }
}

function generateModule(articles) {
  const fetchedAt = new Date().toISOString().slice(0, 10);

  return `export interface BlogPost {
  title: string;
  description: string;
  url: string;
  likes: number;
  views: number;
  date: string;
}

/** CSDN 博客主页 */
export const csdnProfile = "${CSDN_PROFILE}";

/** 数据更新时间：${fetchedAt}，运行 npm run fetch:blogs 可刷新 */
export const blogPosts: BlogPost[] = ${JSON.stringify(articles, null, 2)};
`;
}

function warnStaleInCi(message) {
  // GitHub Actions annotation（Actions 日志里会高亮）
  if (process.env.GITHUB_ACTIONS === "true") {
    console.log(`::warning title=CSDN blog fetch failed::${message}`);
  }
  console.warn(message);
}

async function main() {
  const outPath = join(dirname(fileURLToPath(import.meta.url)), "../data/blogs.ts");
  console.log(`正在从 ${CSDN_PROFILE} 获取点赞最多的 ${TOP_N} 篇博客…`);

  let articles;
  try {
    articles = await fetchCsdnArticles();
  } catch (error) {
    const detail = error.message || String(error);
    // CSDN WAF 常对 GitHub Actions 等机房 IP 返回 521；CI 保留已提交数据，避免红灯
    if (process.env.CI === "true" && existsSync(outPath)) {
      warnStaleInCi(
        `抓取失败（${detail}），保留仓库内现有 data/blogs.ts。可在可访问 CSDN 的网络本地运行 npm run fetch:blogs 后提交。`
      );
      return;
    }
    throw error;
  }

  writeFileSync(outPath, generateModule(articles), "utf8");
  console.log(`已写入 ${outPath}`);
  articles.forEach((a, i) => console.log(`  ${i + 1}. [${a.likes}👍] ${a.title}`));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
