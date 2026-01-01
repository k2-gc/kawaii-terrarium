import { cat1Config } from './cat1';
import { cat2Config } from './cat2';
import { squirrel1Config } from './squirrel1';
import { squirrel2Config } from './squirrel2';
import { hedgehog1Config } from './hedgehog1';
import { hedgehog2Config } from './hedgehog2';
import { elephant1Config } from './elephant1';
import { elephant2Config } from './elephant2';
import { tortoise1Config } from './tortoise1';
import { turtle1Config } from './turtle1';
import { horse1Config } from './horse1';
import { horse2Config } from './horse2';
import { horse3Config } from './horse3';
import type { MofuConfig } from './types';

export const MOFU_CONFIGS: MofuConfig[] = [
  cat1Config,
  cat2Config,
  squirrel1Config,
  squirrel2Config,
  hedgehog1Config,
  hedgehog2Config,
  elephant1Config,
  elephant2Config,
  tortoise1Config,
  turtle1Config,
  horse1Config,
  horse2Config,
  horse3Config,
];

export type { AnimationKey, MofuConfig, AnimationFrames } from './types';
