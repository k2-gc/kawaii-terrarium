import type { MofuConfig } from './types';

export const cat2Config: MofuConfig = {
  id: 'cat2',
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
    walk: 0.2,
    idleFront: 0.1,
    idleBack: 0.1,
    greeting: 0.15,
  },
};
