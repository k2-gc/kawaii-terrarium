import type { AnimationKey, AnimationFrames } from '../../../../mofus';

type AnimationState = 'greeting-in' | 'active' | 'greeting-out' | 'hidden';

interface AnimationControllerConfig {
  animations: AnimationFrames;
  animationSpeeds: Partial<Record<AnimationKey, number>>;
  frames: string[];
}

class AnimationController {
  private static readonly IDLE_PROBABILITY = 0.3;
  private static readonly IDLE_DIRECTION_PROBABILITY = 0.5;
  private static readonly DEFAULT_FRAME_SPEED = 0.1;

  private animations: AnimationFrames;
  private animationSpeeds: Partial<Record<AnimationKey, number>>;
  private frames: string[];
  private element: HTMLImageElement;

  private currentAnimation: AnimationKey = 'greeting';
  private currentAnimationFrames: number[] = [];
  private currentFrameIndex: number = 0;
  private state: AnimationState = 'greeting-in';

  constructor(config: AnimationControllerConfig, element: HTMLImageElement) {
    this.animations = config.animations;
    this.animationSpeeds = config.animationSpeeds;
    this.frames = config.frames;
    this.element = element;
  }

  public startGreetingIn = () => {
    this.state = 'greeting-in';
    const greetingFrames = this.animations.greeting;
    if (greetingFrames && greetingFrames.length > 0) {
      this.setAnimation('greeting');
    } else {
      this.currentAnimation = 'greeting';
      this.currentAnimationFrames = [0];
      this.currentFrameIndex = 0;
    }
  };

  public startGreetingOut = () => {
    this.state = 'greeting-out';
    this.currentAnimation = 'greeting';
    const greetingFrames = this.animations.greeting;
    this.currentAnimationFrames =
      greetingFrames && greetingFrames.length > 0 ? [...greetingFrames].reverse() : [0];
    this.currentFrameIndex = 0;
  };

  public enterActiveState = () => {
    this.state = 'active';
  };

  public setAnimation = (key: AnimationKey) => {
    this.currentAnimation = key;
    this.currentAnimationFrames = this.animations[key] || [];
    this.currentFrameIndex = 0;
  };

  public selectRandomIdleAnimation = () => {
    const candidateFrames = [
      this.animations.idleFront,
      this.animations.idleBack,
      this.animations.walk,
    ].filter((frames): frames is number[] => Array.isArray(frames) && frames.length > 0);

    if (candidateFrames.length === 0) {
      this.currentAnimationFrames = [0];
      this.currentFrameIndex = 0;
      this.currentAnimation = 'idleFront';
      return;
    }

    if (this.animations.idleFront && this.animations.idleBack) {
      const useIdleFront = Math.random() > AnimationController.IDLE_DIRECTION_PROBABILITY;
      this.setAnimation(useIdleFront ? 'idleFront' : 'idleBack');
    } else if (this.animations.idleFront) {
      this.setAnimation('idleFront');
    } else if (this.animations.idleBack) {
      this.setAnimation('idleBack');
    } else {
      this.setAnimation('walk');
    }
  };

  public selectRandomAnimation = () => {
    const shouldWalk = Math.random() > AnimationController.IDLE_PROBABILITY;
    if (shouldWalk && this.animations.walk && this.animations.walk.length > 0) {
      this.setAnimation('walk');
      return;
    }
    this.selectRandomIdleAnimation();
  };

  public updateFrame = () => {
    if (this.currentAnimationFrames.length === 0) {
      this.element.src = this.frames[0];
      return true;
    }

    const frameNumber = this.currentAnimationFrames[Math.floor(this.currentFrameIndex)];
    this.element.src = this.frames[frameNumber];

    const action = this.currentAnimation;
    const frameSpeed = this.animationSpeeds?.[action] || AnimationController.DEFAULT_FRAME_SPEED;
    this.currentFrameIndex += frameSpeed;

    if (this.currentFrameIndex >= this.currentAnimationFrames.length) {
      this.currentFrameIndex = 0;
      return true; // Animation cycle completed
    }
    return false; // Animation still in progress
  };

  public getCurrentAnimation = (): AnimationKey => {
    return this.currentAnimation;
  };

  public getState = (): AnimationState => {
    return this.state;
  };

  public hide = () => {
    this.state = 'hidden';
  };
}

export { AnimationController };
export type { AnimationState };
