import type { MofuConfig } from '../../../../mofus/types';
import { AnimationController } from './AnimationController';
import { MovementController } from './MovementController';
import { getFrameElements, waitForFrames } from './FrameLoader';
import { TILE_SIZE, REFERENCE_FRAME_MS, MAX_FRAME_DELTA_MS } from '../constants';

class Mofu {
  // Constants
  private static readonly MIN_ACTIVE_DURATION_MS = 60000; // 1 minute
  private static readonly MAX_ACTIVE_DURATION_MS = 180000; // 3 minutes

  private config: MofuConfig;
  private element: HTMLDivElement;
  private animationController: AnimationController;
  private movementController: MovementController;
  private onDismissed: () => void;

  private activeStateDuration: number = 0;
  private lastFrameTime: number | undefined;

  constructor(
    config: MofuConfig,
    frames: string[],
    groundTileNum: number,
    groundEdgeTileNum: number,
    onDismissed: () => void,
  ) {
    this.config = config;
    this.onDismissed = onDismissed;

    // Every frame lives in the DOM as its own image; only one is shown at a time
    const frameElements = getFrameElements(frames);

    // Create Container Element
    this.element = document.createElement('div');
    this.element.style.position = 'absolute';
    this.element.style.width = `${this.config.width}px`;
    this.element.style.pointerEvents = 'none';
    frameElements.forEach((frame) => this.element.appendChild(frame));

    // Calculate vertical offset based on ground and groundEdge tiles
    const groundOffset = TILE_SIZE * groundTileNum;
    const groundEdgeOffset = TILE_SIZE * groundEdgeTileNum;
    /**
     * Mofu vertical offset calculation:
     * Expected bottom-half of groundEdge height belongs to ground part,
     * so we add half of groundEdgeOffset to groundOffset for correct positioning.
     */
    const mofuOffset = groundOffset + Math.floor(groundEdgeOffset / 2);
    this.element.style.bottom = `${mofuOffset}px`;
    document.body.appendChild(this.element);

    this.animationController = new AnimationController({
      animations: config.animations,
      animationSpeeds: config.animationSpeeds,
      frameElements: frameElements,
    });

    this.movementController = new MovementController(
      {
        width: this.config.width,
        initialDirection: this.config.direction,
        walkSpeed: this.config.animationSpeeds.walk || 0.2,
      },
      this.element,
    );

    this.animationController.startGreetingIn();
    /**
     * Wait for every frame before animating. A Mofu that starts moving while
     * its frames are still loading shows whichever frame loaded first until the
     * rest arrive, which reads as a walking Mofu stuck on its idle sprite.
     * The loop is entered through requestAnimationFrame (not `.then(this.animate)`)
     * because animate needs the frame timestamp that rAF passes to it.
     */
    waitForFrames(frameElements).then(() => requestAnimationFrame(this.animate));
  }

  private animate = (timestamp: number) => {
    const state = this.animationController.getState();

    if (state === 'hidden') {
      return;
    }

    /**
     * Scale the per-frame speeds by the real elapsed time so the result does not
     * depend on the display refresh rate (1 = one 60Hz frame). The first frame
     * has no previous timestamp and counts as one reference frame; so does any
     * call without a usable timestamp, so a bad value can never poison the loop.
     */
    const hasTimestamp = Number.isFinite(timestamp);
    const elapsed =
      hasTimestamp && this.lastFrameTime !== undefined
        ? timestamp - this.lastFrameTime
        : REFERENCE_FRAME_MS;
    this.lastFrameTime = hasTimestamp ? timestamp : undefined;
    const frameScale = Math.min(Math.max(elapsed, 0), MAX_FRAME_DELTA_MS) / REFERENCE_FRAME_MS;

    const animationCompleted = this.animationController.updateFrame(frameScale);

    if (animationCompleted) {
      this.onAnimationComplete();
    }

    if (state === 'active' && this.animationController.getCurrentAnimation() === 'walk') {
      this.movementController.updatePosition(frameScale);
    }

    requestAnimationFrame(this.animate);
  };

  private onAnimationComplete() {
    const state = this.animationController.getState();

    switch (state) {
      case 'greeting-in':
        this.enterActiveState();
        break;
      case 'active':
        if (Date.now() >= this.activeStateDuration) {
          this.animationController.startGreetingOut();
        } else {
          this.animationController.selectRandomAnimation();
        }
        break;
      case 'greeting-out':
        this.animationController.hide();
        this.cleanup();
        this.onDismissed();
        console.log(`Animal ${this.config.name} says see-ya!`);
        break;
    }
  }

  private cleanup() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  private enterActiveState() {
    this.animationController.enterActiveState();
    const randomDuration =
      Math.random() * (Mofu.MAX_ACTIVE_DURATION_MS - Mofu.MIN_ACTIVE_DURATION_MS);
    this.activeStateDuration = Date.now() + Mofu.MIN_ACTIVE_DURATION_MS + randomDuration;
    this.movementController.scheduleNextDirectionChange();
    this.animationController.selectRandomAnimation();
  }

  public dismissMofu() {
    this.animationController.startGreetingOut();
  }
}

export { Mofu };
