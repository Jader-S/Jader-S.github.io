interface VantaBirdsOptions {
  el: HTMLElement | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  THREE: any;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  scale?: number;
  scaleMobile?: number;
  backgroundColor?: number;
  color1?: number;
  color2?: number;
  colorMode?: string;
  birdSize?: number;
  wingSpan?: number;
  speedLimit?: number;
  separation?: number;
  alignment?: number;
  cohesion?: number;
  quantity?: number;
  forceAnimate?: boolean;
}

interface VantaBirdsEffect {
  destroy: () => void;
  resize?: () => void;
}

declare module "vanta/dist/vanta.birds.min" {
  export default function BIRDS(options: VantaBirdsOptions): VantaBirdsEffect;
}

/** Classic package: force CPU birds path (desktop GPGPU often renders a blank canvas). */
declare module "@/styles/classic/vendor/vanta.birds.cpu.min.js" {
  export default function BIRDS(options: VantaBirdsOptions): VantaBirdsEffect;
}

declare module "vanta/dist/vanta.net.min" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default function NET(options: Record<string, any>): {
    destroy: () => void;
    resize?: () => void;
  };
}

declare module "vanta/dist/vanta.cells.min" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default function CELLS(options: Record<string, any>): {
    destroy: () => void;
    resize?: () => void;
  };
}

declare module "vanta/dist/vanta.waves.min" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default function WAVES(options: Record<string, any>): {
    destroy: () => void;
    resize?: () => void;
  };
}

declare module "vanta/dist/vanta.clouds.min" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default function CLOUDS(options: Record<string, any>): {
    destroy: () => void;
    resize?: () => void;
  };
}

declare module "vanta/dist/vanta.trunk.min" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export default function TRUNK(options: Record<string, any>): {
    destroy: () => void;
    resize?: () => void;
  };
}
