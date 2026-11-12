/**
 * 作品 / Demo 的显式类型，作为 i18n 数据的类型守卫。
 * 评审结论：原先 en 由 `DeepString<typeof zh>` 推导，缺字段只在编译期才发现；
 * 这里显式定义接口，新增字段（kind / repoUrl / embedUrl …）即被类型守护。
 */

export interface ProjectDemo {
  name: string;
  desc: string;
  slug: string;
}

export interface ProjectEntry {
  id: string;
  title: string;
  role: string;
  tag: string;
  metric: string;
  /** 作品分类：公司项目 / 个人项目（用于作品页分类筛选） */
  group?: 'company' | 'personal';
  desc?: string;
  demos?: ProjectDemo[];
  /** 项目来源：local=本站实验室 demo；github=外部整项目（可内嵌预览） */
  kind?: 'local' | 'github';
  /** GitHub 仓库外链（"在 GitHub 打开"） */
  repoUrl?: string;
  /** 在线预览 / GitHub Pages 地址（用 iframe 内嵌，"在博客中打开"） */
  embedUrl?: string;
  /** iframe 宽高比（width/height），默认 16/9 */
  embedAspect?: number;
}
