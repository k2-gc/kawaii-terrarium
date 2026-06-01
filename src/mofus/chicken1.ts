import type { MofuConfig } from './types';

export const chicken1Config: MofuConfig = {
  id: 'chicken1',
  name: 'Chicken',
  frameCount: 10,
  width: 64,
  height: 64,
  animations: {
    greeting: [0, 1, 2, 3],
    walk: [4, 5, 6, 7],
    idleFront: [8, 9],
  },
  direction: 'left',
  animationSpeeds: {
    walk: 0.1,
    idleFront: 0.1,
    idleBack: 0.1,
    greeting: 0.1,
  },
};
