import { SceneBuilder } from "./scene-builder.js";
import {
  SUN_SEAL_ANCHORS,
  SUN_SEAL_PATH_D,
  SUN_SEAL_VIEWBOX,
} from "./sun-seal-path.js";
import {
  COLORS,
  CONTENT_LEFT,
  FRAME_LEFT,
  TEXT_STYLES,
  applyScenePalette,
  monoStyle,
  sansStyle,
} from "./theme.js";

/** Full drawn page. Each block sits lower on the canvas so scrolling reveals the next build. */
export const PORTFOLIO_SCENE_HEIGHT = 5880;
/** 实验室从 3×2（2 行）扩到 3 行后新增的高度：沿用原始行高 250，正好 +一行。 */
const LAB_GROW = 250;

const COL = 373;
const ROW = 250;

/**
 * Wrap copy to an approximate design width and keep only a few lines.
 * CJK has no spaces, and the measurement layer only breaks on spaces or newlines.
 * @param {string} text Source copy.
 * @param {number} width Design width in pixels.
 * @param {number} size Font size.
 * @param {number} maxLines Maximum lines to keep.
 * @returns {string} Text with explicit newlines.
 */
function pieces(text) {
  const flat = String(text).replace(/\s+/g, " ").trim();
  const parts = flat.match(
    /[\u3400-\u9fff]|[A-Za-z0-9][A-Za-z0-9.+#/&-]*|\s+|[^\s]/g
  ) ?? [flat];
  const units = [];
  let lead = "";
  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      lead = " ";
      continue;
    }
    const latin = /^[A-Za-z0-9]/.test(part);
    units.push({
      text: part,
      width: latin ? part.length * 0.55 : 1,
      lead,
    });
    lead = "";
  }
  return units;
}

function fit(text, width, size, maxLines) {
  const lines = [];
  let line = "";
  let lineWidth = 0;

  for (const piece of pieces(text)) {
    const tokenWidth = Math.max(size * 0.45, piece.width * size);
    const spacing = line && piece.lead ? size * 0.3 : 0;
    if (line && lineWidth + spacing + tokenWidth > width) {
      lines.push(line.trim());
      line = piece.text;
      lineWidth = tokenWidth;
    } else {
      line = line ? `${line}${piece.lead}${piece.text}` : piece.text;
      lineWidth += spacing + tokenWidth;
    }
  }
  if (line.trim()) lines.push(line.trim());

  const kept = lines.slice(0, maxLines);
  if (lines.length > maxLines && kept.length) {
    kept[kept.length - 1] = `${kept[kept.length - 1].replace(/[…\s]+$/u, "")}…`;
  }
  return kept.join("\n");
}

/**
 * Draw one title/body cell, then duplicate it across a 3×2 board.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {string} id Group id.
 * @param {number} x Left of the first cell.
 * @param {number} y Top of the first title.
 * @param {{title:string, body:string}[]} items Six cells; the first is the source.
 */
function board(scene, id, x, y, items, rowHeight = ROW) {
  const [first, ...rest] = items;
  scene.text(`${id}-t`, x, y, fit(first.title, 300, 21, 2), TEXT_STYLES.h3, { w: 300 });
  scene.text(`${id}-b`, x, y + 58, fit(first.body, 300, 15.5, 3), TEXT_STYLES.body, {
    w: 300,
    deps: [`t:${id}-t`],
  });
  scene.duplicate(
    id,
    [`${id}-t`, `${id}-b`],
    rest.map((item, index) => {
      const column = (index + 1) % 3;
      const row = Math.floor((index + 1) / 3);
      return {
        dx: column * COL,
        dy: row * rowHeight,
        edits: [fit(item.title, 300, 21, 2), fit(item.body, 300, 15.5, 3)],
      };
    })
  );
}

/**
 * @param {object} copy Localized portfolio copy consumed by the scene.
 * @returns {(getWorkerCount:()=>number)=>{els:object[],tasks:object[],groups:object[],height:number}}
 */
