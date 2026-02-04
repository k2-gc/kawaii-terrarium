import type { MofuConfig } from './types';

export const fox1Config: MofuConfig = {
  id: 'fox1',
  name: 'Fox',
  frameCount: 8,
  width: 70,
  height: 70,
  animations: {
    greeting: [0, 1, 0, 1],
    walk: [2, 3, 4, 5],
    idleFront: [6, 7, 6, 7],
  },
  direction: 'left',
  animationSpeeds: {
    walk: 0.1,
    idleFront: 0.05,
    idleBack: 0.05,
    greeting: 0.1,
  },
};
