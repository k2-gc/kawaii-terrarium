import type { SceneSpec } from '../../../../scenes/types';
import { TILE_SIZE } from '../constants';

class BackgroundRenderer {
  private static readonly TILE_SIZE = TILE_SIZE;

  private backgroundEl: HTMLElement;
  private borderEl: HTMLElement;
  private groundEl: HTMLElement;
  private resizeTimeout: number | undefined;

  constructor(private scene: SceneSpec, private tiles: Record<string, string>) {
    this.backgroundEl = document.getElementById('background-layer')!;
    this.borderEl = document.getElementById('border-layer')!;
    this.groundEl = document.getElementById('ground-layer')!;

    this.render();
    window.addEventListener('resize', () => this.handleResize());
  }

  private handleResize() {
    if (this.resizeTimeout !== undefined) {
      clearTimeout(this.resizeTimeout);
    }
    this.resizeTimeout = window.setTimeout(() => {
      this.render();
      this.resizeTimeout = undefined;
    }, 100); // Debounce resize events
  }

  private render() {
    const panelHeight = window.innerHeight;
    const tileSize = BackgroundRenderer.TILE_SIZE;

    const groundHeight = tileSize * this.scene.ground.numTile;
    const borderHeight = tileSize * this.scene.border.numTile;
    const backgroundHeight = Math.max(0, panelHeight - groundHeight - borderHeight + 2); // +2 to avoid gaps

    const groundBottom = 0;
    const borderBottom = groundBottom + groundHeight - 1; // -1 because of 0 px-origin
    const backgroundBottom = borderBottom + borderHeight - 1; // -1 because of 0 px-origin

    // Ground Layer Configuration
    this.groundEl.style.height = `${groundHeight}px`;
    this.groundEl.style.bottom = `${groundBottom}px`;
    this.groundEl.style.top = '';

    // Border Layer Configuration
    this.borderEl.style.height = `${borderHeight}px`;
    this.borderEl.style.bottom = `${borderBottom}px`;

    // Background Layer Configuration
    this.backgroundEl.style.height = `${backgroundHeight}px`;
    this.backgroundEl.style.bottom = `${backgroundBottom}px`;

    this.applyTileImage(this.borderEl, this.tiles.border);
    this.applyTileImage(this.groundEl, this.tiles.ground);
    this.applyBackground(this.backgroundEl, this.tiles.background);
  }

  private applyTileImage(element: HTMLElement, imageUrl: string) {
    element.style.backgroundImage = `url(${imageUrl})`;
    element.style.backgroundRepeat = 'repeat-x';
    const size = `${BackgroundRenderer.TILE_SIZE}px ${BackgroundRenderer.TILE_SIZE}px`;
    element.style.backgroundSize = size;
    element.style.backgroundPosition = 'bottom left';
  }

  private applyBackground(element: HTMLElement, imageUrl: string) {
    element.style.backgroundImage = `url(${imageUrl})`;
    element.style.backgroundRepeat = 'repeat';
    const size = `${BackgroundRenderer.TILE_SIZE}px ${BackgroundRenderer.TILE_SIZE}px`;
    element.style.backgroundSize = size;
    element.style.backgroundPosition = 'bottom left';
  }
}

export { BackgroundRenderer };
