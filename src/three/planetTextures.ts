/**
 * 行星表面贴图。
 *
 * 策略：优先加载真实星球照片（public/textures/planets/<id>.jpg，
 * Solar System Scope 2K 贴图，NASA 数据，CC BY），保证「炫技」真实感；
 * 文件缺失 / 离线 / 加载失败时回退到程序化斑驳贴图，预览永远不空。
 * 照片加载是异步的：先返回同步兜底贴图，到位后通过 onReal 回调替换材质 uniform。
 */
import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const cache = new Map<string, THREE.Texture>();

function shade(hex: string, factor: number): string {
  const c = new THREE.Color(hex);
  c.multiplyScalar(factor);
  return `#${c.getHexString()}`;
}

/** 程序化斑驳兜底（按行星品牌色着色，离线/缺图时使用）。 */
function makeMottle(base: string, darkFactor: number, lightFactor: number, blobs: number): THREE.CanvasTexture {
  const S = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = shade(base, darkFactor);
  ctx.fillRect(0, 0, S, S);
  for (let i = 0; i < blobs; i++) {
    const x = Math.random() * S;
    const y = Math.random() * S;
    const r = 4 + Math.random() * 38;
    const f = lightFactor - Math.random() * (lightFactor - darkFactor);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = shade(base, f);
    ctx.globalAlpha = 0.5 + Math.random() * 0.5;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * 获取行星贴图。同步返回兜底贴图，真实照片异步加载完成后通过 onReal 回调交出，
 * 由调用方替换 ShaderMaterial 的 uTex uniform。
 */
export function getPlanetTexture(
  id: string,
  color: string,
  onReal?: (tex: THREE.Texture) => void,
): THREE.Texture {
  const existing = cache.get(id);
  if (existing) return existing;

  const fallback = makeMottle(color, 0.45, 1.35, 180);
  cache.set(id, fallback);

  const url = `${import.meta.env.BASE_URL}textures/planets/${id}.jpg`;
  loader.load(
    url,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      cache.set(id, tex);
      fallback.dispose();
      onReal?.(tex);
    },
    undefined,
    () => {
      /* 加载失败：保留程序化兜底 */
    },
  );

  return fallback;
}