export function createPortfolioSceneFactory(copy) {
  return function createPortfolioScene(getWorkerCount) {
    applyScenePalette(copy.palette === "dark" ? "dark" : "light");
    const scene = new SceneBuilder();

    drawNavigation(scene, copy.nav);
    drawHero(scene, copy);
    drawStats(scene, copy.highlights);
    drawAbout(scene, copy.about);
    drawWork(scene, copy.work);
    drawLab(scene, copy.lab);
    drawSkills(scene, copy.skills);
    drawBlog(scene, copy.blog);
    drawExperience(scene, copy.experience);
    drawClosing(scene, copy, getWorkerCount);
    drawFooter(scene, copy);
    // 实验室改为三行后多占 60px：所有章节画完后把 2860 以下的后续区块整体下移。
    // 实验室自身元素（帧底 / 网格 / 卡片已按 2920 排好）必须跳过，否则会被二次平移。
    const labIds = scene.elements
      .map((el) => el.id)
      .filter((id) =>
        /^(lab-|lab$|l-|l[0-9]|left-lab$|right-lab$|rule-lab$|left-lgrid$|right-lgrid$|rule-lgrid$)/.test(
          id
        )
      );
    scene.shiftY(2860, LAB_GROW, labIds);

    return {
      els: scene.elements,
      tasks: scene.tasks,
      groups: scene.groups,
      // 实验室加高 60px 后，页面实际高度随之后移。
      height: PORTFOLIO_SCENE_HEIGHT + LAB_GROW,
    };
  };
}

/**
 * Sticky navigation, drawn the same way as the reference landing page.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {{label:string}[]} links Section labels. The first is the source, the rest are copies.
 */
function drawNavigation(scene, links) {
  const first = scene.elements.length;
  scene.frame("nav", 24, 88, true);
  scene.text("brand", FRAME_LEFT + 24, 44, links.brand, TEXT_STYLES.brand);
  scene.text("nav0", 520, 46, links.items[0], TEXT_STYLES.nav);
  scene.duplicate(
    "nav",
    ["nav0"],
    links.items.slice(1).map((label, index) => ({
      dx: 92 * (index + 1),
      dy: 0,
      edits: [label],
    }))
  );
  scene.elements.slice(first).forEach((element) => {
    element.sticky = true;
  });
}

/**
 * Opening board: name, line, buttons, and the reference dispatch diagram.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {object} copy Scene copy.
 */
