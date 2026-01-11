import type { MofuConfig } from '../../../../mofus/types';
import { AnimationController } from './AnimationController';
import { MovementController } from './MovementController';
import { TILE_SIZE } from '../constants';

class Mofu {
  // Constants
  private static readonly MIN_ACTIVE_DURATION_MS = 60000; // 1 minute
  private static readonly MAX_ACTIVE_DURATION_MS = 180000; // 3 minutes

  private config: MofuConfig;
  private element: HTMLImageElement;
  private animationController: AnimationController;
  private movementController: MovementController;
  private onDismissed: () => void;

  private activeStateDuration: number = 0;

  constructor(
    config: MofuConfig,
    frames: string[],
    groundTileNum: number,
    borderTileNum: number,
    onDismissed: () => void
  ) {
    this.config = config;
    this.onDismissed = onDismissed;

    // Create Image Element
    this.element = document.createElement('img');
    this.element.style.position = 'absolute';
    this.element.style.width = `${this.config.width}px`;
    this.element.style.height = 'auto';
    this.element.style.imageRendering = 'pixelated';
    this.element.style.pointerEvents = 'none';
    const groundOffset = TILE_SIZE * groundTileNum;
    const borderOffset = TILE_SIZE * borderTileNum;
    const mofuOffset = groundOffset + Math.floor(borderOffset / 2);
    this.element.style.bottom = `${mofuOffset}px`;
    document.body.appendChild(this.element);

    this.animationController = new AnimationController(
      {
        animations: config.animations,
        animationSpeeds: config.animationSpeeds,
        frames: frames,
      },
      this.element
    );

    this.movementController = new MovementController(
      {
        width: this.config.width,
        initialDirection: this.config.direction,
        walkSpeed: this.config.animationSpeeds.walk || 0.2,
      },
      this.element
    );

    this.animationController.startGreetingIn();
    this.animate();
  }

  private animate = () => {
    const state = this.animationController.getState();

    if (state === 'hidden') {
      return;
    }

    const animationCompleted = this.animationController.updateFrame();

    if (animationCompleted) {
      this.onAnimationComplete();
    }

    if (state === 'active' && this.animationController.getCurrentAnimation() === 'walk') {
      this.movementController.updatePosition();
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
