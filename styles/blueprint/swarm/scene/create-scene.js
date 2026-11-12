import { SceneBuilder } from "./scene-builder.js";
import { createNavigation } from "./sections/navigation.js";
import { createHero, createTeamStrip } from "./sections/hero.js";
import { createFeatures } from "./sections/features.js";
import { createConfiguration } from "./sections/configuration.js";
import { createStatistics, createWorkflow } from "./sections/workflow.js";
import { createPricing } from "./sections/pricing.js";
import { createClosing, createFooter } from "./sections/footer.js";

/** 原站设计画布总高度，包含页脚下方留白。 */
export const PAGE_HEIGHT = 4060;

/**
 * 按页面从上至下的顺序组装可编辑场景和施工任务。
 * @param {() => number} getWorkerCount 由动画引擎提供的实际施工人数。
 * @returns {{els:object[],tasks:object[],groups:object[],height:number}} 场景元素、依赖任务、重复组与设计高度。
 */
export function createScene(getWorkerCount) {
  // 每个区块由独立源码文件定义，修改文案和几何时无需触碰动画调度器。
  const scene = new SceneBuilder();
  createNavigation(scene);
  createHero(scene);
  createTeamStrip(scene);
  createFeatures(scene);
  createConfiguration(scene);
  createStatistics(scene);
  createWorkflow(scene);
  createPricing(scene);
  createClosing(scene, getWorkerCount);
  createFooter(scene);
  return {
    els: scene.elements,
    tasks: scene.tasks,
    groups: scene.groups,
    height: PAGE_HEIGHT,
  };
}
