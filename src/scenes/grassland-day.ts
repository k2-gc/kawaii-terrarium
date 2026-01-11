import { SceneSpec } from './typs';

export const grasslandDayScene: SceneSpec = {
  id: 'grassland-day',
  name: 'Grassland (Day)',
  projection: 'side',

  background: {
    tileSet: 'grassland',
    numTile: -1,
  },

  border: {
    tileSet: 'grassland-ground',
    numTile: 1,
  },

  ground: {
    tileSet: 'ground',
    numTile: 1,
  },
};
