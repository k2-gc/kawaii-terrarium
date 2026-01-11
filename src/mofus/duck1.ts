import type { MofuConfig } from './types';

export const duck1Config: MofuConfig = {
  id: 'duck1',
  name: 'Duck',
  frameCount: 6,
  width: 64,
  height: 64,
  animations: {
    greeting: [0, 1, 0, 1],
    walk: [2, 3, 4, 5],
    idleFront: [],
  },
  direction: 'left',
  animationSpeeds: {
    walk: 0.1,
    idleFront: 0.1,
    idleBack: 0.1,
    greeting: 0.1,
  },
};
