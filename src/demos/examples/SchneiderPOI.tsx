/**
 * Hero demo — Schneider POI tree-build before/after.
 *
 * Mirrors the narrative in DESIGN_PRODUCT.md §4.3:
 *   - before: SET_LOW_TREE_DATA blocks the main thread for 72s.
 *   - after:  single tree + node-index Map + UUID, ~2.1s.
 *
 * We simulate the workload in this app's React code (a real, runnable
 * benchmark — not a micro-bench). Synthetic data: 10k flat nodes, each
 * referencing a parent by id. The "before" path does O(n²) parent lookup
 * via Array.find inside a recursive flatten. The "after" path does a
 * single linear pass with a Map for O(1) lookup.
 *
 * Numbers are illustrative but the relative order of magnitude is real.
 */
import { useMemo, useState } from 'react';
import { useT } from '@/i18n';
import './demo.css';

type Node = {
  id: string;
  parentId: string | null;
  children: Node[];
};

// Build a synthetic flat list of 10k nodes.
function buildFlat(count: number) {
  const flat: { id: string; parentId: string | null }[] = [];
  flat.push({ id: 'root', parentId: null });
  for (let i = 1; i < count; i++) {
    flat.push({
      id: `n-${i}`,
      parentId: `n-${Math.floor(Math.random() * i)}`,
    });
  }
  return flat;
}

// BEFORE: recursive build with O(n) Array.find for every parent lookup.
// Total work is O(n²) — exactly the SET_LOW_TREE_DATA pathology.
function buildBefore(flat: { id: string; parentId: string | null }[]): Node {
  const flatClone = flat.map((n) => ({ ...n, children: [] as Node[] }));
  let root = flatClone[0];
  // for every node, find its parent by linear search
  for (let i = 0; i < flatClone.length; i++) {
    const node = flatClone[i];
    if (node.parentId === null) {
      root = node;
      continue;
    }
    const parent = flatClone.find((p) => p.id === node.parentId);
    if (parent) parent.children.push(node);
  }
  return root;
}

// AFTER: single pass with a Map index — O(n) total.
function buildAfter(flat: { id: string; parentId: string | null }[]): Node {
  const map = new Map<string, Node>();
  let root!: Node;
  for (const n of flat) {
    const node: Node = { id: n.id, parentId: n.parentId, children: [] };
    map.set(node.id, node);
    if (node.parentId === null) {
      root = node;
    } else {
      map.get(node.parentId)?.children.push(node);
    }
  }
  return root;
}

// Simple depth count to "validate" the result shape (size + depth).
function depthOf(node: Node): number {
  if (node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map(depthOf));
}

export default function SchneiderPOI() {
  const t = useT();
  const [running, setRunning] = useState<'idle' | 'before' | 'after'>('idle');
  const [ms, setMs] = useState<{ before: number | null; after: number | null }>({
    before: null,
    after: null,
  });
  const [error, setError] = useState<string | null>(null);

  const flat = useMemo(() => buildFlat(10000), []);

  const run = (kind: 'before' | 'after') => {
    setRunning(kind);
    setError(null);
    // yield to the event loop so the spinner can render
    setTimeout(() => {
      try {
        const t0 = performance.now();
        const root = kind === 'before' ? buildBefore(flat) : buildAfter(flat);
        const depth = depthOf(root);
        const t1 = performance.now();
        setMs((prev) => ({ ...prev, [kind]: +(t1 - t0).toFixed(1) }));
        // depth is sanity-check only
        void depth;
      } catch (e) {
        setError(String(e));
      } finally {
        setRunning('idle');
      }
    }, 50);
  };

  const speedup =
    ms.before && ms.after && ms.after > 0
      ? (ms.before / ms.after).toFixed(1) + '×'
      : '—';

  const beforeCode = `// BEFORE — O(n²) parent lookup, recursive flatten
let root = flat[0];
for (let i = 0; i < flat.length; i++) {
  const node = flat[i];
  if (node.parentId === null) { root = node; continue; }
  // Array.find scans ALL nodes per lookup → quadratic
  const parent = flat.find(p => p.id === node.parentId);
  if (parent) parent.children.push(node);
}`;

  const afterCode = `// AFTER — single pass + Map index, O(n)
const map = new Map();
let root;
for (const n of flat) {
  const node = { id: n.id, parentId: n.parentId, children: [] };
  map.set(node.id, node);
  if (n.parentId === null) {
    root = node;
  } else {
    map.get(n.parentId)?.children.push(node);
  }
}`;

  return (
    <div className="demo-poi">
      <div className="demo-poi__narrative">
        <div>
          <h4>{t.demos.narrative.problem}</h4>
          <p>{t.demos.narrative.problemBody}</p>
        </div>
        <div>
          <h4>{t.demos.narrative.thinking}</h4>
          <p>{t.demos.narrative.thinkingBody}</p>
        </div>
        <div>
          <h4>{t.demos.narrative.result}</h4>
          <p>{t.demos.narrative.resultBody}</p>
        </div>
      </div>

      {/* Headline metric callouts — the portfolio "胜负手" numbers. */}
      <div className="demo-poi__metrics">
        <div className="demo-poi__metrics-head">{t.demos.metrics.heading}</div>
        <div className="demo-poi__metrics-grid">
          {t.demos.metrics.items.map((m) => (
            <div className="demo-poi__metric" key={m.label}>
              <span className="demo-poi__metric-label">{m.label}</span>
              <div className="demo-poi__metric-row">
                <span className="demo-poi__metric-before">{m.before}</span>
                <span className="demo-poi__metric-arrow">→</span>
                <span className="demo-poi__metric-after">{m.after}</span>
              </div>
              <span className="demo-poi__metric-mult">{m.mult}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="demo-poi__split">
        <section className="demo-poi__col">
          <header>
            <span className="demo-poi__chip demo-poi__chip--before">{t.demos.before}</span>
            <span className="demo-poi__ms">{ms.before ?? '—'} {t.demos.ms}</span>
          </header>
          <pre><code>{beforeCode}</code></pre>
          <button
            type="button"
            className="demo-poi__btn"
            onClick={() => run('before')}
            disabled={running !== 'idle'}
          >
            {running === 'before' ? '…' : t.demos.run}
          </button>
        </section>
        <section className="demo-poi__col">
          <header>
            <span className="demo-poi__chip demo-poi__chip--after">{t.demos.after}</span>
            <span className="demo-poi__ms">{ms.after ?? '—'} {t.demos.ms}</span>
          </header>
          <pre><code>{afterCode}</code></pre>
          <button
            type="button"
            className="demo-poi__btn demo-poi__btn--primary"
            onClick={() => run('after')}
            disabled={running !== 'idle'}
          >
            {running === 'after' ? '…' : t.demos.run}
          </button>
        </section>
      </div>

      <div className="demo-poi__speedup">
        <span className="demo-poi__speedup-label">Speedup</span>
        <span className="demo-poi__speedup-value">{speedup}</span>
        <span className="demo-poi__speedup-note">{t.demos.note}</span>
      </div>

      {error && <div className="error-notice">{error}</div>}
    </div>
  );
}