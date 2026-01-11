import { grasslandDayScene } from './grassland-day';
import type { SceneSpec } from './typs';

export const SCENE_SPEC_CONFIGS: SceneSpec[] = [
  grasslandDayScene,
  //   grasslandDayScene,
];

export const DEFAULT_SCENE = grasslandDayScene;

export type { SceneSpec, ProjectionType } from './typs';
