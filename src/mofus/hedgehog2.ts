import type { MofuConfig } from './types';

export const hedgehog2Config: MofuConfig = {
  id: 'hedgehog2',
  name: 'Hedgehog',
  frameCount: 8,
  width: 64,
  height: 64,
  animations: {
    greeting: [0, 1, 0, 1],
    walk: [2, 3, 4, 5],
    idleFront: [6, 7, 6, 7],
  },
  direction: 'left',
  animationSpeeds: {
    walk: 0.3,
    idleFront: 0.1,
    idleBack: 0.1,
    greeting: 0.15,
  },
};