function drawHero(scene, copy) {
  scene.frame("hero", 88, 700);
  scene.vertical("hero-div", 740, 88, 700);
  scene.guide("g-hero", "x", CONTENT_LEFT, 140);
  scene.guide("g-hero-r", "x", 776, 140);
  scene.text("h-kicker", CONTENT_LEFT, 150, copy.kicker, TEXT_STYLES.small, {
    w: 520,
    snap: "g-hero",
  });
  scene.text("h-title", CONTENT_LEFT, 186, copy.name, TEXT_STYLES.h1, {
    w: 560,
    snap: "g-hero",
    grow: true,
  });
  scene.text(
    "h-role",
    CONTENT_LEFT,
    292,
    copy.title,
    sansStyle(22, 600, 1.3, COLORS.accent, -0.01),
    {
      w: 520,
      snap: "g-hero",
    }
  );
  scene.text(
    "h-lead",
    CONTENT_LEFT,
    348,
    fit(copy.tagline, 500, 19, 3),
    TEXT_STYLES.lead,
    {
      w: 500,
      snap: "g-hero",
    }
  );
  scene.rect("h-btn1", CONTENT_LEFT, 500, 168, 48, { r: 8, fill: COLORS.solid });
  scene.text("h-btn1-t", CONTENT_LEFT, 513, copy.primaryCta, TEXT_STYLES.btn, {
    w: 168,
    align: "center",
    deps: ["r:h-btn1"],
  });
  scene.rect("h-btn2", CONTENT_LEFT + 184, 500, 148, 48, {
    r: 8,
    fill: COLORS.card,
    stroke: COLORS.line,
  });
  scene.text("h-btn2-t", CONTENT_LEFT + 184, 513, copy.github, TEXT_STYLES.btnDark, {
    w: 148,
    align: "center",
    deps: ["r:h-btn2"],
  });

  scene.rect("g-disp", 776, 168, 388, 64, { r: 10, fill: COLORS.solid });
  scene.text("g-disp-t", 800, 178, "portfolio.dispatch(page)", TEXT_STYLES.nodeWhite, {
    deps: ["r:g-disp"],
  });
  scene.text(
    "g-disp-s",
    800,
    200,
    fit(copy.title, 340, 12, 1),
    monoStyle(12, COLORS.dim),
    {
      deps: ["r:g-disp"],
    }
  );

  // 首屏技能快照：三层分叉树（调度条 → 领域卡 → 技术节点）。
  // 全部复用现有颜色令牌，明暗主题切换时自动跟随，不引入硬编码色。
  const stem = scene.path(
    "g-stem",
    [
      { x: 970, y: 232 },
      { x: 970, y: 258 },
    ],
    { stroke: COLORS.stem, deps: ["r:g-disp"] }
  );
  // 三列等距：图区 776~1164（宽 388），列宽 110、列间距 29。
  const COL_W = 110;
  const colX = [776, 915, 1054];
  const colCenter = [831, 970, 1109];

  // 第二层总线：从中心向左右两列展开，中列单独下拉。
  scene.path(
    "g-bus",
    [
      { x: colCenter[0], y: 290 },
      { x: colCenter[0], y: 258 },
      { x: colCenter[2], y: 258 },
      { x: colCenter[2], y: 290 },
    ],
    { stroke: COLORS.stem, deps: [stem] }
  );
  scene.path(
    "g-bus-mid",
    [
      { x: colCenter[1], y: 258 },
      { x: colCenter[1], y: 290 },
    ],
    { stroke: COLORS.stem, deps: [stem] }
  );

  // 领域卡：深色实心 + 白字，沿用调度条的视觉权重。
  const domains = [
    { id: "g-domain-fe", x: colX[0], label: "FRONTEND" },
    { id: "g-domain-ai", x: colX[1], label: "AI AGENT" },
    { id: "g-domain-be", x: colX[2], label: "BACKEND" },
  ];
  for (const domain of domains) {
    scene.rect(domain.id, domain.x, 290, COL_W, 40, {
      r: 8,
      fill: COLORS.solid,
      deps: ["p:g-bus", "p:g-bus-mid"],
    });
    scene.text(
      `${domain.id}-t`,
      domain.x + 12,
      303,
      domain.label,
      TEXT_STYLES.nodeWhite,
      { deps: [`r:${domain.id}`] }
    );
  }

  // 第三层技术节点：每卡挂 3 个，节点内是技术名 + 三格档位条。
  // level: 3=主力, 2=常用, 1=能用。格数直接表达熟练度，无需文字图例。
  const techNodes = [
    [
      { name: "React / Vue", level: 3 },
      { name: "Next.js", level: 3 },
      { name: "Three.js / R3F", level: 3 },
    ],
    [
      { name: "LangChain", level: 3 },
      { name: "LangGraph", level: 3 },
      { name: "Langfuse", level: 2 },
    ],
    [
      { name: "Python / Java", level: 2 },
      { name: "Spring 生态", level: 2 },
      { name: "Docker", level: 2 },
    ],
  ];
  const rowYs = [362, 426, 490];
  for (let col = 0; col < techNodes.length; col++) {
    const domain = domains[col];
    const cx = colCenter[col];
    for (let row = 0; row < techNodes[col].length; row++) {
      const node = techNodes[col][row];
      const y = rowYs[row];
      const nodeId = `${domain.id}-n${row}`;
      // 从上一节点（或领域卡）向下引线到当前节点。
      const parentTask = row === 0 ? `r:${domain.id}` : `r:${domain.id}-n${row - 1}`;
      const branch = scene.path(
        `${nodeId}-line`,
        [
          { x: cx, y: row === 0 ? 330 : rowYs[row - 1] + 48 },
          { x: cx, y },
        ],
        { stroke: COLORS.stem, deps: [parentTask] }
      );
      scene.rect(nodeId, domain.x, y, COL_W, 48, {
        r: 7,
        fill: COLORS.card,
        stroke: COLORS.line,
        deps: [branch],
      });
      scene.text(
        `${nodeId}-t`,
        domain.x + 12,
        y + 9,
        node.name,
        monoStyle(11, COLORS.ink),
        { deps: [`r:${nodeId}`] }
      );
      // 三格档位条：填充格表达熟练度层次。
      for (let bar = 0; bar < 3; bar++) {
        scene.rect(`${nodeId}-b${bar}`, domain.x + 12 + bar * 26, y + 32, 20, 6, {
          r: 3,
          fill: bar < node.level ? COLORS.accent : COLORS.track,
          deps: [`r:${nodeId}`],
        });
      }
    }
  }

  scene.rect("g-track", 776, 562, 388, 6, { r: 3, fill: COLORS.track });
  scene.rect("g-fill", 776, 562, 252, 6, {
    r: 3,
    fill: COLORS.accent,
    deps: ["r:g-track"],
  });
  scene.text("g-stat", 776, 582, copy.diagramNote, TEXT_STYLES.small, {
    w: 388,
    snap: "g-hero-r",
  });
}

