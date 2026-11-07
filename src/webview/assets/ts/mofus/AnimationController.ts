import type { AnimationKey, AnimationFrames } from '../../../../mofus';

type AnimationState = 'greeting-in' | 'active' | 'greeting-out' | 'hidden';

interface AnimationControllerConfig {
  animations: AnimationFrames;
  animationSpeeds: Partial<Record<AnimationKey, number>>;
  frameElements: HTMLImageElement[];
}

class AnimationController {
  private static readonly IDLE_PROBABILITY = 0.3;
  private static readonly IDLE_DIRECTION_PROBABILITY = 0.5;
  private static readonly DEFAULT_FRAME_SPEED = 0.1;

  private static hasFrames = (frames: number[] | undefined): frames is number[] =>
    Array.isArray(frames) && frames.length > 0;

  private animations: AnimationFrames;
  private animationSpeeds: Partial<Record<AnimationKey, number>>;
  private frameElements: HTMLImageElement[];

  private currentAnimation: AnimationKey = 'greeting';
  private currentAnimationFrames: number[] = [];
  private currentFrameIndex: number = 0;
  private state: AnimationState = 'greeting-in';
  private visibleFrame: HTMLImageElement | undefined;
  /**
   * Time (in reference frames) that overshot the end of the last animation cycle.
   * It is applied on the next step so that cycle boundaries, and the index resets
   * done by setAnimation() after every cycle, do not silently drop elapsed time.
   */
  private carriedFrames: number = 0;

  constructor(config: AnimationControllerConfig) {
    this.animations = config.animations;
    this.animationSpeeds = config.animationSpeeds;
    this.frameElements = config.frameElements;
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
    ].filter(AnimationController.hasFrames);

    if (candidateFrames.length === 0) {
      this.currentAnimationFrames = [0];
      this.currentFrameIndex = 0;
      this.currentAnimation = 'idleFront';
      return;
    }

    // An empty frame list (e.g. `idleFront: []`) counts as "no idle animation";
    // selecting it would show the greeting sprite and drop that step's elapsed time.
    const hasIdleFront = AnimationController.hasFrames(this.animations.idleFront);
    const hasIdleBack = AnimationController.hasFrames(this.animations.idleBack);
    if (hasIdleFront && hasIdleBack) {
      const useIdleFront = Math.random() > AnimationController.IDLE_DIRECTION_PROBABILITY;
      this.setAnimation(useIdleFront ? 'idleFront' : 'idleBack');
    } else if (hasIdleFront) {
      this.setAnimation('idleFront');
    } else if (hasIdleBack) {
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

  private showFrame = (frameNumber: number) => {
    const nextFrame = this.frameElements[frameNumber];
    if (!nextFrame || nextFrame === this.visibleFrame) {
      return;
    }
    if (this.visibleFrame) {
      this.visibleFrame.style.display = 'none';
    }
    nextFrame.style.display = 'block';
    this.visibleFrame = nextFrame;
  };

  /**
   * Shows the current frame and advances the animation by `frameScale` reference
   * frames (1 = one 60Hz frame) plus any time carried over from the previous cycle
   * boundary. Returns true when the animation cycle completed (or on every call
   * when the current animation has no frames at all).
   */
  public updateFrame = (frameScale = 1) => {
    if (this.currentAnimationFrames.length === 0) {
      this.showFrame(0);
      return true;
    }

    const frameNumber = this.currentAnimationFrames[Math.floor(this.currentFrameIndex)];
    this.showFrame(frameNumber);

    const action = this.currentAnimation;
    const frameSpeed = this.animationSpeeds?.[action] || AnimationController.DEFAULT_FRAME_SPEED;
    this.currentFrameIndex += frameSpeed * (frameScale + this.carriedFrames);
    this.carriedFrames = 0;

    const cycleLength = this.currentAnimationFrames.length;
    if (this.currentFrameIndex >= cycleLength) {
      // Carry the overshoot (converted back to time) into the next step. Discarding
      // it would lose up to one real display frame per cycle, which makes fast
      // animations run slower on low refresh rates. The carry is capped at the
      // step's own elapsed time so it stays within the 100ms stall cap even for
      // cycles shorter than the cap.
      this.carriedFrames = Math.min((this.currentFrameIndex - cycleLength) / frameSpeed, frameScale);
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
