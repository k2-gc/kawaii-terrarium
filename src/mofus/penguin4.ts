import type { MofuConfig } from './types';

export const penguin4Config: MofuConfig = {
  id: 'penguin4',
  name: 'Penguin',
  frameCount: 10,
  width: 78,
  height: 78,
  animations: {
    greeting: [0, 1, 2, 3],
    walk: [4, 5, 6, 7],
    idleFront: [8, 9, 8, 9],
  },
  direction: 'left',
  animationSpeeds: {
    walk: 0.07,
    idleFront: 0.1,
    idleBack: 0.1,
    greeting: 0.05,
  },
};
