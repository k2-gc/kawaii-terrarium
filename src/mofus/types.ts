type Direction = 'left' | 'right';

type AnimationKey = 'greeting' | 'walk' | 'idleFront' | 'idleBack';
type AnimationFrames = Partial<Record<AnimationKey, number[]>>;

interface SpriteConfig {
  frameCount: number;
  width: number;
  height: number;
}

interface MofuConfig extends SpriteConfig {
  id: string;
  name: string;
  animations: AnimationFrames;
  direction: Direction;
  animationSpeeds: Partial<Record<AnimationKey, number>>;
}

export type { MofuConfig, AnimationKey, AnimationFrames };
