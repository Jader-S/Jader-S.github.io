import { ActionType, InteractionStyle } from "./actions.js";

/**
 * Click targets for the full drawn portfolio.
 * Scroll targets are scene element ids, so the engine keeps building as the page moves.
 * @param {{nav:string[], primaryCta:string, github:string, posts:{title:string, href:string}[], links:{id:string, label:string, kind:string, href?:string, target?:string}[]}} copy Nav labels, buttons, blog links, and the footer index.
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

  const navCopy = (index, target, label) => ({
    id: `nav0~${index}`,
    elements: [`nav0~${index}`],
    after: [`d:nav:${index - 1}`, `e:nav0~${index}`],
    label,
    style: InteractionStyle.LINK,
    action: { type: ActionType.SCROLL, target },
  });

  const posts = copy.posts.slice(0, 4).map((post, index) => ({
    id: `b${index}`,
    elements: [`b${index}`, `b${index}m`],
    after: [`t:b${index}`, `t:b${index}m`],
    label: post.title,
    style: InteractionStyle.LINK,
    action: { type: ActionType.CUSTOM, id: "open", href: post.href },
  }));

  return [
    scroll("nav0", "a-title", copy.nav[0]),
    navCopy(1, "w-title", copy.nav[1]),
    navCopy(2, "k-title", copy.nav[2]),
    navCopy(3, "b-title", copy.nav[3]),
    navCopy(4, "d-title", copy.nav[4]),
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
