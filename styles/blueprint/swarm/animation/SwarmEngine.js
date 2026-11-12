import { createScene } from "../scene/create-scene.js";
import { lineHeight, measureText } from "../scene/text-metrics.js";
import { PAGE_WIDTH, NAV_TOP, RULER_SIZE } from "../scene/theme.js";
import { ElementKind, TaskType } from "../scene/types.js";
import { DrawingEngine } from "./DrawingEngine.js";
import {
  CURSOR_COLORS,
  CURSOR_NAMES,
  CursorShape,
  TaskState,
  WORKER_LIMITS,
} from "./config.js";
import {
  clamp,
  easeInOutCubic,
  easeOutCubic,
  markChanged,
  randomBetween,
} from "./motion.js";

/**
 * 调度页面施工任务、滚动触发与光标飞行，为React场景提供可变动画状态。
 * @author 程序员阿鑫
 */
export class SwarmEngine extends DrawingEngine {
  /**
   * 初始化场景索引、任务依赖及首屏环绕光标。
   * @param {{sceneFactory?:Function}} options 接收施工人数读取函数的场景工厂。
   */
  constructor({ sceneFactory = createScene } = {}) {
    super();
    // 场景与任务各自建立索引，绘制生成器可通过稳定ID找到目标。
    this.els = new Map();
    this.list = [];
    this.tasks = [];
    this.byTask = new Map();
    this.groups = new Map();
    this.cursors = [];
    this.vp = { scrollY: 0, vh: 800, vw: PAGE_WIDTH, s: 1, left: 0 };
    this.started = false;
    this.frontier = 0;
    this.vel = 0;
    this.tempo = 1;
    this.time = 0;
    this.rulers = { want: 0, t: 0, lastNeed: -10 };
    this.lastScroll = 0;
    this.nextId = 0;
    this.spawnCooldown = 0;
    this.flocking = false;
    this.lastT = null;
    this.tv = { x: 0, y: 0 };
    this.mouse = null;
    this.guideDeps = new Map();
    this.retiredWorkers = 0;
    const scene = sceneFactory(
      () => this.cursors.filter((cursor) => cursor.worked).length + this.retiredWorkers
    );
    this.height = scene.height;
    for (const element of scene.els) {
      this.els.set(element.id, element);
      this.list.push(element);
    }
    for (const definition of scene.tasks) {
      const task = { ...definition, state: TaskState.WAITING, doneAt: 0 };
      this.tasks.push(task);
      this.byTask.set(task.id, task);
      if (definition.spec.type === TaskType.TEXT && definition.spec.snap) {
        const dependents = this.guideDeps.get(definition.spec.snap) ?? [];
        dependents.push(task);
        this.guideDeps.set(definition.spec.snap, dependents);
      }
    }
    for (const group of scene.groups) this.groups.set(group.id, group);
    // 初始光标围绕中心排列，前六位保留为常驻施工人员。
    for (let index = 0; index < WORKER_LIMITS.INITIAL; index++) {
      const angle = (index / WORKER_LIMITS.INITIAL) * Math.PI * 2;
      const cursor = this.makeCursor(
        PAGE_WIDTH / 2 + Math.cos(angle) * 160,
        400 + Math.sin(angle) * 160,
        index < WORKER_LIMITS.BASE ? { x: 0, y: 0 } : null
      );
      cursor.follow = true;
      this.cursors.push(cursor);
    }
  }

  /**
   * 创建具有独立颜色、运动参数和工具状态的工人。
   * @param {number} x 初始横坐标。
   * @param {number} y 初始纵坐标。
   * @param {{x:number,y:number}|null} home 常驻人员标记和初始停留点。
   * @returns {object} 光标运行状态。
   */
  makeCursor(x, y, home = null) {
    // 分配少量速度更快的工人，让协作运动有自然层次。
    const id = this.nextId++;
    const fast = Math.random() < 0.25;
    const speed = fast ? randomBetween(1000, 1500) : randomBetween(300, 750);
    const force = fast ? randomBetween(3500, 6000) : randomBetween(700, 1800);
    // 保留参考站随机序列中的旋转抽样；当前飞行阶段统一从零旋转强度开始。
    randomBetween(fast ? 2.2 : 0.8, fast ? 3.4 : 1.8);
    return {
      id,
      x,
      y,
      home,
      name: CURSOR_NAMES[id % CURSOR_NAMES.length],
      color: CURSOR_COLORS[id % CURSOR_COLORS.length],
      shape: CursorShape.ARROW,
      press: 0,
      task: null,
      gen: null,
      ov: null,
      idleFor: 0,
      leaving: false,
      worked: false,
      sticky: false,
      vx: 0,
      vy: 0,
      angle: 0,
      speed,
      force,
      curl: randomBetween(-1, 1),
      ph: randomBetween(0, Math.PI * 2),
      orbit: randomBetween(70, 170),
      spin: 0,
      follow: false,
    };
  }

