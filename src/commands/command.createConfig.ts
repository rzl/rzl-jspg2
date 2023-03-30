import * as vscode from 'vscode';
import { 
  getWorkspaceFolders,
  showConfirmMessage,
  showOpenDialog,
  openFolder,
  addWorkspaceFolder
}
 from '../utils/host';

import { Config, defaultConfig, CONFIG_PATH } from '../helper/Config';
// eslint-disable-next-line @typescript-eslint/naming-convention
var config = new Config({ defaultConfig, CONFIG_PATH});

export default {
    name: 'createConfig',
    async handle() {
		vscode.window.showInformationMessage('createConfig!');
    const workspaceFolders = getWorkspaceFolders();
    if (!workspaceFolders) {
      const result = await showConfirmMessage(
        'jspg2 expects to work at a folder.',
        'Open Folder',
        'Ok'
      );

      if (!result) {
        return;
      }

      return openFolder();
    }

    if (workspaceFolders.length <= 0) {
      const result = await showConfirmMessage(
        'There are no available folders in current workspace.',
        'Add Folder to Workspace',
        'Ok'
      );

      if (!result) {
        return;
      }

      const resources = await showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: true,
      });

      if (!resources) {
        return;
      }

      addWorkspaceFolder(...resources.map(uri => ({ uri })));
      return;
    }

    if (workspaceFolders.length === 1) {
      config.newConfig(workspaceFolders[0].uri.fsPath);
      return;
    }

    const initDirs = workspaceFolders.map(folder => ({
      value: folder.uri.fsPath,
      label: folder.name,
      description: folder.uri.fsPath,
    }));

    vscode.window
      .showQuickPick(initDirs, {
        placeHolder: 'Select a folder...',
      })
      .then(item => {
        if (item === undefined) {
          return;
        }

        config.newConfig(item.value);
      });
  
    }
};