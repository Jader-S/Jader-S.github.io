export interface SampledCloud {
  positions: Float32Array;
  colors: Float32Array;
}

const MAX_SOURCE = 384;

function normalizePositions(positions: Float32Array) {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    minX = Math.min(minX, positions[i]);
    maxX = Math.max(maxX, positions[i]);
    minY = Math.min(minY, positions[i + 1]);
    maxY = Math.max(maxY, positions[i + 1]);
    minZ = Math.min(minZ, positions[i + 2]);
    maxZ = Math.max(maxZ, positions[i + 2]);
  }
  const cx = (minX + maxX) * 0.5;
  const cy = (minY + maxY) * 0.5;
  const cz = (minZ + maxZ) * 0.5;
  const inv = 1 / Math.max(maxX - minX, maxY - minY, maxZ - minZ, 1e-4);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (positions[i] - cx) * inv;
    positions[i + 1] = (positions[i + 1] - cy) * inv;
    positions[i + 2] = (positions[i + 2] - cz) * inv;
  }
}

function sampleImageData(data: ImageData, count: number): SampledCloud {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const pixels: number[] = [];
  const weights: number[] = [];
  let totalWeight = 0;
  for (let i = 0; i < data.width * data.height; i++) {
    const alpha = data.data[i * 4 + 3];
    if (alpha < 16) continue;
    totalWeight += alpha;
    pixels.push(i);
    weights.push(totalWeight);
  }

  if (pixels.length === 0) {
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
      colors[i * 3] = 0.35;
      colors[i * 3 + 1] = 0.55;
      colors[i * 3 + 2] = 0.6;
    }
    return { positions, colors };
  }

  const longest = Math.max(data.width, data.height);
  for (let i = 0; i < count; i++) {
    const pick = Math.random() * totalWeight;
    let lo = 0;
    let hi = weights.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (weights[mid] < pick) lo = mid + 1;
      else hi = mid;
    }
    const p = pixels[lo];
    const px = p % data.width;
    const py = Math.floor(p / data.width);
    positions[i * 3] = (px + Math.random() - data.width / 2) / longest;
    positions[i * 3 + 1] = -(py + Math.random() - data.height / 2) / longest;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
    colors[i * 3] = data.data[p * 4] / 255;
    colors[i * 3 + 1] = data.data[p * 4 + 1] / 255;
    colors[i * 3 + 2] = data.data[p * 4 + 2] / 255;
  }

  normalizePositions(positions);
  return { positions, colors };
}

export async function loadImageData(url: string): Promise<ImageData> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load particle asset: ${url}`));
    img.src = url;
  });

  const ratio = Math.min(
    1,
    MAX_SOURCE / Math.max(image.naturalWidth, image.naturalHeight)
  );
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2D canvas unavailable for particle sampling");
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

export async function sampleAsset(url: string, count: number): Promise<SampledCloud> {
  const data = await loadImageData(url);
  return sampleImageData(data, count);
}
