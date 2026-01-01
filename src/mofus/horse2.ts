import type { MofuConfig } from './types';

export const horse2Config: MofuConfig = {
  id: 'horse2',
  name: 'Horse',
  frameCount: 8,
  width: 96,
  height: 96,
  animations: {
    greeting: [0, 1, 0, 1],
    walk: [2, 3, 4, 5],
    idleFront: [6, 7, 6, 7],
  },
  direction: 'left',
  animationSpeeds: {
    walk: 0.1,
    idleFront: 0.1,
    idleBack: 0.1,
    greeting: 0.07,
  },
};