  /** 取得视口顶部对应的设计稿纵坐标。 */
  get viewTop() {
    // 视口像素按当前缩放比例还原为设计稿坐标。
    return this.vp.scrollY / this.vp.s;
  }

  /** 取得视口底部对应的设计稿纵坐标。 */
  get viewBot() {
    // 用于推进施工前沿，滚动后的新内容才进入候选任务。
    return (this.vp.scrollY + this.vp.vh) / this.vp.s;
  }

  /** 计算吸顶导航与正常文档位置的偏移。 */
  get stick() {
    // 标尺出现时导航向下让位，同时保持导航工人的坐标一致。
    return Math.max(
      0,
      this.viewTop + (RULER_SIZE * this.rulers.t) / this.vp.s - NAV_TOP
    );
  }

  /**
   * 判断任务是否属于吸顶导航中的对象。
   * @param {object} task 当前任务。
   * @returns {boolean} 是否需要吸顶坐标修正。
   */
  isSticky(task) {
    // 复制组没有直接元素ID，以源组第一个元素判断所属层。
    const spec = task.spec;
    const id =
      spec.type === TaskType.DUPLICATE ? this.groups.get(spec.group).ids[0] : spec.el;
    return Boolean(this.els.get(id)?.sticky);
  }

  /**
   * 将浏览器视口坐标转换为设计稿坐标。
   * @param {number} x 视口横坐标。
   * @param {number} y 视口纵坐标。
   * @returns {{x:number,y:number}} 设计稿坐标。
   */
  fromViewport(x, y) {
    // 同时扣除居中留白并加上滚动位置。
    return {
      x: (x - this.vp.left) / this.vp.s,
      y: (this.vp.scrollY + y) / this.vp.s,
    };
  }

  /** 从开场环绕切换到正式施工，只执行一次。 */
  start() {
    // 保留光标当前位置，释放开场跟随状态给施工任务调度。
    if (this.started) return;
    this.started = true;
    for (const cursor of this.cursors) {
      cursor.follow = false;
      cursor.gen = null;
      cursor.angle = ((((cursor.angle + 180) % 360) + 360) % 360) - 180;
    }
  }

  /**
   * 计算文字、矩形或路径当前可见边界。
   * @param {object} element 场景对象。
   * @returns {{x:number,y:number,w:number,h:number}} 边界矩形。
   */
  bounds(element) {
    // 文字按已输入内容测量，矩形按当前拖拽尺寸测量。
    if (element.kind === ElementKind.TEXT) {
      const metrics = measureText(
        element.shown || " ",
        element.st,
        element.size,
        element.w
      );
      return {
        x: element.x + element.dx,
        y: element.y + element.dy,
        w: element.w ?? Math.max(metrics.w, 2),
        h: Math.max(metrics.h, lineHeight(element.st, element.size)),
      };
    }
    if (element.kind === ElementKind.RECTANGLE) {
      return {
        x: element.x + element.dx,
        y: element.y + element.dy,
        w: element.draw?.w ?? element.w,
        h: element.draw?.h ?? element.h,
      };
    }
    if (element.kind === ElementKind.PATH) {
      const xs = element.pts.map((point) => point.x);
      const ys = element.pts.map((point) => point.y);
      return {
        x: Math.min(...xs),
        y: Math.min(...ys),
        w: Math.max(...xs) - Math.min(...xs),
        h: Math.max(...ys) - Math.min(...ys),
      };
    }
    return { x: element.pos, y: 0, w: 0, h: 0 };
  }

