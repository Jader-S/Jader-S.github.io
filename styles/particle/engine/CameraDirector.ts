import * as THREE from "three";

export type CameraPhase = "idle" | "explode" | "transit" | "reform";

interface Shot {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

const HOME: Shot = {
  position: new THREE.Vector3(0, 0, 1.85),
  lookAt: new THREE.Vector3(0, 0, 0),
};

const PEAK: Shot = {
  position: new THREE.Vector3(-0.1, 0.05, 2.05),
  lookAt: new THREE.Vector3(0.02, -0.01, 0),
};

function lerpShot(a: Shot, b: Shot, t: number): Shot {
  return {
    position: a.position.clone().lerp(b.position, t),
    lookAt: a.lookAt.clone().lerp(b.lookAt, t),
  };
}

/** Smooth continuous camera along the same morph clock as the GPU particles. */
export class CameraDirector {
  apply(camera: THREE.PerspectiveCamera, morph: number, reducedMotion: boolean) {
    if (reducedMotion || morph <= 0 || morph >= 1) {
      camera.position.copy(HOME.position);
      camera.lookAt(HOME.lookAt);
      return;
    }

    // Match GPU easeInOutCubic + sin envelope: push out mid-morph, ease home.
    const x = Math.min(1, Math.max(0, morph));
    const eased = x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const envelope = Math.sin(Math.PI * eased);
    const shot = lerpShot(HOME, PEAK, envelope);
    camera.position.copy(shot.position);
    camera.lookAt(shot.lookAt);
  }
}
