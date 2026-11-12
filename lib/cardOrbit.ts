import { basePath } from "@/lib/site";

/** Shared demo frames for Classic / Atelier hero card-orbit. */
export const ORBIT_IMAGES = Array.from(
  { length: 7 },
  (_, i) => `${basePath}/card-orbit/heroimg${i + 1}.webp`
);
