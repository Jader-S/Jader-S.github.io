/**
 * Shared morph timing. Particle positions/easing run on GPU;
 * CPU only advances the single uMorph clock.
 */
export const MORPH_MS = 1300;

/** Map continuous morph 0–1 → coarse phase label (for UI / camera hints). */
export function phaseFromMorph(
  morph: number
): "idle" | "explode" | "transit" | "reform" {
  if (morph <= 0 || morph >= 1) return "idle";
  if (morph < 0.32) return "explode";
  if (morph < 0.62) return "transit";
  return "reform";
}
