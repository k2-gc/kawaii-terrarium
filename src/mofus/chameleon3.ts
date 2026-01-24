import type { MofuConfig } from './types';

export const chameleon3Config: MofuConfig = {
  id: 'chameleon3',
  name: 'Chameleon',
  frameCount: 16,
  width: 64,
  height: 64,
  animations: {
    greeting: [0, 1, 0, 1],
    walk: [2, 3, 4, 5],
    idleFront: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  },
  direction: 'left',
  animationSpeeds: {
    walk: 0.05,
    idleFront: 0.02,
    idleBack: 0.1,
    greeting: 0.1,
  },
};
