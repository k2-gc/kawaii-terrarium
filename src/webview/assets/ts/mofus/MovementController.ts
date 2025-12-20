type MoveDirection = 'left' | 'right';

interface MovementControllerConfig {
  width: number;
  initialDirection: MoveDirection;
  walkSpeed: number;
}

class MovementController {
  private static readonly DEFAULT_WALK_SPEED: number = 0.2;
  private static readonly MIN_DIRECTION_CHANGE_MS = 2000;
  private static readonly MAX_DIRECTION_CHANGE_MS = 7000;

  private element: HTMLImageElement;
  private width: number;
  private initialDirection: MoveDirection;

  private x: number = 0;
  private speed: number = MovementController.DEFAULT_WALK_SPEED;
  private moveDirection: MoveDirection = 'right';
  private nextDirectionChangeAt: number = 0;

  constructor(config: MovementControllerConfig, element: HTMLImageElement) {
    this.width = config.width;
    this.initialDirection = config.initialDirection;
    this.speed = config.walkSpeed || MovementController.DEFAULT_WALK_SPEED;
    this.element = element;
    this.moveDirection = this.initialDirection;

    this.x = Math.random() * (window.innerWidth - this.width);
    this.element.style.left = `${this.x}px`;

    this.updateTransform();
  }

  public scheduleNextDirectionChange = () => {
    const randomDelay =
      Math.random() *
      (MovementController.MAX_DIRECTION_CHANGE_MS - MovementController.MIN_DIRECTION_CHANGE_MS);
    this.nextDirectionChangeAt =
      Date.now() + MovementController.MIN_DIRECTION_CHANGE_MS + randomDelay;
  };

  public updatePosition = () => {
    if (Date.now() >= this.nextDirectionChangeAt) {
      this.reverseDirection();
      this.scheduleNextDirectionChange();
    }

    const directionMultiplier = this.moveDirection === 'left' ? -1 : 1;
    this.x += this.speed * directionMultiplier;

    const maxX = Math.max(0, window.innerWidth - this.width);
    if (this.x <= 0) {
      this.x = 0;
      this.reverseDirection();
    } else if (this.x >= maxX) {
      this.x = maxX;
      this.reverseDirection();
    }
    this.element.style.left = `${this.x}px`;
  };

  public reverseDirection = () => {
    this.moveDirection = this.moveDirection === 'left' ? 'right' : 'left';
    this.updateTransform();
  };

  private updateTransform = () => {
    const shouldFlip =
      this.initialDirection === 'right'
        ? this.moveDirection === 'left'
        : this.moveDirection === 'right';
    this.element.style.transform = shouldFlip ? 'scaleX(-1)' : 'scaleX(1)';
  };
}

export { MovementController };
