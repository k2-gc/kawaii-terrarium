/**
 * Frame images are kept as live <img> elements instead of plain URLs.
 *
 * Assigning a URL to `img.src` starts a fetch through the webview resource
 * protocol, and the element keeps showing its previous image until that fetch
 * completes. A fast walk cycle swaps frames every ~40ms, which is short enough
 * that each load gets aborted by the next one and the Mofu appears frozen on
 * whichever frame happened to load last. Loading every frame up front and only
 * toggling visibility afterwards removes image loading from the animation loop.
 *
 * Elements are cached per URL and reused across summons, so each frame is
 * fetched once per webview lifetime. This is safe because MofuKeeper never
 * keeps two instances of the same Mofu id alive at the same time, and frame
 * URLs are unique per Mofu id.
 */

const frameElementCache = new Map<string, HTMLImageElement>();

const createFrameElement = (url: string): HTMLImageElement => {
  const element = document.createElement('img');
  element.style.width = '100%';
  element.style.height = 'auto';
  element.style.imageRendering = 'pixelated';
  element.style.pointerEvents = 'none';
  element.src = url;
  return element;
};

/**
 * Returns the frame elements for the given URLs, creating them on first use.
 * Every returned element is hidden so that a re-summoned Mofu starts from a
 * clean state instead of inheriting the frame left visible by its last run.
 */
const getFrameElements = (urls: string[]): HTMLImageElement[] => {
  return urls.map((url) => {
    let element = frameElementCache.get(url);
    if (!element) {
      element = createFrameElement(url);
      frameElementCache.set(url, element);
    }
    element.style.display = 'none';
    return element;
  });
};

/**
 * Resolves once every frame is loaded and decoded. Failures are ignored so a
 * single broken frame cannot keep a Mofu from ever appearing.
 */
const waitForFrames = async (elements: HTMLImageElement[]): Promise<void> => {
  await Promise.all(elements.map((element) => element.decode().catch(() => undefined)));
};

export { getFrameElements, waitForFrames };
