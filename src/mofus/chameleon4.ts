import type { MofuConfig } from './types';

export const chameleon4Config: MofuConfig = {
  id: 'chameleon4',
  name: 'Chameleon',
  frameCount: 13,
  width: 64,
  height: 64,
  animations: {
    greeting: [0, 1, 0, 1],
    walk: [2, 3, 4, 5],
    idleFront: [6, 7, 8, 9, 10, 11, 12],
  },
  direction: 'left',
  animationSpeeds: {
    walk: 0.05,
    idleFront: 0.02,
    idleBack: 0.1,
    greeting: 0.1,
  },
};
