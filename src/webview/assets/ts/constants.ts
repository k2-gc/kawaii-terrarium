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

/**
 * Duration of one frame on the 60Hz display the Mofu configs were tuned on.
 * `animationSpeeds` (and the walk speed derived from it) are defined "per 60Hz
 * frame"; the animation loop scales them by the real elapsed time so Mofus move
 * at the same speed on 120Hz or throttled displays.
 */
export const REFERENCE_FRAME_MS = 1000 / 60;

/**
 * Upper bound for the newly elapsed time applied in a single animation step. After
 * a stall (hidden window, heavy load) the next frame advances by at most this much
 * instead of making Mofus jump across the panel.
 */
export const MAX_FRAME_DELTA_MS = 100;
