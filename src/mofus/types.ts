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
  /**
   * Frames advanced per 60Hz reference frame for each animation; `walk` is also
   * the horizontal speed in px per reference frame. The webview scales these by
   * the real elapsed time, so they mean the same thing on every refresh rate.
   */
  animationSpeeds: Partial<Record<AnimationKey, number>>;
}

export type { MofuConfig, AnimationKey, AnimationFrames };