  /**
   * 合并一组场景对象的边界，供多选与复制使用。
   * @param {string[]} ids 场景对象ID列表。
   * @returns {{x:number,y:number,w:number,h:number}} 联合边界。
   */
  unionBounds(ids) {
    // 复制操作必须同时覆盖标题、说明和背景矩形。
    const bounds = ids.map((id) => this.bounds(this.els.get(id)));
    const x = Math.min(...bounds.map((rect) => rect.x));
    const y = Math.min(...bounds.map((rect) => rect.y));
    return {
      x,
      y,
      w: Math.max(...bounds.map((rect) => rect.x + rect.w)) - x,
      h: Math.max(...bounds.map((rect) => rect.y + rect.h)) - y,
    };
  }

  /**
   * 取得文字第一行的基线提示范围。
   * @param {object} element 文字对象。
   * @returns {{x:number,y:number,w:number,h:number}} 基线范围。
   */
  textUnderline(element) {
    // 居中文字需要将基线位置同步到实际字形起点。
    const metrics = measureText(
      element.shown || " ",
      element.st,
      element.size,
      element.w
    );
    const bounds = this.bounds(element);
    const width = metrics.lines[0] ?? 0;
    return {
      x:
        element.align === "center" && element.w
          ? bounds.x + (element.w - width) / 2
          : bounds.x,
      y: bounds.y + lineHeight(element.st, element.size) * 0.5 + element.size * 0.42,
      w: width,
      h: 0,
    };
  }

  /**
   * 创建包含控制点和尺寸标签的选区描述。
   * @param {object} element 选中对象。
   * @param {object} options 附加选区属性。
   * @returns {object} 交给Overlay组件渲染的选区。
   */
  selection(element, options = {}) {
    // 选区是纯描述，绘制动作无需操作React或DOM。
    const bounds = this.bounds(element);
    return {
      t: "box",
      b: bounds,
      handles: true,
      badge: `${Math.round(bounds.w)} × ${Math.round(bounds.h)}`,
      rulerLines: true,
      underline:
        element.kind === ElementKind.TEXT ? this.textUnderline(element) : undefined,
      ...options,
    };
  }

  /**
   * 同步页面滚动位置，并在用户开始向下浏览时启动施工。
   * @param {number} scrollY 纵向滚动像素。
   */
  setScroll(scrollY) {
    // 开场允许静静观察光标，真正滚动后立即进入施工。
    this.vp.scrollY = scrollY;
    if (scrollY > 4) this.start();
  }

  /**
   * 推进单帧施工与飞行动画。
   * @param {number} delta 浏览器帧间隔，单位秒。
   */
  step(delta) {
    // 限制后台恢复后的时间跨度，避免一次推进过多动画步骤。
    delta = Math.min(delta, 0.05);
    this.time += delta;
    const scrollSpeed =
      Math.abs(this.vp.scrollY - this.lastScroll) / this.vp.s / Math.max(delta, 0.001);
    this.lastScroll = this.vp.scrollY;
    this.vel = Math.max(
      this.vel * Math.exp(-delta * 1.2),
      this.vel * 0.7 + scrollSpeed * 0.3
    );
    if (this.started) this.frontier = Math.max(this.frontier, this.viewBot);
    const availableTasks = this.started ? this.available() : [];
    const activeCount = this.cursors.filter((cursor) => cursor.task).length;
    this.tempo = clamp(
      2.1 +
        this.vel / 900 +
        (availableTasks.length / Math.max(1, this.cursors.length)) * 0.5,
      2.1,
      4.5
    );
    this.updateGuides(delta);
    this.updateFlockingState();
    if (this.flocking) {
      this.flock(delta);
      return;
    }
    if (!this.started) {
      const center = this.fromViewport(this.vp.vw / 2, this.vp.vh / 2);
      if (this.follow(delta, this.cursors, center, 0.7)) this.start();
      return;
    }
    // 已完成任务的跟随光标与正在施工的工人可以同时活动。
    const followers = this.cursors.filter((cursor) => cursor.follow);
    if (followers.length) this.follow(delta, followers);
    this.spawnCooldown -= delta;
    const desiredCount = clamp(
      WORKER_LIMITS.BASE +
        Math.floor(this.vel / 50) +
        Math.floor(availableTasks.length / 3),
      WORKER_LIMITS.BASE,
      WORKER_LIMITS.MAXIMUM
    );
    const presentCount = this.cursors.filter((cursor) => !cursor.leaving).length;
    if (
      presentCount < desiredCount &&
      availableTasks.length > presentCount - activeCount &&
      this.spawnCooldown <= 0
    ) {
      const fromLeft = Math.random() < 0.5;
      const position = this.fromViewport(
        fromLeft ? -40 : this.vp.vw + 40,
        randomBetween(0.2, 0.8) * this.vp.vh
      );
      this.cursors.push(this.makeCursor(position.x, position.y));
      this.spawnCooldown = 0.035;
    }
    this.assignTasks(availableTasks);
    this.advanceWorkers(delta);
  }

