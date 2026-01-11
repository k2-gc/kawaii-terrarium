export const TILE_SIZE = 32;

/**
 * Pixel adjustment to avoid 1px gaps between stacked layers.
 * This value may need to be tuned for pixel-perfect rendering on all platforms.
 */
export const PIXEL_GAP_FIX = 2;

/**
 * Offset for stacking layers using CSS bottom property.
 * -1 is required because CSS bottom is 0-based, but height is pixel count.
 */
export const LAYER_STACK_OFFSET = -1;
