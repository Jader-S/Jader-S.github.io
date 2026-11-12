import { describe, it, expect } from 'vitest';
import {
  createSim,
  resetSim,
  getStation,
  setStationRate,
  stepSim,
  PHASE_DURATION,
  RATE_MAX,
  RATE_MIN,
  STATION_IDS,
  type SimState,
} from './sim';
import {
  ARM,
  GRIP_LEN,
  STATION_LAYOUT,
  cycleGeom,
  dockOf,
  fkGripLocal,
  liftFor,
  liftYAt,
  poseAt,
  poseTarget,
  railXAt,
} from './layout';

function putPart(sim: SimState, stationId: 'P1' | 'P2' | 'P3', id: string) {
  const s = getStation(sim, stationId);
  s.partId = id;
  sim.parts[id] = { id, location: { type: 'station', id: stationId } };
}

function putStartPart(sim: SimState, id: string) {
  const s = getStation(sim, 'START');
  s.partId = id;
  sim.parts[id] = { id, location: { type: 'station', id: 'START' } };
}

function advance(sim: SimState, seconds: number) {
  const steps = Math.round(seconds / 0.05);
  for (let i = 0; i < steps; i++) stepSim(sim, 0.05);
}

describe('createSim / resetSim', () => {
  it('builds 5 staggered stations + 2 rail robots in idle state', () => {
    const sim = createSim();
    expect(sim.stations.map((s) => s.id)).toEqual(['START', 'P1', 'P2', 'P3', 'END']);
    expect(sim.robots.map((r) => r.id)).toEqual(['R1', 'R2']);
    expect(sim.robots.every((r) => r.phase === 'IDLE')).toBe(true);
    expect(sim.stations.every((s) => s.partId === null)).toBe(true);
    expect(sim.finished).toBe(0);
  });

  it('resetSim restores defaults in place', () => {
    const sim = createSim();
    sim.finished = 9;
    getStation(sim, 'P1').rate = 1.7;
    const ref = sim;
    resetSim(sim);
    expect(sim).toBe(ref);
    expect(sim.finished).toBe(0);
    expect(getStation(sim, 'P1').rate).toBe(1);
  });

  it('setStationRate clamps to the allowed range and ignores START/END', () => {
    const sim = createSim();
    setStationRate(sim, 'P1', 99);
    expect(getStation(sim, 'P1').rate).toBe(RATE_MAX);
    setStationRate(sim, 'P1', -5);
    expect(getStation(sim, 'P1').rate).toBe(RATE_MIN);
    setStationRate(sim, 'START', 0.5);
    expect(getStation(sim, 'START').rate).toBe(1);
  });
});

describe('工位排布：间距 / 交错 / 高低差', () => {
  it('沿 X 拉开间距且 Z 交错分布在轨道两侧', () => {
    const ds = STATION_IDS.map((id) => STATION_LAYOUT[id]);
    expect(ds[0].z * ds[1].z).toBeLessThan(0);
    expect(ds[1].z * ds[2].z).toBeLessThan(0);
    expect(ds[2].z * ds[3].z).toBeLessThan(0);
    for (let i = 1; i < ds.length; i++) {
      expect(ds[i].x - ds[i - 1].x).toBeGreaterThanOrEqual(5);
    }
  });

  it('料台存在高低差，但全部落在机械臂可达范围内', () => {
    const decks = STATION_IDS.map((id) => STATION_LAYOUT[id].deckY);
    expect(Math.max(...decks) - Math.min(...decks)).toBeGreaterThan(0.4);
    for (const id of STATION_IDS) {
      const dock = dockOf(id);
      const lift = liftFor(dock.deckY);
      const h = dock.y - (ARM.baseY + lift);
      const d = Math.hypot(Math.abs(dock.z), h + GRIP_LEN);
      expect(d).toBeLessThan(ARM.L1 + ARM.L2);
    }
  });
});