/**
 * Four highlight figures, copied across the strip.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {{label:string, value:string}[]} highlights Up to four figures.
 */
function drawStats(scene, highlights) {
  const items = highlights.slice(0, 4);
  scene.frame("stats", 700, 920, true);
  for (const x of [390, 670, 950]) scene.vertical(`s-div${x}`, x, 700, 920);
  scene.guide("g-stats", "y", 760, 720);
  scene.guide("g-stats-x", "x", CONTENT_LEFT, 720);
  const valueStyle = sansStyle(36, 600, 1.05, COLORS.ink, -0.03);
  scene.text("st-n", CONTENT_LEFT, 760, items[0].value, valueStyle, {
    w: 240,
    snap: "g-stats",
  });
  scene.text(
    "st-l",
    CONTENT_LEFT,
    820,
    fit(items[0].label, 220, 15.5, 2),
    TEXT_STYLES.body,
    {
      w: 220,
      snap: "g-stats-x",
    }
  );
  scene.duplicate(
    "stats",
    ["st-n", "st-l"],
    items.slice(1).map((item, index) => ({
      dx: 280 * (index + 1),
      dy: 0,
      edits: [item.value, fit(item.label, 220, 15.5, 2)],
    }))
  );
}

/**
 * About copy, revealed after the first viewport.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {{index:string, title:string, subtitle:string, paragraphs:string[]}} about About copy.
 */
function drawAbout(scene, about) {
  scene.frame("about", 920, 1420);
  scene.guide("g-about", "x", CONTENT_LEFT, 960);
  scene.guide("g-about-r", "x", 760, 960);
  scene.text("a-index", CONTENT_LEFT, 980, about.index, TEXT_STYLES.small, {
    snap: "g-about",
  });
  scene.text("a-title", CONTENT_LEFT, 1012, about.title, TEXT_STYLES.h2, {
    w: 560,
    snap: "g-about",
    grow: true,
  });
  scene.text("a-lead", 760, 1024, fit(about.subtitle, 380, 15.5, 4), TEXT_STYLES.body, {
    w: 380,
    snap: "g-about-r",
  });
  about.paragraphs.slice(0, 3).forEach((paragraph, index) => {
    scene.text(
      `a-p${index}`,
      CONTENT_LEFT,
      1160 + index * 78,
      fit(paragraph, 980, 15.5, 2),
      TEXT_STYLES.body,
      { w: 980, deps: index === 0 ? ["t:a-title"] : [`t:a-p${index - 1}`] }
    );
  });
}

/**
 * Project board. Later copies wait until the source cell exists.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {{index:string, title:string, subtitle:string, items:{title:string, body:string}[]}} work Work copy.
 */
function drawWork(scene, work) {
  scene.frame("work", 1420, 2140, true);
  scene.guide("g-work", "x", CONTENT_LEFT, 1460);
  scene.guide("g-work-r", "x", 760, 1460);
  scene.text("w-index", CONTENT_LEFT, 1480, work.index, TEXT_STYLES.small, {
    snap: "g-work",
  });
  scene.text("w-title", CONTENT_LEFT, 1512, work.title, TEXT_STYLES.h2, {
    w: 560,
    snap: "g-work",
    grow: true,
  });
  scene.text("w-lead", 760, 1524, fit(work.subtitle, 380, 15.5, 3), TEXT_STYLES.body, {
    w: 380,
    snap: "g-work-r",
  });
  scene.frame("wgrid", 1660, 2140);
  scene.horizontal("w-mid", 1900);
  scene.vertical("w-v1", 453, 1660, 2140);
  scene.vertical("w-v2", 826, 1660, 2140);
  board(scene, "work", CONTENT_LEFT, 1708, work.items.slice(0, 6));
}

/**
 * Lab demos on the same 3×2 board, slotted between work and skills.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {{index:string, title:string, subtitle:string, items:{title:string, body:string, slug?:string}[]}} lab Lab copy.
 */
