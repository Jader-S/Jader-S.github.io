import { ActionType, InteractionStyle } from "./actions.js";

/**
 * Click targets for the full drawn portfolio.
 * Scroll targets are scene element ids, so the engine keeps building as the page moves.
 * @param {{nav:string[], primaryCta:string, github:string, posts:{title:string, meta?:string, slug:string}[], projects:{title:string, id:string, link?:string}[], links:{id:string, label:string, kind:string, href?:string, target?:string}[]}} copy Nav labels, buttons, blog post slugs, work items, and the footer index.
 * @returns {object[]} Interaction definitions.
 */
export function createPortfolioInteractions(copy) {
  const scroll = (id, target, label) => ({
    id,
    elements: [id],
    after: [`t:${id}`],
    label,
    style: InteractionStyle.LINK,
    action: { type: ActionType.SCROLL, target },
  });

  // 导航项共用同一套绘制元素 id，只有 action 不同。
  const navItem = (index, label, action) => ({
    id: `nav0~${index}`,
    elements: [`nav0~${index}`],
    after: [`d:nav:${index - 1}`, `e:nav0~${index}`],
    label,
    style: InteractionStyle.LINK,
    action,
  });

  // 5 项是旧布局；6 项时第 3 个菜单是「实验室」，它没有绘制场景段，
  // 改派发 lab action 打开当前页的 Demo 列表弹框（不跳路由）。
  const NAV_TARGETS = {
    5: ["a-title", "w-title", "k-title", "b-title", "d-title"],
    6: ["a-title", "w-title", null, "k-title", "b-title", "d-title"],
  };
  const targets = NAV_TARGETS[copy.nav.length] ?? NAV_TARGETS[5];
  const navInteractions = copy.nav.map((label, index) => {
    if (index === 0) return scroll("nav0", targets[0], label);
    const target = targets[index];
    return target == null
      ? navItem(index, label, { type: ActionType.CUSTOM, id: "lab" })
      : navItem(index, label, { type: ActionType.SCROLL, target });
  });

  const posts = copy.posts.slice(0, 4).map((post, index) => ({
    id: `b${index}`,
    elements: [`b${index}`, `b${index}m`],
    after: [`t:b${index}`, `t:b${index}m`],
    label: post.title,
    style: InteractionStyle.LINK,
    action: { type: ActionType.CUSTOM, id: "open", slug: post.slug },
  }));

  // Work board: item 0 is the source element ("work-t"/"work-b"), items 1..n
  // are duplicates ("work-t~1" ...). Duplicates only become clickable after
  // their copy task finishes, so the animation never exposes a dead region.
  const workItems = copy.projects.slice(0, 6).map((project, index) => {
    const suffix = index === 0 ? "" : `~${index}`;
    return {
      id: `w${index}`,
      elements: [`work-t${suffix}`, `work-b${suffix}`],
      after: index === 0 ? ["t:work-t", "t:work-b"] : [`d:work:${index - 1}`],
      label: project.title,
      style: InteractionStyle.LINK,
      action: project.link
        ? { type: ActionType.CUSTOM, id: "repo", href: project.link }
        : { type: ActionType.CUSTOM, id: "project", projectId: project.id },
    };
  });

  return [
    ...navInteractions,
    {
      id: "h-btn1",
      elements: ["h-btn1", "h-btn1-t"],
      after: ["r:h-btn1", "t:h-btn1-t"],
      label: copy.primaryCta,
      style: InteractionStyle.BUTTON,
      action: { type: ActionType.SCROLL, target: "a-title" },
    },
    {
      id: "h-btn2",
      elements: ["h-btn2", "h-btn2-t"],
      after: ["r:h-btn2", "t:h-btn2-t"],
      label: copy.github,
      style: InteractionStyle.BUTTON,
      action: { type: ActionType.CUSTOM, id: "github" },
    },
    ...posts,
    ...workItems,
    ...copy.links.map((link, index) => ({
      id: `f-l${index}`,
      elements: [`f-l${index}`, `f-n${index}`],
      after: [`t:f-l${index}`, `t:f-n${index}`],
      label: link.label,
      style: InteractionStyle.LINK,
      action:
        link.kind === "scroll"
          ? { type: ActionType.SCROLL, target: link.target }
          : { type: ActionType.CUSTOM, id: link.kind, href: link.href },
    })),
  ];
}
