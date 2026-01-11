import * as vscode from 'vscode';
import { KawaiiTerrariumViewProvider } from './webview/KawaiiTerrariumViewProvider';

export function activate(context: vscode.ExtensionContext) {
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
