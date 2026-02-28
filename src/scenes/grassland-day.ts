import { SceneSpec } from './types';

export const grasslandDayScene: SceneSpec = {
  id: 'grassland-day',
  name: 'Grassland (Day)',
  projection: 'side',

  field: {
    tileSet: 'grassland',
    /**
     * Number of tiles to render vertically.
     * Use -1 to indicate dynamic sizing (fill remaining space).
     */
    numTile: -1, // -1 means fill remaining space
  },

  groundEdge: {
    tileSet: 'grassland-ground',
    numTile: 1,
  },

  ground: {
    tileSet: 'ground',
    numTile: 1,
  },
};
