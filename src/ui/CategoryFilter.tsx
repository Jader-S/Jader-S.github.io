/**
 * CategoryFilter — 作品 / 实验室 的「分类」统一入口。
 *
 * 设计（呼应评审结论）：
 *  - 桌面端：顶部横向 chips（单层），点击即筛选，宽屏平铺无压力。
 *  - 移动端：一个「分类 ▾」触发按钮 → 底部抽屉（bottom sheet），
 *    支持**多级下钻**（branch 可继续展开 children，leaf 触发 onPick），
 *    层级随意嵌套、可返回上层 —— 满足「手机可多级嵌套弹出、不强行平铺」。
 *  - 两端共享同一份 CatNode 树，保证一致。
 *
 * onPick(node)：
 *  - 桌面点击 branch / 全部 → 由页面决定筛选
 *  - 移动端点击 leaf（无 children）→ 由页面决定跳转 / 选中
 */
import { useEffect, useState } from 'react';
import './CategoryFilter.css';

export interface CatNode {
  key: string;
  label: string;
  children?: CatNode[];
}

interface Props {
  tree: CatNode[];
  /** 当前选中的顶层 key（桌面 chips 高亮用），如 'all' 或某 group key */
  activeKey: string;
  /** 选中节点（顶层 branch 或 leaf）时的回调 */
  onPick: (node: CatNode) => void;
  /** 移动端触发按钮文字 */
  triggerLabel?: string;
}

function useIsMobile(breakpoint = 760) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [breakpoint]);
  return isMobile;
}

export default function CategoryFilter({ tree, activeKey, onPick, triggerLabel }: Props) {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stack, setStack] = useState<CatNode[][]>([tree]);

  const openDrawer = () => {
    setStack([tree]);
    setDrawerOpen(true);
  };
  const pushLevel = (children: CatNode[]) => setStack((s) => [...s, children]);
  const popLevel = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const currentLevel = stack[stack.length - 1] ?? tree;

  if (!isMobile) {
    // 桌面：横向 chips（单层）
    return (
      <div className="cat-filter cat-filter--desktop">
        {tree.map((n) => (
          <button
            key={n.key}
            type="button"
            className="cat-chip"
            data-active={n.key === activeKey}
            onClick={() => onPick(n)}
          >
            {n.label}
            {n.children && n.children.length > 0 ? ` (${n.children.length})` : ''}
          </button>
        ))}
      </div>
    );
  }

  // 移动端：触发按钮 + 多级下钻抽屉
  return (
    <>
      <button type="button" className="cat-filter__trigger" onClick={openDrawer}>
        {triggerLabel ?? '分类 ▾'}
      </button>
      {drawerOpen && (
        <div className="cat-drawer" onClick={() => setDrawerOpen(false)}>
          <div className="cat-drawer__sheet" onClick={(e) => e.stopPropagation()}>
            <div className="cat-drawer__head">
              {stack.length > 1 ? (
                <button type="button" className="cat-drawer__back" onClick={popLevel}>
                  ‹ 返回
                </button>
              ) : (
                <span className="cat-drawer__spacer" />
              )}
              <span className="cat-drawer__title">
                {stack.length > 1 ? currentLevelTitle(stack) : (triggerLabel ?? '分类')}
              </span>
              <button type="button" className="cat-drawer__close" onClick={() => setDrawerOpen(false)}>
                ✕
              </button>
            </div>
            <ul className="cat-drawer__list">
              {currentLevel.length === 0 && <li className="cat-drawer__empty">暂无</li>}
              {currentLevel.map((n) => (
                <li key={n.key}>
                  <button
                    type="button"
                    className="cat-drawer__item"
                    onClick={() => {
                      if (n.children && n.children.length > 0) {
                        pushLevel(n.children);
                      } else {
                        onPick(n);
                        setDrawerOpen(false);
                      }
                    }}
                  >
                    <span>{n.label}</span>
                    {n.children && n.children.length > 0 && <span className="cat-drawer__chev">›</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

// 抽屉内层级标题：取上一层的父节点 label
function currentLevelTitle(stack: CatNode[][]) {
  if (stack.length < 2) return '';
  const parentLevel = stack[stack.length - 2];
  const childLevel = stack[stack.length - 1];
  const parent = parentLevel.find((p) => p.children === childLevel);
  return parent?.label ?? '';
}
