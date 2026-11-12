/**
 * 会议编排 · 周视图看板（纯前端，无后端）。
 *
 * 思路：把你 git 上 echarts-demo 的 `Board.vue` 的数据模型 / 拖拽改期 /
 * 冲突检测 / 多房间多角色逻辑移植到 React，渲染层改用 React + CSS 周视图
 * （不再依赖 echarts，避免给 ASTRA 加重依赖与联网装包风险，且更贴合霓虹风）。
 *
 * 功能：
 *  - 管理员 / 访客 双角色（无后端，纯前端切换）
 *  - 多会议室（A/B/C），卡片按房间着色
 *  - 新建 / 编辑 / 删除会议（抽屉式表单）
 *  - 拖拽改期：吸附到 15 分钟 + 跨天，自动重算
 *  - 同会议室时间冲突高亮
 *  - localStorage 持久化（纯前端）
 */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type CSSProperties,
} from 'react';
import './ConferenceBoard.css';

type Role = 'admin' | 'viewer';

interface Conf {
  id: string;
  theme: string;
  host: string;
  room: string;
  /** 0..6 周一到周日 */
  day: number;
  /** 距零点分钟数，如 9:30 -> 570 */
  start: number;
  end: number;
}

const ROOMS = [
  { name: '会议室 A', color: '#22d3ee' },
  { name: '会议室 B', color: '#a855f7' },
  { name: '会议室 C', color: '#f59e0b' },
];

const DAY_START = 8 * 60; // 08:00
const DAY_END = 24 * 60; // 24:00
const PX_PER_MIN = 0.9;
const SNAP = 15;
const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // 周日为 0 -> 转成 周一为0
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}

function weekDates() {
  const s = startOfWeek();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    return d;
  });
}