  /**
   * 更新标尺出现、参考线闪烁与完成后的淡出。
   * @param {number} delta 本帧时长，单位秒。
   */
  updateGuides(delta) {
    // 标尺在最后一次需求后短暂保留，避免多个拖拽任务间反复闪烁。
    if (this.rulers.want > 0) this.rulers.lastNeed = this.time;
    const visibility = this.time - this.rulers.lastNeed < 0.7 ? 1 : 0;
    this.rulers.t += (visibility - this.rulers.t) * Math.min(1, delta * 10);
    if (Math.abs(visibility - this.rulers.t) < 0.002) this.rulers.t = visibility;
    for (const guide of this.list) {
      if (guide.kind !== ElementKind.GUIDE || !guide.vis) continue;
      if (guide.flash > 0) {
        guide.flash = Math.max(0, guide.flash - delta * 1.5);
        markChanged(guide);
      }
      const dependents = this.guideDeps.get(guide.id) ?? [];
      if (
        !guide.dragging &&
        dependents.every((task) => task.state === TaskState.DONE)
      ) {
        const lastCompleted = Math.max(...dependents.map((task) => task.doneAt));
        if (this.time - lastCompleted > 1.2 && guide.op > 0) {
          guide.op = Math.max(0, guide.op - delta * 1.2);
          markChanged(guide);
        }
      }
    }
  }

  /** 最后一批施工派出后，逐个把空闲光标交还给跟随系统。 */
  updateFlockingState() {
    // 全部任务至少已经分配后才允许进入最终环绕状态。
    if (
      this.flocking ||
      !this.started ||
      !this.tasks.every((task) => task.state !== TaskState.WAITING)
    )
      return;
    for (const cursor of this.cursors) {
      if (cursor.task || cursor.follow) continue;
      cursor.follow = true;
      cursor.gen = null;
      cursor.leaving = false;
      cursor.ov = null;
      cursor.shape = CursorShape.ARROW;
    }
    if (this.cursors.every((cursor) => cursor.follow)) this.flocking = true;
  }

  /**
   * 将当前可执行任务分给最近的空闲工人。
   * @param {object[]} availableTasks 可分配任务，会移除已派出的任务。
   */
  assignTasks(availableTasks) {
    // 同一个任务从本帧候选列表中移除，避免两个工人同时认领。
    for (const cursor of this.cursors) {
      if (cursor.task || cursor.leaving || cursor.follow || !this.started) continue;
      const task = this.pick(cursor, availableTasks);
      if (!task) continue;
      availableTasks.splice(availableTasks.indexOf(task), 1);
      task.state = TaskState.ACTIVE;
      cursor.task = task;
      cursor.worked = true;
      if (this.isSticky(task)) {
        cursor.sticky = true;
        cursor.y -= this.stick;
      }
      cursor.idleFor = 0;
      cursor.gen = this.run(cursor, task);
    }
  }

