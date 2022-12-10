import { ExtensionContext } from 'vscode';
import * as vscode from 'vscode';

import logger from '../utils/logger';
import { prefix } from '../utils/prefix';
export default function initCommands(context: ExtensionContext) {
  loadCommands(
    (require as any).context(
      // Look for files in the commands directory
      './',
      // Do not look in subdirectories
      false,
      // Only include "_base-" prefixed .vue files
      /command.*.ts$/
    ),
    /command(.*)/,
    context
  );
}

async function loadCommands(requireContext, nameRegex, context: ExtensionContext) {
  requireContext.keys().forEach(fileName => {
    const clearName = fileName
      // Remove the "./" from the beginning
      .replace(/^\.\//, '')
      // Remove the file extension from the end
      .replace(/\.\w+$/, '');

    const match = nameRegex.exec(clearName);
    if (!match || !match[1]) {
      logger.warn(`Command name not found from ${fileName}`);
      return;
    }

    const commandOption = requireContext(fileName).default;
    //commandOption.name = nomalizeCommandName(match[1]);
    try {
        let commandName = prefix + '.' +  commandOption.name;
        let disposable = vscode.commands.registerCommand(commandName, commandOption.handle);
        context.subscriptions.push(disposable);
      // tslint:disable-next-line variable-name
      logger.debug(`register command "${commandName}" from "${fileName}"`);
    } catch (error) {
      logger.error(error, `load command "${fileName}"`);
    }
  });
}
