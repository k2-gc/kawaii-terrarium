import type { MofuConfig } from './types';

export const cat3Config: MofuConfig = {
  id: 'cat3',
  name: 'Cat',
  frameCount: 8,
  width: 64,
  height: 64,
  animations: {
    greeting: [6, 7, 6, 7],
    walk: [0, 1, 2, 3],
    idleFront: [4, 5, 4, 5],
  },
  direction: 'right',
  animationSpeeds: {
    walk: 0.1,
    idleFront: 0.05,
    idleBack: 0.05,
    greeting: 0.1,
  },
};