function drawLab(scene, lab) {
  // 与 work / skills 一致：每行沿用原始 ROW=250 的行高，只是多一行。
  // 网格高 2380→3130（3×250），横线落在行间空隙（标题上方约 58px），不压文字。
  scene.frame("lab", 2140, 3130);
  scene.guide("g-lab", "x", CONTENT_LEFT, 2180);
  scene.guide("g-lab-r", "x", 760, 2180);
  scene.text("l-index", CONTENT_LEFT, 2200, lab.index, TEXT_STYLES.small, {
    snap: "g-lab",
  });
  scene.text("l-title", CONTENT_LEFT, 2232, lab.title, TEXT_STYLES.h2, {
    w: 560,
    snap: "g-lab",
    grow: true,
  });
  scene.text("l-lead", 760, 2244, fit(lab.subtitle, 380, 15.5, 3), TEXT_STYLES.body, {
    w: 380,
    snap: "g-lab-r",
  });
  scene.frame("lgrid", 2380, 3130, true);
  // 原横线 2620 = 第一行标题 2428 下方 192（正文之后、下一行标题 2678 之前）。
  // 第二、三行按同样规则各加 ROW：2870 落在第二行正文后、第三行标题 2928 前。
  scene.horizontal("l-mid1", 2620);
  scene.horizontal("l-mid2", 2870);
  scene.vertical("l-v1", 453, 2380, 3130);
  scene.vertical("l-v2", 826, 2380, 3130);
  board(scene, "lab", CONTENT_LEFT, 2428, lab.items.slice(0, 9));
}

/**
 * Skill categories on the same 3×2 board.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {{index:string, title:string, subtitle:string, items:{title:string, body:string}[]}} skills Skill copy.
 */
function drawSkills(scene, skills) {
  scene.frame("skills", 2860, 3580);
  scene.guide("g-skills", "x", CONTENT_LEFT, 2900);
  scene.guide("g-skills-r", "x", 760, 2900);
  scene.text("k-index", CONTENT_LEFT, 2920, skills.index, TEXT_STYLES.small, {
    snap: "g-skills",
  });
  scene.text("k-title", CONTENT_LEFT, 2952, skills.title, TEXT_STYLES.h2, {
    w: 560,
    snap: "g-skills",
    grow: true,
  });
  scene.text(
    "k-lead",
    760,
    2964,
    fit(skills.subtitle, 380, 15.5, 3),
    TEXT_STYLES.body,
    {
      w: 380,
      snap: "g-skills-r",
    }
  );
  scene.frame("kgrid", 3100, 3580, true);
  scene.horizontal("k-mid", 3340);
  scene.vertical("k-v1", 453, 3100, 3580);
  scene.vertical("k-v2", 826, 3100, 3580);
  board(scene, "skill", CONTENT_LEFT, 3148, skills.items.slice(0, 6));
}

/**
 * Blog rows. Each title is its own element so a click can open that article.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {{index:string, title:string, subtitle:string, posts:{title:string, meta:string}[], allPostsLabel?:string}} blog Blog copy.
 */
function drawBlog(scene, blog) {
  scene.frame("blog", 3580, 4240);
  scene.guide("g-blog", "x", CONTENT_LEFT, 3620);
  scene.guide("g-blog-r", "x", 760, 3620);
  scene.text("b-index", CONTENT_LEFT, 3640, blog.index, TEXT_STYLES.small, {
    snap: "g-blog",
  });
  scene.text("b-title", CONTENT_LEFT, 3672, blog.title, TEXT_STYLES.h2, {
    w: 560,
    snap: "g-blog",
    grow: true,
  });
  // 与其他章节一致：描述放右栏、与标题同一水平带，而不是堆在标题下方。
  scene.text("b-lead", 760, 3684, fit(blog.subtitle, 380, 15.5, 3), TEXT_STYLES.body, {
    w: 380,
    snap: "g-blog-r",
  });
  blog.posts.slice(0, 4).forEach((post, index) => {
    const y = 3860 + index * 88;
    scene.horizontal(
      `b-rule${index}`,
      y - 16,
      CONTENT_LEFT,
      1100,
      index === 0 ? ["t:b-lead"] : [`t:b${index - 1}`]
    );
    scene.text(
      `b${index}`,
      CONTENT_LEFT,
      y,
      fit(post.title, 860, 16, 1),
      sansStyle(16, 600, 1.35),
      {
        w: 860,
        deps: [`p:b-rule${index}`],
      }
    );
    scene.text(`b${index}m`, CONTENT_LEFT, y + 28, post.meta, TEXT_STYLES.small, {
      w: 420,
      deps: [`t:b${index}`],
    });
  });

  // 与其他主题博客区同构的「全部日志」入口：画布里也能一键打开完整列表，
  // 不必先点进单篇再返回。放在最后一行下方，仍在本帧（3580–4240）内。
  if (blog.allPostsLabel) {
    // 最后一行 meta 在 4152；入口压到 4200，横线 4180，仍留在 blog 帧（4240 底）内。
    const allY = 4200;
    scene.horizontal("b-rule-all", allY - 20, CONTENT_LEFT, 1100, [
      `t:b${Math.min(blog.posts.length, 4) - 1}m`,
    ]);
    scene.text(
      "b-all",
      CONTENT_LEFT,
      allY,
      blog.allPostsLabel,
      sansStyle(15, 600, 1.35),
      { w: 520, deps: ["p:b-rule-all"] }
    );
  }
}

