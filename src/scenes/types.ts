// Projection types
export type ProjectionType = 'side' | 'isometric' | 'top-down';

export interface SceneSpec {
  id: string;
  name: string;
  projection: ProjectionType;

  background: {
    tileSet: string;
    numTile: number | -1;
  };

  border: {
    tileSet: string;
    numTile: number;
  };

  ground: {
    tileSet: string;
    numTile: number;
  };
}
