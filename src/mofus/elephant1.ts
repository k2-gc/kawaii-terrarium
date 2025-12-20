import type { MofuConfig } from './types';

export const elephant1Config: MofuConfig = {
  id: 'elephant1',
  name: 'Elephant',
  frameCount: 8,
  width: 128,
  height: 128,
  animations: {
    greeting: [0, 1, 0, 1],
    walk: [2, 3, 4, 5],
    idleFront: [6, 7, 6, 7],
  },
  direction: 'left',
  animationSpeeds: {
    walk: 0.05,
    idleFront: 0.1,
    idleBack: 0.1,
    greeting: 0.07,
  },
};