describe('地轨机械手动态调度', () => {
  it('R1 认领左半段 START→P1，R2 保持待命', () => {
    const sim = createSim();
    putStartPart(sim, 'p0');
    stepSim(sim, 0.05);
    expect(sim.robots[0].phase).toBe('APPROACH');
    expect(sim.robots[0].carryFrom).toBe('START');
    expect(sim.robots[0].carryTo).toBe('P1');
    expect(sim.robots[1].phase).toBe('IDLE');
  });

  it('R2 认领右半段 P2→P3', () => {
    const sim = createSim();
    putPart(sim, 'P2', 'a');
    const p2 = getStation(sim, 'P2');
    p2.state = 'WAIT_OUT';
    p2.progress = 1;
    stepSim(sim, 0.05);
    expect(sim.robots[1].carryFrom).toBe('P2');
    expect(sim.robots[1].carryTo).toBe('P3');
    expect(sim.robots[0].phase).toBe('IDLE');
  });

  it('P2 已占用时 R2 会跳过 P2→P3，改认领 P3→END', () => {
    const sim = createSim();
    putPart(sim, 'P3', 'b');
    const p3 = getStation(sim, 'P3');
    p3.state = 'WAIT_OUT';
    p3.progress = 1;
    stepSim(sim, 0.05);
    expect(sim.robots[1].carryFrom).toBe('P3');
    expect(sim.robots[1].carryTo).toBe('END');
  });
});

describe('轨道行走 / 立柱升降 / IK 姿态', () => {
  const g = cycleGeom('START', 'P1', -5.4);

  it('滑台沿轨道：停泊 → 源工位 → 目标工位 → 回停泊', () => {
    expect(railXAt('IDLE', 0, g)).toBe(-5.4);
    expect(railXAt('APPROACH', PHASE_DURATION.APPROACH, g)).toBeCloseTo(STATION_LAYOUT.START.x);
    expect(railXAt('LIFT', 0, g)).toBeCloseTo(STATION_LAYOUT.START.x);
    expect(railXAt('TRANSFER', PHASE_DURATION.TRANSFER, g)).toBeCloseTo(STATION_LAYOUT.P1.x);
    expect(railXAt('RETRACT', PHASE_DURATION.RETRACT, g)).toBeCloseTo(-5.4);
  });

  it('立柱在源/目标料台之间升降，回程归零', () => {
    expect(liftYAt('IDLE', 0, g)).toBe(0);
    expect(liftYAt('GRIP', 0, g)).toBeCloseTo(liftFor(STATION_LAYOUT.START.deckY));
    expect(liftYAt('RELEASE', 0, g)).toBeCloseTo(liftFor(STATION_LAYOUT.P1.deckY));
    expect(liftYAt('RETRACT', PHASE_DURATION.RETRACT, g)).toBeCloseTo(0);
  });

  it('取料 IK 让夹爪挂点精确落在料台零件中心，且末端竖直朝下', () => {
    const p = poseTarget('APPROACH', g);
    const fk = fkGripLocal(p);
    const lift = liftFor(g.src.deckY);
    const expectedR = Math.abs(g.src.z);
    const expectedH = g.src.y - (ARM.baseY + lift);
    expect(Math.hypot(fk.r - expectedR, fk.y - expectedH)).toBeLessThan(0.02);
    expect(Math.cos(p.j2 + p.j3 + p.j4)).toBeCloseTo(-1, 3);
  });

  it('TRANSFER 阶段底座从工位一侧大角度回转到另一侧', () => {
    const start = poseAt('TRANSFER', 0).j1;
    const end = poseAt('TRANSFER', PHASE_DURATION.TRANSFER).j1;
    expect(Math.abs(end - start)).toBeGreaterThan(2);
  });
});

