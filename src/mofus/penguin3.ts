import type { MofuConfig } from './types';

export const penguin3Config: MofuConfig = {
  id: 'penguin3',
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
    walk: 0.02,
    idleFront: 0.05,
    idleBack: 0.1,
    greeting: 0.05,
  },
};
