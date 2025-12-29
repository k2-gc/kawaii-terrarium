import * as vscode from 'vscode';
import { getWebviewHtml } from './getWebviewHtml';

export class KawaiiTerrariumViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'kawaii-terrarium-secondary-sidebar-view';

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    webviewView.webview.html = await this.getHtmlForWebview(webviewView.webview);
  }

  private async getHtmlForWebview(webview: vscode.Webview): Promise<string> {
    return getWebviewHtml(webview, this.context.extensionUri);
  }
}