  /**
   * 推进工人的生成器、完成任务并收回过量的临时工人。
   * @param {number} delta 本帧时长，单位秒。
   */
  advanceWorkers(delta) {
    // 复制列表后遍历，离场工人从原列表移除不会打断其他工人的推进。
    for (const cursor of [...this.cursors]) {
      if (cursor.follow) continue;
      cursor.press = Math.max(0, cursor.press - delta * 6);
      if (cursor.angle !== 0)
        cursor.angle =
          Math.abs(cursor.angle) < 0.5
            ? 0
            : cursor.angle * (1 - Math.min(1, delta * 10));
      if (!cursor.task) {
        cursor.idleFor += delta;
        const excessWorker =
          this.cursors.filter((worker) => !worker.leaving).length > WORKER_LIMITS.BASE;
        if (
          !cursor.leaving &&
          this.started &&
          cursor.idleFor > 2.5 &&
          excessWorker &&
          !cursor.home
        ) {
          cursor.leaving = true;
          cursor.gen = this.leave(cursor);
        }
        if (!cursor.gen) cursor.gen = this.idle(cursor);
      }
      if (!cursor.gen.next(delta).done) continue;
      if (cursor.task) {
        cursor.task.state = TaskState.DONE;
        cursor.task.doneAt = this.time;
        cursor.task = null;
        cursor.ov = null;
        if (cursor.sticky) {
          cursor.sticky = false;
          cursor.y += this.stick;
        }
        cursor.shape = CursorShape.ARROW;
      }
      cursor.gen = null;
      if (cursor.leaving) {
        if (cursor.worked) this.retiredWorkers++;
        this.cursors.splice(this.cursors.indexOf(cursor), 1);
      }
    }
  }

  /**
   * 选择鼠标位置或无鼠标时连续变化的巡航目标。
   * @returns {{x:number,y:number}} 设计稿坐标中的跟随中心。
   */
  flockTarget() {
    // 没有鼠标时沿两个频率不同的正弦轨迹持续飞行。
    if (this.mouse) return this.fromViewport(this.mouse.x, this.mouse.y);
    return this.fromViewport(
      this.vp.vw * (0.5 + 0.28 * Math.sin(this.time * 0.37)),
      this.vp.vh * (0.5 + 0.25 * Math.sin(this.time * 0.53 + 1))
    );
  }

  /**
   * 施工结束后逐步补足跟随群，并推进全部光标。
   * @param {number} delta 本帧时长，单位秒。
   */
  flock(delta) {
    // 新成员从两侧入场，避免一次性出现在同一位置。
    this.spawnCooldown -= delta;
    if (this.cursors.length < WORKER_LIMITS.FOLLOW && this.spawnCooldown <= 0) {
      const fromLeft = Math.random() < 0.5;
      const position = this.fromViewport(
        fromLeft ? -30 : this.vp.vw + 30,
        randomBetween(0.1, 0.9) * this.vp.vh
      );
      const cursor = this.makeCursor(position.x, position.y);
      cursor.follow = true;
      this.cursors.push(cursor);
      this.spawnCooldown = 0.04;
    }
    this.follow(delta, this.cursors);
  }