/**
 * Experience domains on a 3×2 board.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {{index:string, title:string, subtitle:string, items:{title:string, body:string}[]}} experience Domain copy.
 */
function drawExperience(scene, experience) {
  scene.frame("domains", 4240, 4960, true);
  scene.guide("g-exp", "x", CONTENT_LEFT, 4280);
  scene.guide("g-exp-r", "x", 760, 4280);
  scene.text("d-index", CONTENT_LEFT, 4300, experience.index, TEXT_STYLES.small, {
    snap: "g-exp",
  });
  scene.text("d-title", CONTENT_LEFT, 4332, experience.title, TEXT_STYLES.h2, {
    w: 560,
    snap: "g-exp",
    grow: true,
  });
  scene.text(
    "d-lead",
    760,
    4344,
    fit(experience.subtitle, 380, 15.5, 3),
    TEXT_STYLES.body,
    {
      w: 380,
      snap: "g-exp-r",
    }
  );
  scene.frame("dgrid", 4480, 4960);
  scene.horizontal("d-mid", 4720);
  scene.vertical("d-v1", 453, 4480, 4960);
  scene.vertical("d-v2", 826, 4480, 4960);
  board(scene, "dom", CONTENT_LEFT, 4528, experience.items.slice(0, 6));
}

/**
 * Closing beat: title, gray 九叠篆「孙」seal, then a quiet cursor count.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {object} copy Scene copy.
 * @param {() => number} getWorkerCount Live worker total from the engine.
 */
function drawClosing(scene, copy, getWorkerCount) {
  const sealSize = 88;
  const sealScale = sealSize / SUN_SEAL_VIEWBOX;
  const sealX = CONTENT_LEFT;
  const sealY = 5100;
  const sealInk = COLORS.dim;

  scene.frame("cta", 4960, 5340);
  scene.guide("g-cta", "x", CONTENT_LEFT, 5000);
  scene.text("x-title", CONTENT_LEFT, 5030, copy.signTitle, TEXT_STYLES.h2, {
    w: 560,
    snap: "g-cta",
    grow: true,
  });
  scene.path(
    "seal",
    SUN_SEAL_ANCHORS.map(([x, y]) => ({
      x: sealX + x * sealScale,
      y: sealY + y * sealScale,
    })),
    {
      closed: true,
      stroke: sealInk,
      fill: sealInk,
      add: false,
      d: SUN_SEAL_PATH_D,
      tf: { x: sealX, y: sealY, s: sealScale },
      deps: ["t:x-title"],
    }
  );
  scene.text("x-count", CONTENT_LEFT, 5216, "", monoStyle(13, COLORS.muted, 500), {
    w: 520,
    dyn: () => copy.builtBy.replace("{n}", String(getWorkerCount())),
    deps: ["p:seal"],
  });
}

/**
 * Footer brand line.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {object} copy Scene copy.
 */
function drawFooter(scene, copy) {
  scene.frame("footer", 5340, PORTFOLIO_SCENE_HEIGHT, true);
  scene.text("f-name", CONTENT_LEFT, 5408, copy.name, TEXT_STYLES.h1, {
    w: 1000,
    grow: true,
  });
  copy.links.forEach((link, index) => {
    const y = 5544 + index * 68;
    scene.horizontal(
      `f-rule${index}`,
      y - 20,
      CONTENT_LEFT,
      1100,
      index === 0 ? ["t:f-name"] : [`t:f-l${index - 1}`]
    );
    scene.text(
      `f-n${index}`,
      CONTENT_LEFT,
      y,
      String(index + 1).padStart(2, "0"),
      TEXT_STYLES.small,
      {
        deps: [`p:f-rule${index}`],
      }
    );
    scene.text(
      `f-l${index}`,
      CONTENT_LEFT + 72,
      y - 6,
      link.label,
      sansStyle(28, 500, 1.15, COLORS.ink, -0.02),
      { w: 640, deps: [`p:f-rule${index}`] }
    );
  });
  scene.text("f-copy", CONTENT_LEFT, 5824, copy.footer, TEXT_STYLES.small);
}
