import generated from "@/data/blog-content.generated.json";

/**
 * 客户端可用的 MDX 正文表（frontmatter 已去除）。
 * 数据由 scripts/gen-blog-content.mjs 在 dev / build 前从 content/blog/*.mdx 生成，
 * 运行时不读文件系统、不发网络请求，静态导出与 basePath 部署都可用。
 */
export const blogContent: Record<string, string> = generated;

/** 按 slug 取正文；缺失时返回空串，由弹框显示降级提示。 */
export function getBlogContent(slug: string): string {
  return blogContent[slug] ?? "";
}
