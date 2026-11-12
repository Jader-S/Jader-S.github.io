import { SceneBuilder } from "./scene-builder.js";
import { LU_SEAL_ANCHORS, LU_SEAL_PATH_D, LU_SEAL_VIEWBOX } from "./lu-seal-path.js";
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
export const PORTFOLIO_SCENE_HEIGHT = 5160;

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
function board(scene, id, x, y, items) {
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
        dy: row * ROW,
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
    drawSkills(scene, copy.skills);
    drawBlog(scene, copy.blog);
    drawExperience(scene, copy.experience);
    drawClosing(scene, copy, getWorkerCount);
    drawFooter(scene, copy);

    return {
      els: scene.elements,
      tasks: scene.tasks,
      groups: scene.groups,
      height: PORTFOLIO_SCENE_HEIGHT,
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
  const stem = scene.path(
    "g-stem",
    [
      { x: 970, y: 232 },
      { x: 970, y: 264 },
    ],
    { stroke: COLORS.stem, deps: ["r:g-disp"] }
  );
  scene.path(
    "g-bus",
    [
      { x: 866, y: 296 },
      { x: 866, y: 264 },
      { x: 1074, y: 264 },
      { x: 1074, y: 296 },
    ],
    { stroke: COLORS.stem, deps: [stem] }
  );
  scene.rect("w0", 776, 296, 180, 64, {
    r: 10,
    fill: COLORS.card,
    stroke: COLORS.line,
  });
  scene.text("w0-n", 796, 307, "React", TEXT_STYLES.nodeName, { deps: ["r:w0"] });
  scene.text("w0-s", 796, 329, "● drawing", monoStyle(12, COLORS.accent), {
    deps: ["r:w0"],
  });
  scene.duplicate(
    "workers",
    ["w0", "w0-n", "w0-s"],
    [
      { dx: 208, dy: 0, edits: ["Vue", "● drawing"] },
      { dx: 0, dy: 104, edits: ["TypeScript", "● queued"] },
      { dx: 208, dy: 104, edits: ["AI", "○ waiting"] },
    ]
  );
  scene.path(
    "g-l1",
    [
      { x: 866, y: 360 },
      { x: 866, y: 400 },
    ],
    { stroke: COLORS.stem, deps: ["d:workers:2"] }
  );
  scene.path(
    "g-l2",
    [
      { x: 1074, y: 360 },
      { x: 1074, y: 400 },
    ],
    { stroke: COLORS.stem, deps: ["d:workers:2"] }
  );
  scene.rect("g-track", 776, 546, 388, 6, { r: 3, fill: COLORS.track });
  scene.rect("g-fill", 776, 546, 252, 6, {
    r: 3,
    fill: COLORS.accent,
    deps: ["r:g-track"],
  });
  scene.text("g-stat", 776, 566, copy.diagramNote, TEXT_STYLES.small, {
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
 * Skill categories on the same 3×2 board.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {{index:string, title:string, subtitle:string, items:{title:string, body:string}[]}} skills Skill copy.
 */
function drawSkills(scene, skills) {
  scene.frame("skills", 2140, 2860);
  scene.guide("g-skills", "x", CONTENT_LEFT, 2180);
  scene.guide("g-skills-r", "x", 760, 2180);
  scene.text("k-index", CONTENT_LEFT, 2200, skills.index, TEXT_STYLES.small, {
    snap: "g-skills",
  });
  scene.text("k-title", CONTENT_LEFT, 2232, skills.title, TEXT_STYLES.h2, {
    w: 560,
    snap: "g-skills",
    grow: true,
  });
  scene.text(
    "k-lead",
    760,
    2244,
    fit(skills.subtitle, 380, 15.5, 3),
    TEXT_STYLES.body,
    {
      w: 380,
      snap: "g-skills-r",
    }
  );
  scene.frame("kgrid", 2380, 2860, true);
  scene.horizontal("k-mid", 2620);
  scene.vertical("k-v1", 453, 2380, 2860);
  scene.vertical("k-v2", 826, 2380, 2860);
  board(scene, "skill", CONTENT_LEFT, 2428, skills.items.slice(0, 6));
}

/**
 * Blog rows. Each title is its own element so a click can open that article.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {{index:string, title:string, subtitle:string, posts:{title:string, meta:string}[]}} blog Blog copy.
 */
function drawBlog(scene, blog) {
  scene.frame("blog", 2860, 3520);
  scene.guide("g-blog", "x", CONTENT_LEFT, 2900);
  scene.text("b-index", CONTENT_LEFT, 2920, blog.index, TEXT_STYLES.small, {
    snap: "g-blog",
  });
  scene.text("b-title", CONTENT_LEFT, 2952, blog.title, TEXT_STYLES.h2, {
    w: 640,
    snap: "g-blog",
    grow: true,
  });
  scene.text(
    "b-lead",
    CONTENT_LEFT,
    3048,
    fit(blog.subtitle, 760, 15.5, 2),
    TEXT_STYLES.body,
    {
      w: 760,
    }
  );
  blog.posts.slice(0, 4).forEach((post, index) => {
    const y = 3140 + index * 88;
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
}

/**
 * Experience domains on a 3×2 board.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {{index:string, title:string, subtitle:string, items:{title:string, body:string}[]}} experience Domain copy.
 */
function drawExperience(scene, experience) {
  scene.frame("domains", 3520, 4240, true);
  scene.guide("g-exp", "x", CONTENT_LEFT, 3560);
  scene.guide("g-exp-r", "x", 760, 3560);
  scene.text("d-index", CONTENT_LEFT, 3580, experience.index, TEXT_STYLES.small, {
    snap: "g-exp",
  });
  scene.text("d-title", CONTENT_LEFT, 3612, experience.title, TEXT_STYLES.h2, {
    w: 560,
    snap: "g-exp",
    grow: true,
  });
  scene.text(
    "d-lead",
    760,
    3624,
    fit(experience.subtitle, 380, 15.5, 3),
    TEXT_STYLES.body,
    {
      w: 380,
      snap: "g-exp-r",
    }
  );
  scene.frame("dgrid", 3760, 4240);
  scene.horizontal("d-mid", 4000);
  scene.vertical("d-v1", 453, 3760, 4240);
  scene.vertical("d-v2", 826, 3760, 4240);
  board(scene, "dom", CONTENT_LEFT, 3808, experience.items.slice(0, 6));
}

/**
 * Closing beat: title, gray 九叠篆「卢」seal, then a quiet cursor count.
 * @param {SceneBuilder} scene Scene under construction.
 * @param {object} copy Scene copy.
 * @param {() => number} getWorkerCount Live worker total from the engine.
 */
function drawClosing(scene, copy, getWorkerCount) {
  const sealSize = 88;
  const sealScale = sealSize / LU_SEAL_VIEWBOX;
  const sealX = CONTENT_LEFT;
  const sealY = 4380;
  const sealInk = COLORS.dim;

  scene.frame("cta", 4240, 4620);
  scene.guide("g-cta", "x", CONTENT_LEFT, 4280);
  scene.text("x-title", CONTENT_LEFT, 4310, copy.signTitle, TEXT_STYLES.h2, {
    w: 560,
    snap: "g-cta",
    grow: true,
  });
  scene.path(
    "seal",
    LU_SEAL_ANCHORS.map(([x, y]) => ({
      x: sealX + x * sealScale,
      y: sealY + y * sealScale,
    })),
    {
      closed: true,
      stroke: sealInk,
      fill: sealInk,
      add: false,
      d: LU_SEAL_PATH_D,
      tf: { x: sealX, y: sealY, s: sealScale },
      deps: ["t:x-title"],
    }
  );
  scene.text("x-count", CONTENT_LEFT, 4496, "", monoStyle(13, COLORS.muted, 500), {
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
  scene.frame("footer", 4620, PORTFOLIO_SCENE_HEIGHT, true);
  scene.text("f-name", CONTENT_LEFT, 4688, copy.name, TEXT_STYLES.h1, {
    w: 1000,
    grow: true,
  });
  copy.links.forEach((link, index) => {
    const y = 4824 + index * 68;
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
  scene.text("f-copy", CONTENT_LEFT, 5104, copy.footer, TEXT_STYLES.small);
}
