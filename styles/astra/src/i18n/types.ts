/**
 * 作品 / Demo 的显式类型，作为 i18n 数据的类型守卫。
 * 评审结论：原先 en 由 `DeepString<typeof zh>` 推导，缺字段只在编译期才发现；
 * 这里显式定义接口，新增字段（kind / repoUrl …）即被类型守护。
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
  desc?: string;
  demos?: ProjectDemo[];
  /** 项目来源：local=本站实验室 demo；github=外部仓库 */
  kind?: "local" | "github";
  /** GitHub 仓库外链 */
  repoUrl?: string;
}
