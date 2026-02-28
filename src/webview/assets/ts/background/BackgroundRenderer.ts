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

  private fieldEl: HTMLElement;
  private groundEdgeEl: HTMLElement;
  private groundEl: HTMLElement;
  private resizeTimeout: number | undefined;

  constructor(
    private scene: SceneSpec,
    private tiles: Record<string, string>,
  ) {
    this.fieldEl = BackgroundRenderer.getRequiredElement('field-layer');
    this.groundEdgeEl = BackgroundRenderer.getRequiredElement('ground-edge-layer');
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
    const groundEdgeHeight = tileSize * this.scene.groundEdge.numTile;

    const fieldTileNum = this.scene.field.numTile;
    // When field.numTile is -1 (or undefined), use dynamic sizing based on available height.
    // Otherwise, treat field.numTile as the explicit number of tiles.
    const fieldHeight =
      fieldTileNum === -1 || fieldTileNum === undefined
        ? Math.max(0, panelHeight - groundHeight - groundEdgeHeight + PIXEL_GAP_FIX)
        : Math.max(0, tileSize * fieldTileNum);

    const groundBottom = 0;
    const groundEdgeBottom = groundBottom + groundHeight + LAYER_STACK_OFFSET;
    const fieldBottom = groundEdgeBottom + groundEdgeHeight + LAYER_STACK_OFFSET;

    // Ground Layer Configuration
    this.groundEl.style.height = `${groundHeight}px`;
    this.groundEl.style.bottom = `${groundBottom}px`;

    // GroundEdge Layer Configuration
    this.groundEdgeEl.style.height = `${groundEdgeHeight}px`;
    this.groundEdgeEl.style.bottom = `${groundEdgeBottom}px`;

    // Field Layer Configuration
    this.fieldEl.style.height = `${fieldHeight}px`;
    this.fieldEl.style.bottom = `${fieldBottom}px`;

    this.renderGroundEdgeLayer(this.groundEdgeEl, this.tiles.groundEdge);
    this.renderGroundLayer(this.groundEl, this.tiles.ground);
    this.renderFieldLayer(this.fieldEl, this.tiles.field);
  }

  // For scalability, each layer rendering is separated into its own method
  private renderGroundLayer(element: HTMLElement, imageUrl: string) {
    element.style.backgroundImage = `url(${imageUrl})`;
    element.style.backgroundRepeat = 'repeat-x';
    element.style.backgroundSize = `${BackgroundRenderer.TILE_SIZE}px ${BackgroundRenderer.TILE_SIZE}px`;
    element.style.backgroundPosition = 'bottom left';
  }

  private renderGroundEdgeLayer(element: HTMLElement, imageUrl: string) {
    element.style.backgroundImage = `url(${imageUrl})`;
    element.style.backgroundRepeat = 'repeat-x';
    element.style.backgroundSize = `${BackgroundRenderer.TILE_SIZE}px ${BackgroundRenderer.TILE_SIZE}px`;
    element.style.backgroundPosition = 'bottom left';
  }

  private renderFieldLayer(element: HTMLElement, imageUrl: string) {
    element.style.backgroundImage = `url(${imageUrl})`;
    element.style.backgroundRepeat = 'repeat';
    element.style.backgroundSize = `${BackgroundRenderer.TILE_SIZE}px ${BackgroundRenderer.TILE_SIZE}px`;
    element.style.backgroundPosition = 'bottom left';
  }
}

export { BackgroundRenderer };