  /**
   * 使用环绕向量、邻居速度与避让半径推进光标群。
   * @param {number} delta 本帧时长，单位秒。
   * @param {object[]} cursors 本次参与跟随的光标。
   * @param {{x:number,y:number}} [target] 可选的开场环绕中心。
   * @param {number} radiusScale 环绕半径缩放，开场使用较小范围。
   * @returns {boolean} 是否触碰到用户光标的避让区域。
   */
  follow(delta, cursors, target, radiusScale = 1) {
    const pointer = this.mouse ? this.fromViewport(this.mouse.x, this.mouse.y) : null;
    const center = target ?? this.flockTarget();
    // 平滑估计用户光标速度，碰撞避让时使用相对速度。
    if (pointer && this.lastT && delta > 0) {
      const response = Math.min(1, delta * 18);
      this.tv.x += ((pointer.x - this.lastT.x) / delta - this.tv.x) * response;
      this.tv.y += ((pointer.y - this.lastT.y) / delta - this.tv.y) * response;
    }
    this.lastT = pointer;
    const radius = 135 * radiusScale * (1 + 0.18 * Math.sin(this.time * 0.55));
    const circulation = Math.tanh(Math.cos(this.time * 0.11) * 3);
    const desiredVelocities = [];
    for (const cursor of cursors) {
      const offsetX = cursor.x - center.x;
      const offsetY = cursor.y - center.y;
      const distance = Math.hypot(offsetX, offsetY) || 0.01;
      const normalX = offsetX / distance;
      const normalY = offsetY / distance;
      const phase = Math.atan2(offsetY, offsetX);
      const personalRadius = (cursor.orbit - 120) * 0.55 * radiusScale;
      const orbitRadius =
        radius * (1 + 0.3 * Math.sin(3 * phase + this.time * 0.7)) + personalRadius;
      const tangentialSpeed = 300 * (0.7 + cursor.spin * 0.2) * circulation;
      const radialSpeed = clamp((orbitRadius - distance) * 4, -2600, 1400);
      const curlFactor = Math.min(1, Math.max(0, (distance - orbitRadius) / 600));
      desiredVelocities.push([
        -normalY * tangentialSpeed +
          normalX * radialSpeed -
          normalY * cursor.curl * 400 * curlFactor,
        normalX * tangentialSpeed +
          normalY * radialSpeed +
          normalX * cursor.curl * 400 * curlFactor,
      ]);
    }
    // 邻居朝向参与混合，光标保留个体运动同时形成整体流动。
    for (let index = 0; index < cursors.length; index++) {
      const cursor = cursors[index];
      let neighborVelocityX = 0;
      let neighborVelocityY = 0;
      let neighborWeight = 0;
      for (let otherIndex = 0; otherIndex < cursors.length; otherIndex++) {
        if (otherIndex === index) continue;
        const neighbor = cursors[otherIndex];
        const distance = Math.hypot(neighbor.x - cursor.x, neighbor.y - cursor.y);
        if (distance > 90) continue;
        const weight = 1 - distance / 90;
        neighborVelocityX += neighbor.vx * weight;
        neighborVelocityY += neighbor.vy * weight;
        neighborWeight += weight;
      }
      let [velocityX, velocityY] = desiredVelocities[index];
      if (neighborWeight > 0) {
        velocityX = velocityX * 0.7 + (neighborVelocityX / neighborWeight) * 0.3;
        velocityY = velocityY * 0.7 + (neighborVelocityY / neighborWeight) * 0.3;
      }
      const catchupDistance = Math.max(
        0,
        Math.hypot(cursor.x - center.x, cursor.y - center.y) - 180 * radiusScale
      );
      const maxSpeed = cursor.speed * (1.3 + Math.min(3.2, catchupDistance / 90));
      const speed = Math.hypot(velocityX, velocityY);
      if (speed > maxSpeed) {
        velocityX *= maxSpeed / speed;
        velocityY *= maxSpeed / speed;
      }
      let accelerationX = (velocityX - cursor.vx) * 6;
      let accelerationY = (velocityY - cursor.vy) * 6;
      const maxAcceleration = cursor.force * (1.4 + Math.min(5, catchupDistance / 50));
      const acceleration = Math.hypot(accelerationX, accelerationY);
      if (acceleration > maxAcceleration) {
        accelerationX *= maxAcceleration / acceleration;
        accelerationY *= maxAcceleration / acceleration;
      }
      cursor.vx += accelerationX * delta;
      cursor.vy += accelerationY * delta;
      cursor.x += cursor.vx * delta;
      cursor.y += cursor.vy * delta;
    }
    const avoidanceRadius = 48;
    let pointerTouched = false;
    if (pointer) {
      for (const cursor of cursors) {
        const offsetX = cursor.x - pointer.x;
        const offsetY = cursor.y - pointer.y;
        const distance = Math.hypot(offsetX, offsetY) || 0.01;
        if (distance >= avoidanceRadius) continue;
        pointerTouched = true;
        const normalX = offsetX / distance;
        const normalY = offsetY / distance;
        cursor.x = pointer.x + normalX * avoidanceRadius;
        cursor.y = pointer.y + normalY * avoidanceRadius;
        const relativeSpeed =
          (cursor.vx - this.tv.x) * normalX + (cursor.vy - this.tv.y) * normalY;
        if (relativeSpeed < 0) {
          cursor.vx -= normalX * relativeSpeed * 1.6;
          cursor.vy -= normalY * relativeSpeed * 1.6;
        }
        cursor.vx += normalX * 260;
        cursor.vy += normalY * 260;
      }
    }
    // 箭头逐渐朝向实际飞行方向，按下反馈同步衰减。
    for (const cursor of cursors) {
      if (Math.hypot(cursor.vx, cursor.vy) < 30) continue;
      const difference =
        (((Math.atan2(cursor.vy, cursor.vx) * 180) / Math.PI +
          128 -
          cursor.angle +
          540) %
          360) -
        180;
      cursor.angle += difference * Math.min(1, delta * 8);
      cursor.press = Math.max(0, cursor.press - delta * 6);
    }
    return pointerTouched;
  }

