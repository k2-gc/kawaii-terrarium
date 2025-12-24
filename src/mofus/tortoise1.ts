import type { MofuConfig } from './types';

export const tortoise1Config: MofuConfig = {
  id: 'tortoise1',
  name: 'Tortoise',
  frameCount: 10,
  width: 64,
  height: 64,
  animations: {
    greeting: [0, 1, 0, 1],
    walk: [2, 3, 4, 5],
    idleFront: [6, 7, 8, 9],
  },
  direction: 'left',
  animationSpeeds: {
    walk: 0.05,
    idleFront: 0.1,
    idleBack: 0.1,
    greeting: 0.1,
  },
};
