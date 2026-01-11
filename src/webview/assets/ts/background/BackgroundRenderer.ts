import type { SceneSpec } from '../../../../scenes/types';
import { TILE_SIZE, PIXEL_GAP_FIX, LAYER_STACK_OFFSET } from '../constants';

class BackgroundRenderer {
  private static readonly TILE_SIZE = TILE_SIZE;

  private static getRequiredElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`BackgroundRenderer: expected element with id "${id}" to exist in the DOM.`);
    }
    return element;
  }

  private backgroundEl: HTMLElement;
  private borderEl: HTMLElement;
  private groundEl: HTMLElement;
  private resizeTimeout: number | undefined;

  constructor(private scene: SceneSpec, private tiles: Record<string, string>) {
    this.backgroundEl = BackgroundRenderer.getRequiredElement('background-layer');
    this.borderEl = BackgroundRenderer.getRequiredElement('border-layer');
    this.groundEl = BackgroundRenderer.getRequiredElement('ground-layer');

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

    const backgroundTileNum = this.scene.background.numTile;
    // When background.numTile is -1 (or undefined), use dynamic sizing based on available height.
    // Otherwise, treat background.numTile as the explicit number of tiles.
    const backgroundHeight =
      backgroundTileNum === -1 || backgroundTileNum === undefined
        ? Math.max(0, panelHeight - groundHeight - borderHeight + PIXEL_GAP_FIX)
        : Math.max(0, tileSize * backgroundTileNum);

    const groundBottom = 0;
    const borderBottom = groundBottom + groundHeight + LAYER_STACK_OFFSET;
    const backgroundBottom = borderBottom + borderHeight + LAYER_STACK_OFFSET;

    // Ground Layer Configuration
    this.groundEl.style.height = `${groundHeight}px`;
    this.groundEl.style.bottom = `${groundBottom}px`;

    // Border Layer Configuration
    this.borderEl.style.height = `${borderHeight}px`;
    this.borderEl.style.bottom = `${borderBottom}px`;

    // Background Layer Configuration
    this.backgroundEl.style.height = `${backgroundHeight}px`;
    this.backgroundEl.style.bottom = `${backgroundBottom}px`;

    this.renderGroundLayer(this.borderEl, this.tiles.border);
    this.renderBorderLayer(this.groundEl, this.tiles.ground);
    this.renderBackgroundLayer(this.backgroundEl, this.tiles.background);
  }

  // For scalability, each layer rendering is separated into its own method
  private renderGroundLayer(element: HTMLElement, imageUrl: string) {
    element.style.backgroundImage = `url(${imageUrl})`;
    element.style.backgroundRepeat = 'repeat-x';
    element.style.backgroundSize = `${BackgroundRenderer.TILE_SIZE}px ${BackgroundRenderer.TILE_SIZE}px`;
    element.style.backgroundPosition = 'bottom left';
  }

  private renderBorderLayer(element: HTMLElement, imageUrl: string) {
    element.style.backgroundImage = `url(${imageUrl})`;
    element.style.backgroundRepeat = 'repeat-x';
    element.style.backgroundSize = `${BackgroundRenderer.TILE_SIZE}px ${BackgroundRenderer.TILE_SIZE}px`;
    element.style.backgroundPosition = 'bottom left';
  }

  private renderBackgroundLayer(element: HTMLElement, imageUrl: string) {
    element.style.backgroundImage = `url(${imageUrl})`;
    element.style.backgroundRepeat = 'repeat';
    element.style.backgroundSize = `${BackgroundRenderer.TILE_SIZE}px ${BackgroundRenderer.TILE_SIZE}px`;
    element.style.backgroundPosition = 'bottom left';
  }
}

export { BackgroundRenderer };