describe('工序协同门控（用户核心约束）', () => {
  it('加工完成后停在 WAIT_OUT，不会自动开始下一件', () => {
    const sim = createSim();
    const p1 = getStation(sim, 'P1');
    putPart(sim, 'P1', 'x');
    p1.state = 'PROCESSING';
    p1.progress = 0.99;

    stepSim(sim, 0.05);
    expect(p1.state).toBe('WAIT_OUT');
    expect(p1.progress).toBe(1);

    // 0.5s 内机械手仍在 APPROACH，工位必须保持「等待搬离」
    advance(sim, 0.5);
    expect(p1.state).toBe('WAIT_OUT');
    expect(p1.progress).toBe(1);
    expect(p1.partId).toBe('x');
  });

  it('成品被搬走后仍停在 WAIT_IN，必须等上游放料才开工', () => {
    const sim = createSim();
    const p1 = getStation(sim, 'P1');
    p1.partId = null;
    p1.state = 'WAIT_IN';
    p1.progress = 0;

    advance(sim, 0.5);
    expect(p1.state).toBe('WAIT_IN');
    expect(p1.progress).toBe(0);

    putPart(sim, 'P1', 'z');
    stepSim(sim, 0.05);
    expect(p1.state).toBe('PROCESSING');
  });

  it('目标工位被占用时，机械手不会启动搬运', () => {
    const sim = createSim();
    putPart(sim, 'P1', 'x');
    const p1 = getStation(sim, 'P1');
    p1.state = 'WAIT_OUT';
    p1.progress = 1;
    putPart(sim, 'P2', 'y');
    const p2 = getStation(sim, 'P2');
    p2.state = 'PROCESSING';
    p2.progress = 0.1;

    stepSim(sim, 0.05);
    expect(sim.robots[0].phase).toBe('IDLE');
    expect(sim.robots[1].phase).toBe('IDLE');
    expect(p1.state).toBe('WAIT_OUT');
  });
});

describe('进度由生产频率控制', () => {
  it('rate 越大，同样时间内进度推进越快，且改动立即生效', () => {
    const fast = createSim();
    const slow = createSim();
    putPart(fast, 'P1', 'a');
    putPart(slow, 'P1', 'b');
    getStation(fast, 'P1').state = 'PROCESSING';
    getStation(slow, 'P1').state = 'PROCESSING';
    setStationRate(fast, 'P1', 2);
    setStationRate(slow, 'P1', 0.5);

    stepSim(fast, 0.05);
    stepSim(slow, 0.05);
    expect(getStation(fast, 'P1').progress).toBeCloseTo(0.1);
    expect(getStation(slow, 'P1').progress).toBeCloseTo(0.025);

    setStationRate(slow, 'P1', 2);
    const before = getStation(slow, 'P1').progress;
    stepSim(slow, 0.05);
    expect(getStation(slow, 'P1').progress - before).toBeCloseTo(0.1);
  });

  it('progress 达到 1 后转到 WAIT_OUT', () => {
    const sim = createSim();
    putPart(sim, 'P1', 'a');
    const p1 = getStation(sim, 'P1');
    p1.state = 'PROCESSING';
    p1.progress = 0.98;
    stepSim(sim, 0.05);
    expect(p1.state).toBe('WAIT_OUT');
    expect(p1.progress).toBe(1);
  });
});

describe('端到端流转', () => {
  it('零件最终从 START 流经三道工序到达 END 并计数', () => {
    const sim = createSim();
    sim.timeScale = 2;
    advance(sim, 200);
    expect(sim.finished).toBeGreaterThan(0);
    expect(sim.nextPartSeq).toBeGreaterThan(sim.finished);
  });

  it('paused 时状态完全冻结', () => {
    const sim = createSim();
    advance(sim, 3);
    sim.paused = true;
    const snapshot = JSON.stringify(sim);
    advance(sim, 5);
    expect(JSON.stringify(sim)).toBe(snapshot);
  });
});

describe('poseAt 关节插值', () => {
  it('IDLE 保持待机姿态，夹爪张开', () => {
    const p = poseAt('IDLE', 0);
    expect(p.grip).toBe(1);
    expect(p.j1).toBe(0);
  });

  it('GRIP 阶段夹爪从张开平滑收到闭合', () => {
    expect(poseAt('GRIP', 0).grip).toBe(1);
    expect(poseAt('GRIP', PHASE_DURATION.GRIP).grip).toBe(0);
    const mid = poseAt('GRIP', PHASE_DURATION.GRIP / 2).grip;
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
  });
});