function hhmm(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function parseTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function uid() {
  return 'c_' + Math.random().toString(36).slice(2, 9);
}

const SEED: Conf[] = [
  { id: uid(), theme: '需求评审', host: 'Jader', room: '会议室 A', day: 0, start: 9 * 60, end: 10 * 60 + 30 },
  { id: uid(), theme: '架构对齐', host: '李工', room: '会议室 B', day: 0, start: 14 * 60, end: 15 * 60 },
  { id: uid(), theme: '周会', host: 'Jader', room: '会议室 A', day: 2, start: 10 * 60, end: 11 * 60 },
  { id: uid(), theme: '客户演示', host: '王经理', room: '会议室 C', day: 3, start: 13 * 60 + 30, end: 15 * 60 },
  { id: uid(), theme: '复盘', host: '赵磊', room: '会议室 B', day: 4, start: 16 * 60, end: 17 * 60 },
];

interface DragCtx {
  id: string;
  offsetX: number;
  offsetY: number;
  colW: number;
  rectTop: number;
  rectLeft: number;
  duration: number;
  startX: number;
  startY: number;
  dayInit: number;
  startInit: number;
  moved: boolean;
}

export default function ConferenceBoard() {
  const [role, setRole] = useState<Role>(() =>
    (localStorage.getItem('astra-role') as Role) || 'admin',
  );
  const [confs, setConfs] = useState<Conf[]>(() => {
    try {
      const r = localStorage.getItem('astra-conferences');
      if (r) return JSON.parse(r);
    } catch {
      /* ignore */
    }
    return SEED;
  });
  const [editing, setEditing] = useState<Conf | null | 'new'>(null);
  const daysRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragCtx | null>(null);
  const movedRef = useRef(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [ghost, setGhost] = useState<{ day: number; start: number; end: number } | null>(null);

  const dates = useMemo(weekDates, []);

  useEffect(() => {
    localStorage.setItem('astra-conferences', JSON.stringify(confs));
  }, [confs]);
  useEffect(() => {
    localStorage.setItem('astra-role', role);
  }, [role]);

  // 冲突检测：
  //  1) 同会议室 + 同天 + 时间重叠 -> 会议室被双重占用
  //  2) 同名主持人 + 同天 + 时间重叠 -> 人分身乏术（与会议室无关）
  const conflicts = useMemo(() => {
    const s = new Set<string>();
    // 1) 按会议室检测
    ROOMS.forEach((room) => {
      const list = confs.filter((c) => c.room === room.name);
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i];
          const b = list[j];
          if (a.day === b.day && a.start < b.end && b.start < a.end) {
            s.add(a.id);
            s.add(b.id);
          }
        }
      }
    });
    // 2) 按主持人检测（空主持人不参与，避免互相误判）
    const hosts = Array.from(new Set(confs.map((c) => c.host?.trim()).filter(Boolean) as string[]));
    hosts.forEach((h) => {
      const list = confs.filter((c) => c.host?.trim() === h);
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i];
          const b = list[j];
          if (a.day === b.day && a.start < b.end && b.start < a.end) {
            s.add(a.id);
            s.add(b.id);
          }
        }
      }
    });
    return s;
  }, [confs]);

  // 重叠层叠深度：同列（会议室+天）时间重叠的卡片，按开始时间排序后，
  // 统计它之前有多少张与之重叠的卡片 -> depth。depth 越大越靠上、越向右错位，
  // 露出下层卡片的左边缘，直观呈现「层叠遮盖」；hover 时该卡置顶并高亮。
  const stackDepth = useMemo(() => {
    const m = new Map<string, number>();
    for (let di = 0; di < 7; di++) {
      const dayCards = confs
        .filter((c) => c.day === di)
        .sort((a, b) => a.start - b.start || a.id.localeCompare(b.id));
      dayCards.forEach((c, i) => {
        let depth = 0;
        for (let j = 0; j < i; j++) {
          if (dayCards[j].start < c.end && c.start < dayCards[j].end) depth++;
        }
        m.set(c.id, depth);
      });
    }
    return m;
  }, [confs]);

  // 全局拖拽监听
  useEffect(() => {
    function move(e: PointerEvent) {
      const d = dragRef.current;
      if (!d) return;
      // 未超过阈值：视为点击，不进入拖拽
      if (!d.moved) {
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        if (Math.hypot(dx, dy) < 4) return;
        d.moved = true;
        movedRef.current = true;
        setDraggingId(d.id);
        setGhost({ day: d.dayInit, start: d.startInit, end: d.startInit + d.duration });
      }
      const cardLeft = e.clientX - d.rectLeft - d.offsetX;
      const cardTop = e.clientY - d.rectTop - d.offsetY;
      let day = Math.round(cardLeft / d.colW);
      day = Math.max(0, Math.min(6, day));
      let start = DAY_START + cardTop / PX_PER_MIN;
      start = Math.round((start - DAY_START) / SNAP) * SNAP + DAY_START;
      start = Math.max(DAY_START, Math.min(DAY_END - d.duration, start));
      setGhost({ day, start, end: start + d.duration });
    }
    function up() {
      const d = dragRef.current;
      if (!d) return;
      if (d.moved) {
        setGhost((g) => {
          if (g) {
            setConfs((cs) =>
              cs.map((c) => (c.id === d.id ? { ...c, day: g.day, start: g.start, end: g.end } : c)),
            );
          }
          return null;
        });
      }
      dragRef.current = null;
      setDraggingId(null);
      // 注意：movedRef 留给 onClick 消费后再清，这里不动
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  function onCardPointerDown(e: ReactPointerEvent, c: Conf) {
    if (role !== 'admin') return;
    e.preventDefault();
    const days = daysRef.current;
    if (!days) return;
    const rect = days.getBoundingClientRect();
    const colW = rect.width / 7;
    const cardTop = rect.top + (c.start - DAY_START) * PX_PER_MIN;
    const offsetX = e.clientX - (rect.left + c.day * colW);
    const offsetY = e.clientY - cardTop;
    movedRef.current = false;
    dragRef.current = {
      id: c.id,
      offsetX,
      offsetY,
      colW,
      rectTop: rect.top,
      rectLeft: rect.left,
      duration: c.end - c.start,
      startX: e.clientX,
      startY: e.clientY,
      dayInit: c.day,
      startInit: c.start,
      moved: false,
    };
  }

  function reset() {
    setConfs(SEED.map((c) => ({ ...c, id: uid() })));
  }

  // 表单
  const [form, setForm] = useState<Conf | null>(null);
  function openNew() {
    setForm({ id: uid(), theme: '', host: '', room: ROOMS[0].name, day: 0, start: 9 * 60, end: 10 * 60 });
    setEditing('new');
  }
  function openEdit(c: Conf) {
    if (role !== 'admin') return;
    setForm({ ...c });
    setEditing(c);
  }
  function saveForm() {
    if (!form) return;
    if (!form.theme.trim()) return;
    if (form.end <= form.start) return;
    setConfs((cs) => {
      const exists = cs.some((c) => c.id === form.id);
      return exists ? cs.map((c) => (c.id === form.id ? form : c)) : [...cs, form];
    });
    setEditing(null);
    setForm(null);
  }
  function delForm() {
    if (!form) return;
    setConfs((cs) => cs.filter((c) => c.id !== form.id));
    setEditing(null);
    setForm(null);
  }

  const trackHeight = (DAY_END - DAY_START) * PX_PER_MIN;

  return (
    <div className="cb">
      {/* 工具栏 */}
      <div className="cb-toolbar">
        <div className="cb-toolbar__group">
          <span className="cb-toolbar__label">角色</span>
          <button
            type="button"
            className={`cb-chip ${role === 'admin' ? 'is-on' : ''}`}
            onClick={() => setRole('admin')}
          >
            管理员
          </button>
          <button
            type="button"
            className={`cb-chip ${role === 'viewer' ? 'is-on' : ''}`}
            onClick={() => setRole('viewer')}
          >
            访客
          </button>
        </div>

        <div className="cb-toolbar__group cb-legend">
          {ROOMS.map((r) => (
            <span className="cb-legend__item" key={r.name}>
              <i style={{ background: r.color }} />
              {r.name}
            </span>
          ))}
        </div>

        <div className="cb-toolbar__group cb-toolbar__right">
          <span className={`cb-conflict ${conflicts.size ? 'is-bad' : ''}`}>
            冲突 {conflicts.size}
          </span>
          <button type="button" className="cb-chip" onClick={reset}>
            重置
          </button>
          <button
            type="button"
            className="cb-btn"
            disabled={role !== 'admin'}
            onClick={openNew}
          >
            + 新建会议
          </button>
        </div>
      </div>

      {role === 'viewer' && (
        <div className="cb-hint">访客模式：仅可查看，不可拖拽 / 编辑。</div>
      )}

      {/* 看板 */}
      <div className="cb-board">
        <div className="cb-corner">时间</div>
        <div className="cb-days-head">
          {dates.map((d, i) => (
            <div className="cb-day-head" key={i}>
              <span className="cb-day-head__wd">{WEEKDAYS[i]}</span>
              <span className="cb-day-head__dt">
                {d.getMonth() + 1}/{d.getDate()}
              </span>
            </div>
          ))}
        </div>

        <div className="cb-axis" style={{ height: trackHeight }}>
          {Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, h) => (
            <div className="cb-axis__tick" key={h} style={{ top: h * 60 * PX_PER_MIN }}>
              {hhmm(DAY_START + h * 60)}
            </div>
          ))}
        </div>

        <div className="cb-days" ref={daysRef} style={{ height: trackHeight }}>
          {WEEKDAYS.map((_, di) => (
            <div className="cb-col" key={di}>
              {/* 网格线 */}
              {Array.from({ length: (DAY_END - DAY_START) / 60 }, (_, h) => (
                <div className="cb-col__grid" key={h} style={{ top: h * 60 * PX_PER_MIN }} />
              ))}

              {/* 真实卡片 */}
              {confs
                .filter((c) => c.day === di)
                .map((c) => {
                  const room = ROOMS.find((r) => r.name === c.room);
                  const isConflict = conflicts.has(c.id);
                  const isDragging = draggingId === c.id;
                  const depth = stackDepth.get(c.id) ?? 0;
                  const offset = Math.min(depth, 4) * 9;
                  return (
                    <div
                      key={c.id}
                      className={`cb-card ${isConflict ? 'is-conflict' : ''} ${
                        isDragging ? 'is-dragging' : ''
                      }`}
                      style={{
                        top: (c.start - DAY_START) * PX_PER_MIN,
                        height: (c.end - c.start) * PX_PER_MIN,
                        left: 4 + offset,
                        zIndex: 10 + depth,
                        ['--room']: room?.color,
                      } as CSSProperties}
                      onPointerDown={(e) => onCardPointerDown(e, c)}
                      onClick={() => {
                        if (movedRef.current) {
                          movedRef.current = false; // 这是拖拽产生的点击，吞掉，不弹编辑
                          return;
                        }
                        openEdit(c);
                      }}
                    >
                      <div className="cb-card__title">{c.theme}</div>
                      <div className="cb-card__meta">
                        {c.host} · {c.room}
                      </div>
                      <div className="cb-card__time">
                        {hhmm(c.start)}–{hhmm(c.end)}
                      </div>
                      {isConflict && <span className="cb-card__badge">冲突</span>}
                    </div>
                  );
                })}

              {/* 拖拽预览幽灵 */}
              {ghost && draggingId && ghost.day === di && (
                <div
                  className="cb-card cb-card--ghost"
                  style={{
                    top: (ghost.start - DAY_START) * PX_PER_MIN,
                    height: (ghost.end - ghost.start) * PX_PER_MIN,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 表单抽屉 */}
      {editing && form && (
        <div className="cb-modal" onClick={() => setEditing(null)}>
          <div className="cb-modal__panel" onClick={(e) => e.stopPropagation()}>
            <h3 className="cb-modal__title">{editing === 'new' ? '新建会议' : '编辑会议'}</h3>
            <label className="cb-field">
              <span>主题</span>
              <input
                value={form.theme}
                onChange={(e) => setForm({ ...form, theme: e.target.value })}
                placeholder="如：需求评审"
              />
            </label>
            <label className="cb-field">
              <span>主持人</span>
              <input
                value={form.host}
                onChange={(e) => setForm({ ...form, host: e.target.value })}
                placeholder="如：Jader"
              />
            </label>
            <label className="cb-field">
              <span>会议室</span>
              <select
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
              >
                {ROOMS.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="cb-field">
              <span>日期</span>
              <select
                value={form.day}
                onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}
              >
                {WEEKDAYS.map((w, i) => (
                  <option key={i} value={i}>
                    {w}（{dates[i].getMonth() + 1}/{dates[i].getDate()}）
                  </option>
                ))}
              </select>
            </label>
            <div className="cb-field cb-field--row">
              <label>
                <span>开始</span>
                <input
                  type="time"
                  step={900}
                  value={hhmm(form.start)}
                  onChange={(e) => setForm({ ...form, start: parseTime(e.target.value) })}
                />
              </label>
              <label>
                <span>结束</span>
                <input
                  type="time"
                  step={900}
                  value={hhmm(form.end)}
                  onChange={(e) => setForm({ ...form, end: parseTime(e.target.value) })}
                />
              </label>
            </div>

            <div className="cb-modal__actions">
              {editing !== 'new' && (
                <button type="button" className="cb-btn cb-btn--danger" onClick={delForm}>
                  删除
                </button>
              )}
              <span className="cb-spacer" />
              <button type="button" className="cb-chip" onClick={() => setEditing(null)}>
                取消
              </button>
              <button type="button" className="cb-btn" onClick={saveForm}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