  /**
   * 收集滚动前沿内且所有依赖已经完成的任务。
   * @returns {object[]} 可立即派发的任务。
   */
  available() {
    // 先检查状态和可视前沿，再遍历依赖，避免重复派发。
    return this.tasks.filter(
      (task) =>
        task.state === TaskState.WAITING &&
        task.y <= this.frontier &&
        task.deps.every((id) => this.byTask.get(id)?.state === TaskState.DONE)
    );
  }

  /**
   * 为工人选择最合适的任务，优先当前可见区域，其次已滚过的内容。
   * @param {object} cursor 空闲工人。
   * @param {object[]} tasks 候选任务。
   * @returns {object|null} 最合适的任务，没有任务时返回null。
   */
  pick(cursor, tasks) {
    // 优先级分区远大于距离权重，保证首屏内容优先完成。
    let selected = null;
    let bestScore = Infinity;
    const top = this.viewTop - 40;
    for (const task of tasks) {
      const zone = task.y >= top && task.y <= this.viewBot ? 0 : task.y < top ? 1 : 2;
      const score =
        zone * 1000000 +
        (zone === 1 ? top - task.y : task.y) * 0.6 +
        Math.abs(task.y - cursor.y) * 0.4;
      if (score < bestScore) {
        bestScore = score;
        selected = task;
      }
    }
    return selected;
  }

  /**
   * 按施工节奏等待指定时间。
   * @param {number} duration 等待秒数，受tempo倍速影响。
   * @yields {undefined} 让出本帧，下一帧接收delta秒数。
   */
  *wait(duration) {
    // 使用动画时钟而非定时器，使所有工人由同一个帧循环驱动。
    let elapsed = 0;
    while (elapsed < duration) elapsed += (yield) * this.tempo;
  }

  /**
   * 沿弯曲路径移动到固定目标或动态目标。
   * @param {object} cursor 当前工人。
   * @param {{x:number,y:number}|Function} destination 固定位置或每帧计算的位置。
   * @param {{speed?:number,bend?:number,drag?:boolean,onStep?:Function}} options 移动方式。
   * @yields {undefined} 逐帧推进路径。
   */
  *moveTo(cursor, destination, options = {}) {
    // 动态目标用于吸顶导航和离场位置，滚动时仍与页面保持同步。
    const getDestination =
      typeof destination === "function" ? destination : () => destination;
    const startX = cursor.x;
    const startY = cursor.y;
    const firstTarget = getDestination();
    const distance = Math.hypot(firstTarget.x - startX, firstTarget.y - startY);
    if (distance < 0.5) {
      cursor.x = firstTarget.x;
      cursor.y = firstTarget.y;
      options.onStep?.();
      return;
    }
    const duration =
      clamp(0.12 + Math.sqrt(distance) * 0.021, 0.14, 0.9) / (options.speed ?? 1);
    const bend =
      (options.bend ?? (Math.random() < 0.5 ? -1 : 1) * randomBetween(0.04, 0.14)) *
      Math.min(distance, 600);
    let elapsed = 0;
    while (elapsed < duration) {
      elapsed += (yield) * this.tempo;
      const progress = Math.min(1, elapsed / duration);
      const eased =
        options.drag || progress < 0.15
          ? easeInOutCubic(progress)
          : easeOutCubic(progress);
      const target = getDestination();
      const offsetX = target.x - startX;
      const offsetY = target.y - startY;
      const length = Math.hypot(offsetX, offsetY) || 1;
      const arc = Math.sin(Math.PI * eased) * bend;
      cursor.x = startX + offsetX * eased - (offsetY / length) * arc;
      cursor.y = startY + offsetY * eased + (offsetX / length) * arc;
      options.onStep?.();
    }
    const finalTarget = getDestination();
    cursor.x = finalTarget.x;
    cursor.y = finalTarget.y;
    options.onStep?.();
  }

