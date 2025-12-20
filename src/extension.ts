import * as vscode from 'vscode';
import * as fs from 'fs';
import { getUri, getNonce } from './utils/webview';
import { MOFU_CONFIGS } from './mofus';

const FALLBACK_HTML =
  '<!DOCTYPE html><html><body><p>Failed to load webview content.</p></body></html>';
const htmlTemplateCache = new Map<string, string>();

export function activate(context: vscode.ExtensionContext) {
  let panel: vscode.WebviewPanel | undefined = undefined;
  let dismissFallbackTimer: NodeJS.Timeout | undefined = undefined;

  const clearDismissFallback = () => {
    if (dismissFallbackTimer) {
      clearTimeout(dismissFallbackTimer);
      dismissFallbackTimer = undefined;
    }
  };

  const scheduleDismissFallback = () => {
    clearDismissFallback();
    dismissFallbackTimer = setTimeout(() => {
      console.warn('Dismiss fallback triggered; disposing panel forcefully.');
      panel?.dispose();
      dismissFallbackTimer = undefined;
    }, 10000);
  };

  type WebviewMessage = { command: 'allMofusDismissed' };
  const isWebviewMessage = (message: unknown): message is WebviewMessage => {
    if (typeof message !== 'object' || message === null) {
      return false;
    }
    return (message as Partial<WebviewMessage>).command === 'allMofusDismissed';
  };

  const summonCommand = vscode.commands.registerCommand(
    'kawaii-terrarium.summonFriend',
    async () => {
      if (panel) {
        panel.reveal(panel.viewColumn ?? vscode.ViewColumn.Beside, true);
        return;
      }
      const targetColumn = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.Beside;
      panel = vscode.window.createWebviewPanel(
        'kawaiiTerrarium',
        'Kawaii Terrarium',
        targetColumn,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'out'),
            vscode.Uri.joinPath(context.extensionUri, 'src', 'webview'),
            vscode.Uri.joinPath(context.extensionUri, 'media'),
          ],
        }
      );

      try {
        panel.webview.html = await getWebviewHtml(panel.webview, context.extensionUri);
      } catch (error) {
        console.error('Failed to build webview HTML:', error);
        panel.webview.html = FALLBACK_HTML;
      }

      panel.onDidDispose(() => {
        panel = undefined;
        clearDismissFallback();
      });

      // Listen for messages from webview
      panel.webview.onDidReceiveMessage((message) => {
        if (!isWebviewMessage(message)) {
          console.warn('Ignored unknown webview message', message);
          return;
        }
        clearDismissFallback();
        panel?.dispose();
      });
    }
  );
  context.subscriptions.push(summonCommand);

  const dismissCommand = vscode.commands.registerCommand('kawaii-terrarium.dismissFriend', () => {
    if (panel) {
      panel.webview.postMessage({ command: 'dismissAll' });
      scheduleDismissFallback();
    }
  });
  context.subscriptions.push(dismissCommand);

  const toggleCommand = vscode.commands.registerCommand('kawaii-terrarium.toggleFriend', () => {
    if (panel) {
      vscode.commands.executeCommand('kawaii-terrarium.dismissFriend');
    } else {
      vscode.commands.executeCommand('kawaii-terrarium.summonFriend');
    }
  });
  context.subscriptions.push(toggleCommand);

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.text = 'TerraKawa';
  statusBar.tooltip = 'Kawaii Terrarium: Toggle Friend';
  statusBar.command = 'kawaii-terrarium.toggleFriend';
  statusBar.show();
  context.subscriptions.push(statusBar);
}

const getWebviewHtml = async (
  webview: vscode.Webview,
  extensionUri: vscode.Uri
): Promise<string> => {
  const template = await loadHtmlTemplate(extensionUri);
  if (!template) {
    return FALLBACK_HTML;
  }
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
