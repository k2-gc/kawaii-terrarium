import * as vscode from 'vscode';
import * as fs from 'fs';
import { getUri, getNonce } from './webviewUtils';
import { MOFU_CONFIGS } from '../mofus';

const FALLBACK_HTML =
  '<!DOCTYPE html><html><body><p>Failed to load webview content.</p></body></html>';
const htmlTemplateCache = new Map<string, string>();

const getWebviewHtml = async (
  webview: vscode.Webview,
  extensionUri: vscode.Uri
): Promise<string> => {
  const template = await loadHtmlTemplate(extensionUri);
  if (!template) {
    return FALLBACK_HTML;
  }
  try {
    const nonce = getNonce();
    const cspSource = webview.cspSource;
    const cssUri = getUri(webview, extensionUri, ['src', 'webview', 'assets', 'css', 'styles.css']);
    const jsUri = getUri(webview, extensionUri, ['out', 'webview', 'main.js']);

    const mofuConfigs = MOFU_CONFIGS;
    const mofuFramesList = mofuConfigs.map((config) =>
      loadMofuFrames(webview, extensionUri, config.id, config.frameCount)
    );

    // Escape JSON for safe HTML embedding
    const escapeJson = <T>(obj: T): string => {
      return JSON.stringify(obj)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');
    };

    // Replace placeholders
    const html = template
      .replace(/{{nonce}}/g, nonce)
      .replace(/{{cspSource}}/g, cspSource)
      .replace(/{{cssUri}}/g, cssUri.toString())
      .replace(/{{jsUri}}/g, jsUri.toString())
      .replace(/{{mofuConfigsJson}}/g, escapeJson(mofuConfigs))
      .replace(/{{mofuFramesListJson}}/g, escapeJson(mofuFramesList));

    return html;
  } catch (error) {
    console.error('Error generating webview HTML:', error);
    return FALLBACK_HTML;
  }
};

const loadHtmlTemplate = async (extensionUri: vscode.Uri): Promise<string | undefined> => {
  const cacheKey = extensionUri.fsPath;
  if (htmlTemplateCache.has(cacheKey)) {
    return htmlTemplateCache.get(cacheKey);
  }

  const htmlPath = vscode.Uri.joinPath(extensionUri, 'src', 'webview', 'index.html');
  try {
    const template = await fs.promises.readFile(htmlPath.fsPath, 'utf8');
    htmlTemplateCache.set(cacheKey, template);
    return template;
  } catch (error) {
    console.error('Failed to read webview HTML:', error);
    vscode.window.showErrorMessage('Failed to load Kawaii Terrarium webview HTML.');
    return undefined;
  }
};

const loadMofuFrames = (
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  mofuId: string,
  frameCount: number
): string[] => {
  return Array.from({ length: frameCount }, (_, i) =>
    webview
      .asWebviewUri(
        vscode.Uri.joinPath(
          extensionUri,
          'media',
          'mofus',
          mofuId,
          `frame_${String(i).padStart(3, '0')}.png`
        )
      )
      .toString()
  );
};

export { getWebviewHtml };