  /**
   * 生成一次轻量按下反馈。
   * @param {object} cursor 当前工人。
   * @yields {undefined} 保持按下片刻。
   */
  *click(cursor) {
    // 图标缩放由渲染组件根据press值计算。
    cursor.press = 1;
    yield* this.wait(0.07);
  }

  /**
   * 逐字输入文字，并在空格、换行处保留自然停顿。
   * @param {object} element 文字对象。
   * @param {string} text 完整输入内容。
   * @param {boolean} replace 是否从首字开始替换已有文字。
   * @yields {undefined} 按字符节奏让出帧。
   */
  *type(element, text, replace = false) {
    // 每个字符都会增加版本号，保证打字过程及时显示。
    for (let index = 0; index < text.length; index++) {
      if (index === 0 && replace) element.shown = "";
      element.shown += text[index];
      element.selAll = false;
      markChanged(element);
      let pause = randomBetween(0.012, 0.04);
      if (text[index] === " ") pause += randomBetween(0, 0.03);
      if (text[index] === "\n") pause += 0.1;
      if (Math.random() < 0.025) pause += randomBetween(0.08, 0.2);
      yield* this.wait(pause);
    }
  }

  /**
   * 为等待工作的光标安排视口范围内的闲逛路径。
   * @param {object} cursor 空闲工人。
   * @yields {undefined} 持续闲逛，直到调度器分配任务。
   */
  *idle(cursor) {
    // 常驻工人在开场阶段保持轻微漂浮，不提前走出开场布局。
    if (!this.started && cursor.home) {
      const home = cursor.home;
      const phase = randomBetween(0, 6);
      while (!this.started) {
        cursor.x = home.x + Math.sin(this.time * 1.3 + phase) * 3;
        cursor.y = home.y + Math.cos(this.time * 1.7 + phase) * 2.5;
        yield;
      }
    }
    while (true) {
      const top = this.viewTop;
      const height = this.viewBot - top;
      const destination = {
        x: randomBetween(220, 1060),
        y: randomBetween(top + height * 0.2, top + height * 0.8),
      };
      yield* this.moveTo(cursor, destination, { speed: 0.35 });
      let remaining = randomBetween(0.4, 1.4);
      while (remaining > 0) {
        remaining -= yield;
        if (cursor.y < this.viewTop || cursor.y > this.viewBot) break;
      }
    }
  }

  /**
   * 将过量临时工人送到最近的屏幕边缘之外。
   * @param {object} cursor 即将离场的工人。
   * @yields {undefined} 离场动作完成后结束。
   */
  *leave(cursor) {
    // 按当前位置选择左右出口，纵坐标随滚动保持相对视口位置。
    const exitRight = cursor.x > PAGE_WIDTH / 2;
    yield* this.moveTo(
      cursor,
      () =>
        this.fromViewport(
          exitRight ? this.vp.vw + 60 : -60,
          (cursor.y - this.viewTop) * this.vp.s
        ),
      { speed: 0.8 }
    );
  }

  /**
   * 根据任务类型创建绘制生成器。
   * @param {object} cursor 领取任务的工人。
   * @param {object} task 任务定义及状态。
   * @returns {Generator} 逐帧推进的绘制动作。
   */
  run(cursor, task) {
    // 调度器只关注生命周期，具体绘制动作由DrawingEngine实现。
    const spec = task.spec;
    switch (spec.type) {
      case TaskType.PATH:
        return this.drawPath(cursor, this.els.get(spec.el));
      case TaskType.RECTANGLE:
        return this.drawRect(cursor, this.els.get(spec.el));
      case TaskType.TEXT:
        return this.drawText(
          cursor,
          this.els.get(spec.el),
          spec.snap ? this.els.get(spec.snap) : null,
          Boolean(spec.grow)
        );
      case TaskType.GUIDE:
        return this.dragGuide(cursor, this.els.get(spec.el));
      case TaskType.DUPLICATE:
        return this.duplicate(cursor, this.groups.get(spec.group), spec.k);
      case TaskType.EDIT_TEXT:
        return this.editText(cursor, this.els.get(spec.el));
      default:
        throw new Error(`不支持的施工任务类型：${spec.type}`);
    }
  }
}
