import * as vscode from 'vscode';
import { KawaiiTerrariumViewProvider } from './webview/KawaiiTerrariumViewProvider';
import { getWebviewHtml } from './webview/getWebviewHtml';

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

      panel.webview.html = await getWebviewHtml(panel.webview, context.extensionUri);

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

  const viewProvider = vscode.window.registerWebviewViewProvider(
    KawaiiTerrariumViewProvider.viewType,
    new KawaiiTerrariumViewProvider(context)
  );
  context.subscriptions.push(viewProvider);

  const viewCommand = vscode.commands.registerCommand('kawaii-terrarium.summonMofus', () => {
    vscode.commands.executeCommand('workbench.view.extension.kawaii-terrarium-secondary-sidebar');
  });
  context.subscriptions.push(viewCommand);
}
