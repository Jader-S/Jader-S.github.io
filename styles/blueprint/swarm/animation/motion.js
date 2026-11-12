/**
 * 在给定区间内取随机数，营造多人协作时的轻微节奏差异。
 * @param {number} minimum 最小值。
 * @param {number} maximum 最大值。
 * @returns {number} 区间内的随机数。
 */
export function randomBetween(minimum, maximum) {
  // 所有随机运动共用此入口，便于后续替换为固定随机种子。
  return minimum + Math.random() * (maximum - minimum);
}

/**
 * 把数值限制在闭区间中。
 * @param {number} value 待限制的数值。
 * @param {number} minimum 下界。
 * @param {number} maximum 上界。
 * @returns {number} 限制后的数值。
 */
export function clamp(value, minimum, maximum) {
  // 防止施工速度、帧间隔和工人数量超出配置范围。
  return Math.max(minimum, Math.min(maximum, value));
}

/**
 * 三次缓入缓出，供拖拽和到位动作使用。
 * @param {number} progress 从0到1的进度。
 * @returns {number} 缓动后的进度。
 */
export function easeInOutCubic(progress) {
  // 前半段加速、后半段减速，拖拽动作在两端保持柔和。
  return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
}

/**
 * 三次缓出，供快速接近目标后的减速使用。
 * @param {number} progress 从0到1的进度。
 * @returns {number} 缓动后的进度。
 */
export function easeOutCubic(progress) {
  // 越接近终点位移越小。
  return 1 - (1 - progress) ** 3;
}

/**
 * 标记可变场景对象已更新，驱动React按版本号重绘。
 * @param {{v:number}} element 场景对象。
 * @returns {void}
 */
export function markChanged(element) {
  // 渲染层会比较v，避免每帧重绘尚未变化的所有文字和路径。
  element.v++;
}
